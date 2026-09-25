import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import KpiStrip from "./KpiStrip.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const items = [
  { label: "runs", value: 42, sub: "14 dias" },
  { label: "actuado", value: 12, tone: "success" as const },
  { label: "fallos", value: 3, tone: "danger" as const, title: "runs con error" },
];

describe("KpiStrip (Vue)", () => {
  it("is a named list with one item per figure", () => {
    render(KpiStrip, { props: { items, label: "Flota" } });
    const list = screen.getByRole("list", { name: "Flota" });
    expect(list.querySelectorAll("li")).toHaveLength(3);
  });

  it("puts the label before the value in reading order", () => {
    const { container } = render(KpiStrip, { props: { items } });
    const first = container.querySelector("li") as HTMLElement;
    const parts = [...first.children].map((c) => c.textContent?.trim());
    expect(parts).toEqual(["runs", "42", "14 dias"]);
  });

  it("carries tone and tooltip", () => {
    const { container } = render(KpiStrip, { props: { items } });
    const cells = container.querySelectorAll("li");
    expect(cells[2].getAttribute("title")).toBe("runs con error");
    expect(cells[2].querySelector(".ui-kpi-strip__value--danger")).toBeTruthy();
  });

  it("uses one column per item unless told otherwise", async () => {
    const { container, rerender } = render(KpiStrip, { props: { items } });
    const ul = container.querySelector("ul") as HTMLElement;
    expect(ul.style.getPropertyValue("--ui-kpi-strip-columns")).toBe("3");
    await rerender({ items, columns: 5 });
    expect(ul.style.getPropertyValue("--ui-kpi-strip-columns")).toBe("5");
  });

  it("lets a slot render a value", () => {
    render(KpiStrip, { props: { items }, slots: { "item-0": "<a href='#'>42</a>" } });
    expect(screen.getByRole("link", { name: "42" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(KpiStrip, { props: { items } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
