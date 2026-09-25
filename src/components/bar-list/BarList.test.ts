import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
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
