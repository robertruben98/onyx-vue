import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, ref } from "vue";
import Countdown, { formatCountdown, speakCountdown, splitCountdown } from "./Countdown.vue";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 25, 21, 0, 0);

describe("countdown maths", () => {
  it("auto drops leading zero units and rounds the smallest one up", () => {
    expect(splitCountdown(13 * HOUR + 17 * MIN + 30_000)).toEqual([
      { unit: "hours", amount: 13 },
      { unit: "minutes", amount: 18 },
    ]);
    expect(splitCountdown(2 * DAY + 5 * MIN)).toEqual([
      { unit: "days", amount: 2 },
      { unit: "hours", amount: 0 },
      { unit: "minutes", amount: 5 },
    ]);
    expect(splitCountdown(30_000)).toEqual([{ unit: "minutes", amount: 1 }]);
    expect(splitCountdown(0)).toEqual([{ unit: "minutes", amount: 0 }]);
  });

  it("rounding up carries into the next unit", () => {
    expect(splitCountdown(HOUR - 1)).toEqual([{ unit: "hours", amount: 1 }, { unit: "minutes", amount: 0 }]);
  });

  it("explicit units keep their zeros and fold missing units into larger ones", () => {
    expect(splitCountdown(50 * HOUR, ["hours", "minutes"])).toEqual([
      { unit: "hours", amount: 50 },
      { unit: "minutes", amount: 0 },
    ]);
    expect(splitCountdown(4 * MIN + 5_000, ["minutes", "seconds"])).toEqual([
      { unit: "minutes", amount: 4 },
      { unit: "seconds", amount: 5 },
    ]);
  });

  it("formats long and short", () => {
    const p = splitCountdown(13 * HOUR + 18 * MIN);
    expect(formatCountdown(p, "long")).toBe("13 h 18 min");
    expect(formatCountdown(p, "short")).toBe("13:18");
    expect(formatCountdown(splitCountdown(2 * DAY + 3 * HOUR + 7 * MIN), "short")).toBe("2 d 3:07");
    expect(formatCountdown(splitCountdown(4 * MIN + 5_000, ["minutes", "seconds"]), "short")).toBe("4:05");
  });

  it("speaks a full sentence with singulars and plurals", () => {
    expect(speakCountdown(splitCountdown(DAY + HOUR + 18 * MIN))).toBe("1 day, 1 hour and 18 minutes");
    expect(speakCountdown(splitCountdown(MIN))).toBe("1 minute");
  });
});

describe("Countdown (Vue)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => vi.useRealTimers());

  it("shows the time left with the label, as a timer that is not a live region", () => {
    const { container } = render(Countdown, {
      props: { to: T0 + 13 * HOUR + 18 * MIN, label: "to the written exam" },
    });
    const timer = screen.getByRole("timer");
    expect(timer.getAttribute("aria-live")).toBe("off");
    const value = container.querySelector("time.ui-countdown__value")!;
    expect(value.textContent?.replace(/\s+/g, " ").trim()).toBe("13 h 18 min");
    expect(value.getAttribute("aria-hidden")).toBe("true");
    expect(value.getAttribute("datetime")).toBe("PT13H18M");
    expect(container.querySelector(".ui-countdown__sr")?.textContent).toBe("13 hours and 18 minutes to the written exam");
    expect(container.querySelector(".ui-countdown__label")?.textContent).toBe("to the written exam");
  });

  it("accepts a Date, an ISO string or epoch ms", () => {
    for (const to of [new Date(T0 + 5 * MIN), new Date(T0 + 5 * MIN).toISOString(), T0 + 5 * MIN]) {
      const { container, unmount } = render(Countdown, { props: { to } });
      expect(container.querySelector(".ui-countdown__sr")?.textContent).toBe("5 minutes");
      unmount();
    }
  });

  it("updates every 30 s by default", async () => {
    const { container } = render(Countdown, { props: { to: T0 + 10 * MIN } });
    const sr = () => container.querySelector(".ui-countdown__sr")?.textContent;
    expect(sr()).toBe("10 minutes");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(sr()).toBe("9 minutes");
    await vi.advanceTimersByTimeAsync(29_000);
    expect(sr()).toBe("9 minutes");
  });

  it("ticks every second when seconds are shown", async () => {
    const { container } = render(Countdown, { props: { to: T0 + MIN, units: ["minutes", "seconds"], format: "short" } });
    const num = () => container.querySelector(".ui-countdown__num")?.textContent;
    expect(num()).toBe("1:00");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(num()).toBe("0:59");
  });

  it("emits ended once at zero, stops its timer and shows #ended", async () => {
    const { emitted, container } = render(Countdown, {
      props: { to: T0 + MIN, label: "to the exam" },
      slots: { ended: "Good luck!" },
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(emitted().ended).toHaveLength(1);
    expect(container.textContent).toContain("Good luck!");
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(emitted().ended).toHaveLength(1);
  });

  it("emits ended on mount when the moment has passed, and re-arms for a later target", async () => {
    const { emitted, rerender } = render(Countdown, { props: { to: T0 - 1000 } });
    expect(emitted().ended).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
    await rerender({ to: T0 + MIN });
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(emitted().ended).toHaveLength(2);
  });

  it("stops its timer when unmounted", () => {
    const { unmount } = render(Countdown, { props: { to: T0 + DAY } });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses an injected clock", async () => {
    let clock = T0;
    const { container } = render(Countdown, { props: { to: T0 + 2 * HOUR, now: () => clock } });
    clock = T0 + HOUR + 30 * MIN;
    await vi.advanceTimersByTimeAsync(30_000);
    expect(container.querySelector(".ui-countdown__sr")?.textContent).toBe("30 minutes");
    const fixed = render(Countdown, { props: { to: T0 + 2 * HOUR, now: new Date(T0 + HOUR) } });
    expect(fixed.container.querySelector(".ui-countdown__sr")?.textContent).toBe("1 hour and 0 minutes");
  });

  it("announce: polite, and the sentence only changes at coarse steps", async () => {
    const { container } = render(Countdown, { props: { to: T0 + 3 * HOUR, announce: true } });
    expect(screen.getByRole("timer").getAttribute("aria-live")).toBe("polite");
    const sr = () => container.querySelector(".ui-countdown__sr")?.textContent;
    expect(sr()).toBe("3 hours and 0 minutes");
    await vi.advanceTimersByTimeAsync(30 * MIN);
    // The visible figure moved on; the spoken sentence waits for the hour.
    expect(container.querySelector(".ui-countdown__value")?.textContent?.replace(/\s+/g, "")).toBe("2h30min");
    expect(sr()).toBe("3 hours and 0 minutes");
    await vi.advanceTimersByTimeAsync(31 * MIN);
    // It spoke once, when it crossed the hour, and holds until the next one.
    expect(sr()).toBe("2 hours and 0 minutes");
  });

  it("translates the unit words", () => {
    const { container } = render(Countdown, {
      props: {
        to: T0 + 2 * HOUR + MIN,
        label: "para el examen",
        unitLabels: { hours: { short: "h", one: "hora", other: "horas" }, minutes: { short: "min", one: "minuto", other: "minutos" } },
      },
    });
    expect(container.querySelector(".ui-countdown__sr")?.textContent).toBe("2 horas and 1 minuto para el examen");
  });

  it("an invalid moment shows a dash and starts no timer", () => {
    const { container, emitted } = render(Countdown, { props: { to: "not a date" } });
    expect(container.querySelector(".ui-countdown__num")?.textContent).toBe("—");
    expect(vi.getTimerCount()).toBe(0);
    expect(emitted().ended).toBeUndefined();
  });

  it("follows a parent that changes the target", async () => {
    const Host = defineComponent({
      setup() {
        const to = ref(T0 + HOUR);
        return () => h("div", [h(Countdown, { to: to.value }), h("button", { onClick: () => (to.value = T0 + 2 * DAY) }, "later")]);
      },
    });
    const { container, getByText } = render(Host);
    getByText("later").click();
    await vi.advanceTimersByTimeAsync(0);
    expect(container.querySelector(".ui-countdown__sr")?.textContent).toBe("2 days, 0 hours and 0 minutes");
  });

  it("has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = render(Countdown, { props: { to: Date.now() + DAY, label: "to the exam", size: "lg" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
