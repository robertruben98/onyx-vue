import { afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick, ref } from "vue";
import BarChart from "./BarChart.vue";
import { barPath, fitLabel, useChartWidth } from "./chart-kit";

const axeOptions = { rules: { region: { enabled: false } } };

const series = [
  { id: "acted", label: "actuados", tone: "ok" as const },
  { id: "skipped", label: "saltados", tone: "warn" as const },
];
const points = [
  { label: "lun", values: { acted: 3, skipped: 1 } },
  { label: "mar", values: { acted: 0, skipped: 0 } },
  { label: "sab", values: { acted: 7, skipped: 2 }, muted: true },
];

describe("chart-kit", () => {
  it("rounds only the data end of a bar", () => {
    expect(barPath(0, 0, 10, 20, "flat")).toBe("M0 0h10v20h-10Z");
    expect(barPath(0, 0, 10, 20, "up")).toContain("a4 4");
  });

  it("cuts a label to its column", () => {
    expect(fitLabel("procesamiento-review", 100)).toBe("procesamiento…".slice(0, 11) + "…");
    expect(fitLabel("corto", 200)).toBe("corto");
  });
});

describe("BarChart (Vue)", () => {
  it("is an image named by its label", () => {
    render(BarChart, { props: { series, points, label: "Trabajo por dia" } });
    expect(screen.getByRole("img", { name: "Trabajo por dia" })).toBeTruthy();
  });

  it("stacks one path per non-zero series, bottom-up", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    expect(container.querySelectorAll("path.ui-chart--ok")).toHaveLength(2);
    expect(container.querySelectorAll("path.ui-chart--warn")).toHaveLength(2);
  });

  it("writes a direct label on the tallest column only", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    const vals = container.querySelectorAll(".ui-chart__val");
    expect(vals).toHaveLength(1);
    expect(vals[0].textContent).toBe("9");
  });

  it("dims muted axis labels", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    const dim = container.querySelector(".ui-chart__tick--dim");
    expect(dim?.textContent).toBe("sab");
  });

  it("shows a tooltip over a column's hit area", async () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    const hit = container.querySelectorAll(".ui-chart__hit")[0];
    await fireEvent.pointerEnter(hit);
    expect(document.body.querySelector(".ui-chart__tip")?.textContent).toBe("lun · 3 actuados · 1 saltados");
    await fireEvent.pointerLeave(hit);
    expect(document.body.querySelector(".ui-chart__tip")).toBeNull();
  });

  it("keeps the numbers in a table twin", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x", categoryHeader: "dia" } });
    const cells = [...container.querySelectorAll("table tbody tr")].map((tr) => tr.textContent);
    expect(cells).toEqual(["lun31", "mar00", "sab72"]);
    expect(container.querySelector("th")?.textContent).toBe("dia");
  });

  it("takes a custom table, or none", async () => {
    const { container, rerender } = render(BarChart, {
      props: { series, points, label: "x", table: { headers: ["dia", "runs"], rows: [["lun", 4]] } },
    });
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    await rerender({ series, points, label: "x", table: null });
    expect(container.querySelector("table")).toBeNull();
  });

  it("draws the legend from the series", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    expect(container.querySelector(".ui-chart__legend")?.textContent).toContain("actuados");
  });

  it("has no axe violations", async () => {
    const { container } = render(BarChart, { props: { series, points, label: "Trabajo" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

function tipText(): string | null {
  return document.body.querySelector(".ui-chart__tip")?.textContent ?? null;
}

describe("BarChart (Vue) — tooltips", () => {
  it("hides the tooltip when the pointer leaves the whole chart", async () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    await fireEvent.pointerEnter(container.querySelectorAll(".ui-chart__hit")[2]);
    expect(tipText()).toBe("sab · 7 actuados · 2 saltados");
    await fireEvent.pointerLeave(screen.getByRole("img"));
    expect(tipText()).toBeNull();
  });

  it("uses a column's own tip, and shows nothing for an empty one", async () => {
    const { container } = render(BarChart, {
      props: {
        series,
        points: [
          { label: "lun", values: { acted: 1 }, tip: "lunes: 1 run" },
          { label: "mar", values: { acted: 2 }, tip: "" },
        ],
        label: "x",
      },
    });
    const hit = container.querySelectorAll(".ui-chart__hit");
    await fireEvent.pointerEnter(hit[0]);
    expect(tipText()).toBe("lunes: 1 run");
    await fireEvent.pointerLeave(hit[0]);
    await fireEvent.pointerEnter(hit[1]);
    expect(tipText()).toBeNull();
  });
});

describe("BarChart (Vue) — scale and axis", () => {
  function ticks(container: Element): string[] {
    return [...container.querySelectorAll(".ui-chart__tick.ui-chart__end")].map((t) => t.textContent ?? "");
  }

  function axisLabels(container: Element): string[] {
    return [...container.querySelectorAll(".ui-chart__tick.ui-chart__mid")].map((t) => t.textContent ?? "");
  }

  it("counts a series missing from a column as zero", async () => {
    const { container } = render(BarChart, {
      props: { series, points: [{ label: "lun", values: { acted: 3 } }], label: "x" },
    });
    expect(container.querySelectorAll("path.ui-chart--ok")).toHaveLength(1);
    expect(container.querySelector("path.ui-chart--warn")).toBeNull();
    expect(container.querySelector(".ui-chart__val")?.textContent).toBe("3");
    expect(container.querySelector("tbody tr")?.textContent).toBe("lun30");
    await fireEvent.pointerEnter(container.querySelector(".ui-chart__hit") as Element);
    expect(tipText()).toBe("lun · 3 actuados · 0 saltados");
  });

  it("rounds the scale up to a multiple of four with four even steps", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    // El total mas alto es 9: la escala sube a 12.
    expect(ticks(container)).toEqual(["0", "3", "6", "9", "12"]);
  });

  it("falls back to a 0–4 scale and no direct label when every column is empty", () => {
    const { container } = render(BarChart, {
      props: {
        series,
        points: [
          { label: "lun", values: { acted: 0, skipped: 0 } },
          { label: "mar", values: {} },
        ],
        label: "x",
      },
    });
    expect(ticks(container)).toEqual(["0", "1", "2", "3", "4"]);
    expect(container.querySelector(".ui-chart__val")).toBeNull();
    expect(container.querySelectorAll("path")).toHaveLength(0);
  });

  it("labels every column of a short axis", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x" } });
    expect(axisLabels(container)).toEqual(["lun", "mar", "sab"]);
  });

  it("labels every nth column of a long axis, and always the last", () => {
    const days = Array.from({ length: 30 }, (_, i) => ({ label: `d${i}`, values: { acted: 1 } }));
    const { container } = render(BarChart, { props: { series, points: days, label: "x" } });
    const labels = axisLabels(container);
    // 30 columnas: una de cada dos (0, 2, … 28) mas la ultima (29).
    expect(labels).toHaveLength(16);
    expect(labels.slice(0, 3)).toEqual(["d0", "d2", "d4"]);
    expect(labels).not.toContain("d27");
    expect(labels[labels.length - 1]).toBe("d29");
    // Cada columna conserva su area de tooltip aunque no lleve etiqueta.
    expect(container.querySelectorAll(".ui-chart__hit")).toHaveLength(30);
  });

  it("formats the ticks and the direct label with valueFormat", () => {
    const { container } = render(BarChart, {
      props: { series, points, label: "x", valueFormat: (n: number) => `${n}h` },
    });
    expect(ticks(container)).toEqual(["0h", "3h", "6h", "9h", "12h"]);
    expect(container.querySelector(".ui-chart__val")?.textContent).toBe("9h");
  });

  it("hides the legend when asked", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x", showLegend: false } });
    expect(container.querySelector(".ui-chart__legend")).toBeNull();
  });
});

describe("BarChart (Vue) — table twin", () => {
  it("opens the table fold and keeps it open when a repaint briefly empties the data", async () => {
    const { container, rerender } = render(BarChart, {
      props: { series, points, label: "x", tableSummary: "numeros" },
    });
    const details = container.querySelector("details") as HTMLDetailsElement;
    const summary = container.querySelector("summary") as HTMLElement;
    expect(summary.textContent).toBe("numeros");
    expect(details.open).toBe(false);
    // El navegador avisa con `toggle` en una tarea aparte, no en el clic.
    const toggled = new Promise<void>((resolve) => details.addEventListener("toggle", () => resolve(), { once: true }));
    await fireEvent.click(summary);
    await toggled;
    await nextTick();
    expect(details.open).toBe(true);
    // Un refresco sin columnas quita el pliegue; al volver los datos vuelve abierto.
    await rerender({ series, points: [], label: "x", tableSummary: "numeros" });
    expect(container.querySelector("details")).toBeNull();
    await rerender({ series, points: points.slice(0, 2), label: "x", tableSummary: "numeros" });
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  it("falls back to 'data' for an empty table summary", () => {
    const { container } = render(BarChart, { props: { series, points, label: "x", tableSummary: "" } });
    expect(container.querySelector("summary")?.textContent).toBe("data");
  });

  it("draws no fold for a table without rows", () => {
    const { container } = render(BarChart, {
      props: { series, points, label: "x", table: { headers: ["dia"], rows: [] } },
    });
    expect(container.querySelector("details")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// chart-kit: medida del ancho y tooltip
// ---------------------------------------------------------------------------
describe("chart-kit — measured width", () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  let boxWidth = 0;

  beforeEach(() => {
    boxWidth = 0;
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains("ui-chart") ? boxWidth : 0;
      },
    });
  });

  afterEach(() => {
    // jsdom define `clientWidth` en Element.prototype: el stub de HTMLElement
    // solo lo tapa, asi que basta con quitarlo.
    if (original) Object.defineProperty(HTMLElement.prototype, "clientWidth", original);
    else Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
    vi.unstubAllGlobals();
  });

  function viewBox(): string | null {
    return screen.getByRole("img").getAttribute("viewBox");
  }

  it("keeps the fallback width while the box has no size", async () => {
    render(BarChart, { props: { series, points, label: "x" } });
    await nextTick();
    expect(viewBox()).toBe("0 0 1200 300");
  });

  it("draws in real pixels: the viewBox is the measured width of the box", async () => {
    boxWidth = 812.4;
    render(BarChart, { props: { series, points, label: "x" } });
    await nextTick();
    expect(viewBox()).toBe("0 0 812 300");
  });

  it("never draws narrower than 360px", async () => {
    boxWidth = 200;
    render(BarChart, { props: { series, points, label: "x" } });
    await nextTick();
    expect(viewBox()).toBe("0 0 360 300");
  });

  it("re-measures when the box is resized and stops observing on unmount", async () => {
    const observed: Element[] = [];
    const callbacks: Array<() => void> = [];
    const disconnect = vi.fn();
    class FakeResizeObserver {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe(el: Element): void {
        observed.push(el);
      }
      unobserve(): void {}
      disconnect(): void {
        disconnect();
      }
    }
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    boxWidth = 600;
    const { container, unmount } = render(BarChart, { props: { series, points, label: "x" } });
    await nextTick();
    expect(viewBox()).toBe("0 0 600 300");
    expect(observed).toEqual([container.querySelector(".ui-bar-chart")]);
    boxWidth = 900;
    callbacks[0]();
    await nextTick();
    expect(viewBox()).toBe("0 0 900 300");
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("measures nothing and observes nothing without an element", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        disconnect(): void {}
      },
    );
    const Probe = defineComponent({
      setup() {
        const width = useChartWidth(ref<HTMLElement | null>(null), 640);
        return () => h("output", String(width.value));
      },
    });
    const { container } = render(Probe);
    expect(container.querySelector("output")?.textContent).toBe("640");
    expect(observe).not.toHaveBeenCalled();
  });
});
