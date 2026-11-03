import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import DayTimeline from "./DayTimeline.vue";
import { ES_MESSAGES, provideOnyxLocale } from "../../locale";
import { defineComponent, h } from "vue";

const segments = [
  { start: 360, end: 720, band: "past" as const, label: "06:00–12:00 ya pasado" },
  { start: 720, end: 1440, band: "free" as const, label: "12:00–24:00 libre 94 %" },
];
const base = { start: 360, end: 1440, segments };

describe("DayTimeline (Vue)", () => {
  it("sizes the spans in proportion to their length", () => {
    const { container } = render(DayTimeline, { props: base });
    const spans = container.querySelectorAll<HTMLElement>(".ui-day-timeline__segment:not(.ui-day-timeline__swatch)");
    expect(spans).toHaveLength(2);
    expect(spans[0].style.width).toBe("33.3333%");
    expect(spans[1].style.width).toBe("66.6667%");
    expect(spans[1].style.left).toBe("33.3333%");
  });

  it("puts the now marker at its place in the range", () => {
    const { container } = render(DayTimeline, { props: { ...base, now: 900 } });
    const now = container.querySelector<HTMLElement>(".ui-day-timeline__now")!;
    expect(now.style.left).toBe("50%");
    expect(now.textContent).toContain("now");
  });

  it("shows no marker when now is outside the range, null or unset", () => {
    for (const now of [100, 1500, null, undefined]) {
      const { container } = render(DayTimeline, { props: { ...base, now } });
      expect(container.querySelector(".ui-day-timeline__now")).toBeNull();
    }
  });

  it("labels hour ticks every 3 h by default and honours custom ticks", () => {
    const d = render(DayTimeline, { props: base });
    expect([...d.container.querySelectorAll(".ui-day-timeline__tick")].map((t) => t.textContent)).toEqual([
      "06", "09", "12", "15", "18", "21", "24",
    ]);
    const c = render(DayTimeline, { props: { ...base, ticks: [720, 1080] } });
    expect([...c.container.querySelectorAll(".ui-day-timeline__tick")].map((t) => t.textContent)).toEqual(["12", "18"]);
  });

  it("lists only the bands present in the legend, and can hide it", () => {
    const { container } = render(DayTimeline, { props: base });
    const items = [...container.querySelectorAll(".ui-day-timeline__legend-item")].map((i) => i.textContent?.trim());
    expect(items).toEqual(["almost surely free", "already past"]);
    const off = render(DayTimeline, { props: { ...base, legend: false } });
    expect(off.container.querySelector(".ui-day-timeline__legend")).toBeNull();
  });

  it("is an image with a summary and a hidden list with one item per segment", () => {
    const { container, getByRole } = render(DayTimeline, { props: base });
    expect(getByRole("img").getAttribute("aria-label")).toBe("Day timeline 06:00–24:00");
    const items = [...container.querySelectorAll(".ui-day-timeline__item")].map((i) => i.textContent);
    expect(items).toEqual(["06:00–12:00 ya pasado", "12:00–24:00 libre 94 %"]);
  });

  it("falls back to range and band name when a segment has no label", () => {
    const { container } = render(DayTimeline, {
      props: { ...base, segments: [{ start: 900, end: 930, band: "busy" }] },
    });
    expect(container.querySelector(".ui-day-timeline__item")?.textContent).toBe("15:00–15:30 usually writes");
  });

  it("reads its texts from the Spanish catalog", () => {
    const Host = defineComponent({
      setup() {
        provideOnyxLocale(ES_MESSAGES);
        return () => h(DayTimeline, { ...base, now: 900 });
      },
    });
    const { container } = render(Host);
    expect(container.querySelector(".ui-day-timeline__now")?.textContent).toContain("ahora");
    expect(container.querySelector(".ui-day-timeline__legend")?.textContent).toContain("libre casi seguro");
    expect(container.querySelector(".ui-day-timeline")?.querySelector("[role=img]")?.getAttribute("aria-label")).toBe(
      "Línea del día 06:00–24:00",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(DayTimeline, { props: { ...base, now: 900 } });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("takes its colours from the band tokens", () => {
    const scss = readFileSync(join(__dirname, "day-timeline.scss"), "utf8");
    for (const b of ["free", "likely", "busy", "past", "nodata"]) {
      expect(scss).toContain(`var(--ui-band-${b})`);
    }
    expect(scss).not.toMatch(/#[0-9a-f]{3,6}\b/i);
  });
});
