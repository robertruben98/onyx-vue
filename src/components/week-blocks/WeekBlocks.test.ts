import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h } from "vue";
import WeekBlocks from "./WeekBlocks.vue";
import { ES_MESSAGES, provideOnyxLocale } from "../../locale";

const block = { start: 540, end: 630, title: "Foco", detail: "libre ≥ 82 % · 21 días" };
const days = [
  { key: "mon", label: "Lun", blocks: [] as (typeof block)[], note: "Sin huecos fiables" },
  { key: "tue", label: "Mar", blocks: [block] },
  { key: "wed", label: "Mié", blocks: [] },
  { key: "thu", label: "Jue", blocks: [{ ...block, start: 1140, end: 1260, tone: "neutral" as const }] },
  { key: "fri", label: "Vie", blocks: [] },
];
const base = { days, start: 480, end: 1200 };

describe("WeekBlocks (Vue)", () => {
  it("renders one column per day", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    expect(container.querySelectorAll(".ui-week-blocks__column")).toHaveLength(5);
  });

  it("binds the column count to the number of days", () => {
    const { container } = render(WeekBlocks, { props: { ...base, days: days.slice(0, 3), layout: "columns" } });
    const root = container.querySelector<HTMLElement>(".ui-week-blocks")!;
    expect(root.style.getPropertyValue("--ui-week-blocks-days")).toBe("3");
    expect(root.querySelectorAll(".ui-week-blocks__column")).toHaveLength(3);
    const scss = readFileSync(join(__dirname, "week-blocks.scss"), "utf8");
    expect(scss).toContain("repeat(var(--ui-week-blocks-days, 5), minmax(0, 1fr))");
    expect(scss).not.toContain("auto-fit");
  });

  it("drops blocks wholly outside the range or empty, in both layouts", () => {
    const outside = [
      { ...block, start: 100, end: 200 },
      { ...block, start: 1300, end: 1400 },
      { ...block, start: 600, end: 600 },
    ];
    for (const layout of ["columns", "list"] as const) {
      const { container } = render(WeekBlocks, {
        props: { ...base, days: [{ key: "mon", label: "Lun", blocks: outside }], layout },
      });
      expect(container.querySelector(".ui-week-blocks__block, .ui-week-blocks__row")).toBeNull();
    }
  });

  it("gives each block a tooltip with range, title and detail", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    expect(container.querySelector(".ui-week-blocks__block")?.getAttribute("title")).toBe(
      "09:00–10:30 · Foco · libre ≥ 82 % · 21 días",
    );
  });

  it("positions a block by time within the range", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    const el = container.querySelector<HTMLElement>(".ui-week-blocks__block")!;
    expect(parseFloat(el.style.top)).toBeCloseTo(8.33, 2);
    expect(parseFloat(el.style.height)).toBeCloseTo(12.5, 2);
  });

  it("clips a block that runs past the end of the range", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    const el = container.querySelectorAll<HTMLElement>(".ui-week-blocks__block")[1];
    expect(el.style.top).toBe("91.6667%");
    expect(el.style.height).toBe("8.3333%");
    expect(el.className).toContain("--neutral");
  });

  it("marks today's column with aria-current=date", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns", today: "tue" } });
    const current = container.querySelectorAll("[aria-current=date]");
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("aria-label")).toBe("Mar");
  });

  it("shows the note of a day without blocks", () => {
    const { getByText } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    expect(getByText("Sin huecos fiables")).toBeTruthy();
  });

  it("draws an hour grid", () => {
    const { container } = render(WeekBlocks, { props: { ...base, layout: "columns" } });
    // 08..20 = 13 lines per column
    expect(container.querySelector(".ui-week-blocks__column")!.querySelectorAll(".ui-week-blocks__gridline")).toHaveLength(13);
    expect(container.querySelectorAll(".ui-week-blocks__hour")).toHaveLength(13);
  });

  it("renders rows 'time · title · detail' in list layout", () => {
    const { container, getByText } = render(WeekBlocks, { props: { ...base, layout: "list", today: "tue" } });
    expect(container.querySelectorAll(".ui-week-blocks__day")).toHaveLength(5);
    expect(container.querySelector(".ui-week-blocks__column")).toBeNull();
    expect(getByText("09:00–10:30 · Foco · libre ≥ 82 % · 21 días")).toBeTruthy();
    expect(getByText("Sin huecos fiables")).toBeTruthy();
    expect(container.querySelector("[aria-current=date] .ui-week-blocks__day-label")?.textContent).toBe("Mar");
  });

  it("uses columns in auto layout when the width cannot be measured", () => {
    const { container } = render(WeekBlocks, { props: base });
    expect(container.querySelector(".ui-week-blocks--columns")).not.toBeNull();
  });

  it("does not observe the container when the layout is forced", () => {
    const original = globalThis.ResizeObserver;
    const observe = vi.fn();
    globalThis.ResizeObserver = class {
      observe = observe;
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver;
    try {
      render(WeekBlocks, { props: { ...base, layout: "columns" } });
      expect(observe).not.toHaveBeenCalled();
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  describe("auto layout with ResizeObserver", () => {
    const original = globalThis.ResizeObserver;
    let callback: ResizeObserverCallback;
    afterEach(() => {
      globalThis.ResizeObserver = original;
    });

    it("switches to the list below 640 px and back to columns above", async () => {
      globalThis.ResizeObserver = class {
        constructor(cb: ResizeObserverCallback) {
          callback = cb;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      } as unknown as typeof ResizeObserver;
      const { container } = render(WeekBlocks, { props: base });
      const resize = async (w: number) => {
        callback([{ contentRect: { width: w } } as ResizeObserverEntry], {} as ResizeObserver);
        await Promise.resolve();
      };
      await resize(500);
      expect(container.querySelector(".ui-week-blocks--list")).not.toBeNull();
      await resize(900);
      expect(container.querySelector(".ui-week-blocks--columns")).not.toBeNull();
    });
  });

  it("reads its label from the Spanish catalog", () => {
    const Host = defineComponent({
      setup() {
        provideOnyxLocale(ES_MESSAGES);
        return () => h(WeekBlocks, base);
      },
    });
    const { container } = render(Host);
    expect(container.querySelector(".ui-week-blocks")?.getAttribute("aria-label")).toBe("Bloques de foco de la semana");
  });

  it("has no accessibility violations in either layout", async () => {
    for (const layout of ["columns", "list"] as const) {
      const { container } = render(WeekBlocks, { props: { ...base, layout, today: "tue" } });
      expect(await axe(container)).toHaveNoViolations();
    }
  });

  it("takes its colours from tokens", () => {
    const scss = readFileSync(join(__dirname, "week-blocks.scss"), "utf8");
    for (const t of ["success-bg", "neutral-bg", "column-bg", "text"]) {
      expect(scss).toContain(`var(--ui-week-block-${t})`);
    }
    expect(scss).not.toMatch(/#[0-9a-f]{3,6}\b/i);
  });
});
