import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { nextTick } from "vue";
import BarList from "./BarList.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const single = [
  { label: "sin permisos de escritura", value: 12, tip: "12 de 20" },
  { label: "hilo escalado", value: 5 },
];

const stacked = [
  {
    label: "pr-fix",
    segments: [
      { value: 30, tone: "ok" as const, label: "ok" },
      { value: 4, tone: "bad" as const, label: "fallido" },
    ],
    valueText: "88%",
  },
];

describe("BarList (Vue)", () => {
  it("is an image named by its label with one bar per row", () => {
    const { container } = render(BarList, { props: { items: single, label: "Por que se atasca" } });
    expect(screen.getByRole("img", { name: "Por que se atasca" })).toBeTruthy();
    expect(container.querySelectorAll("path.ui-chart--one")).toHaveLength(2);
  });

  it("writes the value after a single bar", () => {
    const { container } = render(BarList, { props: { items: single, label: "x" } });
    const vals = [...container.querySelectorAll(".ui-chart__val")].map((t) => t.textContent);
    expect(vals).toEqual(["12", "5"]);
  });

  it("stacks segments and writes the summary in the right column", () => {
    const { container } = render(BarList, { props: { items: stacked, label: "x" } });
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector(".ui-chart__val")?.textContent).toBe("88%");
  });

  it("puts a count inside a segment only when it fits", () => {
    const { container } = render(BarList, { props: { items: stacked, label: "x" } });
    const inside = [...container.querySelectorAll(".ui-chart__inseg")].map((t) => t.textContent);
    expect(inside).toContain("30");
  });

  it("uses light ink on the dark fills", () => {
    const { container } = render(BarList, {
      props: {
        items: [{ label: "a", segments: [{ value: 50, tone: "bad" as const }] }],
        label: "x",
      },
    });
    expect(container.querySelector(".ui-chart__inseg--light")).toBeTruthy();
  });

  it("shows the row's tooltip", async () => {
    const { container } = render(BarList, { props: { items: single, label: "x" } });
    await fireEvent.pointerEnter(container.querySelector(".ui-chart__hit") as Element);
    expect(document.body.querySelector(".ui-chart__tip")?.textContent).toBe("12 de 20");
  });

  it("keeps the full labels in the table twin", () => {
    const { container } = render(BarList, {
      props: { items: single, label: "x", tableHeaders: ["motivo", "veces"] },
    });
    const rows = [...container.querySelectorAll("tbody tr")].map((r) => r.textContent);
    expect(rows[0]).toBe("sin permisos de escritura12");
  });

  it("has no axe violations", async () => {
    const { container } = render(BarList, {
      props: { items: stacked, label: "Fiabilidad", legend: [{ label: "ok", tone: "ok" }] },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

function tipText(): string | null {
  return document.body.querySelector(".ui-chart__tip")?.textContent ?? null;
}

function hits(container: Element): Element[] {
  return [...container.querySelectorAll(".ui-chart__hit")];
}

describe("BarList (Vue) — tooltips", () => {
  it("hides the tooltip when the pointer leaves the bar", async () => {
    const { container } = render(BarList, { props: { items: single, label: "x" } });
    const [hit] = hits(container);
    await fireEvent.pointerEnter(hit);
    expect(tipText()).toBe("12 de 20");
    await fireEvent.pointerLeave(hit);
    expect(tipText()).toBeNull();
  });

  it("hides the tooltip when the pointer leaves the whole chart", async () => {
    const { container } = render(BarList, { props: { items: single, label: "x" } });
    await fireEvent.pointerEnter(hits(container)[0]);
    expect(tipText()).not.toBeNull();
    await fireEvent.pointerLeave(screen.getByRole("img"));
    expect(tipText()).toBeNull();
  });

  it("names a single bar by its label and value when it has no tip", async () => {
    const { container } = render(BarList, {
      props: { items: [...single, { label: "coste", value: 3, valueText: "3 €" }], label: "x" },
    });
    await fireEvent.pointerEnter(hits(container)[1]);
    expect(tipText()).toBe("hilo escalado · 5");
    await fireEvent.pointerEnter(hits(container)[2]);
    expect(tipText()).toBe("coste · 3 €");
  });

  it("shows a segment's own tooltip and hides it on leave", async () => {
    const { container } = render(BarList, { props: { items: stacked, label: "x" } });
    const [ok, bad] = hits(container);
    await fireEvent.pointerEnter(ok);
    expect(tipText()).toBe("pr-fix · 30 ok");
    await fireEvent.pointerEnter(bad);
    expect(tipText()).toBe("pr-fix · 4 fallido");
    await fireEvent.pointerLeave(bad);
    expect(tipText()).toBeNull();
  });

  it("prefixes a segment's tooltip with the row's tip, and omits a missing segment label", async () => {
    const { container } = render(BarList, {
      props: {
        items: [{ label: "review", tip: "34 runs", segments: [{ value: 9, tone: "ok" as const }] }],
        label: "x",
      },
    });
    await fireEvent.pointerEnter(hits(container)[0]);
    expect(tipText()).toBe("34 runs · review · 9");
  });

  it("shows no tooltip for a row whose tip is empty", async () => {
    const { container } = render(BarList, {
      props: { items: [{ label: "a", value: 1, tip: "" }], label: "x" },
    });
    await fireEvent.pointerEnter(hits(container)[0]);
    expect(tipText()).toBeNull();
  });
});

describe("BarList (Vue) — scale and segments", () => {
  // Sin layout en jsdom el ancho cae al de reserva (1200): la columna de
  // etiquetas mide 200, la de cola 80, y el area de barras 920.
  function valueX(container: Element): number {
    return Number(container.querySelector(".ui-chart__val")?.getAttribute("x"));
  }

  it("scales the bars against the largest row by default", () => {
    const { container } = render(BarList, { props: { items: [{ label: "a", value: 50 }], label: "x" } });
    expect(valueX(container)).toBe(200 + 920 + 10);
  });

  it("scales the bars against an explicit max", () => {
    const { container } = render(BarList, {
      props: { items: [{ label: "a", value: 50 }], label: "x", max: 100 },
    });
    expect(valueX(container)).toBe(200 + 460 + 10);
  });

  it("keeps a 2px stub, not NaN, when every row is zero", () => {
    const { container } = render(BarList, {
      props: { items: [{ label: "a", value: 0 }, { label: "b", value: 0 }], label: "x" },
    });
    const paths = [...container.querySelectorAll("path")].map((p) => p.getAttribute("d") ?? "");
    expect(paths).toHaveLength(2);
    expect(paths.some((d) => d.includes("NaN"))).toBe(false);
    expect(valueX(container)).toBe(200 + 2 + 10);
  });

  it("draws a row with no value as a zero stub and counts it as 0 in the table", () => {
    const { container } = render(BarList, {
      props: { items: [{ label: "a", value: 4 }, { label: "sin dato" }], label: "x" },
    });
    const paths = [...container.querySelectorAll("path")].map((p) => p.getAttribute("d") ?? "");
    expect(paths).toHaveLength(2);
    expect(paths[1]).not.toContain("NaN");
    const rows = [...container.querySelectorAll("tbody tr")].map((r) => r.textContent);
    expect(rows).toEqual(["a4", "sin dato0"]);
  });

  // Una fila sin `value` ni `segments` (el tipo lo permite: `value?: number`)
  // decia "sin dato · undefined" en el tooltip mientras la tabla gemela decia 0.
  it("names a row with no value as 0 in its tooltip and after its bar", async () => {
    const { container } = render(BarList, {
      props: { items: [{ label: "a", value: 4 }, { label: "sin dato" }], label: "x" },
    });
    await fireEvent.pointerEnter(container.querySelectorAll(".ui-chart__hit")[1]);
    expect(document.body.querySelector(".ui-chart__tip")?.textContent).toBe("sin dato · 0");
    const vals = [...container.querySelectorAll(".ui-chart__val")].map((t) => t.textContent);
    expect(vals).toEqual(["4", "0"]);
  });

  it("leaves the count out of a segment too thin to hold it, and drops empty segments", () => {
    const { container } = render(BarList, {
      props: {
        items: [
          {
            label: "a",
            segments: [
              { value: 100, tone: "ok" as const },
              { value: 0, tone: "warn" as const },
              { value: 1, tone: "bad" as const },
            ],
          },
        ],
        label: "x",
      },
    });
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector("path.ui-chart--warn")).toBeNull();
    const inside = [...container.querySelectorAll(".ui-chart__inseg")].map((t) => t.textContent);
    expect(inside).toEqual(["100"]);
  });

  it("sums the segments in the default table when a row has no value text", () => {
    const { container } = render(BarList, {
      props: {
        items: [{ label: "a", segments: [{ value: 3, tone: "ok" as const }, { value: 2, tone: "bad" as const }] }],
        label: "x",
      },
    });
    expect(container.querySelector("tbody tr")?.textContent).toBe("a5");
    expect(container.querySelector(".ui-chart__val")).toBeNull();
  });
});

describe("BarList (Vue) — table twin", () => {
  it("takes a custom table, or none", async () => {
    const { container, rerender } = render(BarList, {
      props: { items: single, label: "x", table: { headers: ["motivo", "veces", "%"], rows: [["a", 1, "5%"]] } },
    });
    expect([...container.querySelectorAll("th")].map((th) => th.textContent)).toEqual(["motivo", "veces", "%"]);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    await rerender({ items: single, label: "x", table: null });
    expect(container.querySelector("table")).toBeNull();
  });

  it("opens the table fold and keeps it open when a repaint briefly empties the data", async () => {
    const { container, rerender } = render(BarList, {
      props: { items: single, label: "x", tableSummary: "motivos" },
    });
    const details = container.querySelector("details") as HTMLDetailsElement;
    const summary = container.querySelector("summary") as HTMLElement;
    expect(summary.textContent).toBe("motivos");
    expect(details.open).toBe(false);
    // El navegador avisa con `toggle` en una tarea aparte, no en el clic.
    const toggled = new Promise<void>((resolve) => details.addEventListener("toggle", () => resolve(), { once: true }));
    await fireEvent.click(summary);
    await toggled;
    await nextTick();
    expect(details.open).toBe(true);
    // Un refresco sin filas quita el pliegue; al volver los datos vuelve abierto.
    await rerender({ items: [], label: "x", tableSummary: "motivos" });
    expect(container.querySelector("details")).toBeNull();
    await rerender({ items: [...single, { label: "nuevo", value: 1 }], label: "x", tableSummary: "motivos" });
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
  });

  it("falls back to 'data' for an empty table summary", () => {
    const { container } = render(BarList, { props: { items: single, label: "x", tableSummary: "" } });
    expect(container.querySelector("summary")?.textContent).toBe("data");
  });
});
