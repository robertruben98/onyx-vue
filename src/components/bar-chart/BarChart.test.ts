import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import BarChart from "./BarChart.vue";
import { barPath, fitLabel } from "./chart-kit";

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
