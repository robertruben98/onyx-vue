import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import Grid from "./Grid.vue";

const root = (c: Element) => c.firstElementChild as HTMLElement;

describe("Grid (Vue)", () => {
  it("defaults to one column and the default gap", () => {
    const { container } = render(Grid, { slots: { default: "<div>a</div>" } });
    expect(root(container).style.gridTemplateColumns).toBe("repeat(1, minmax(0, 1fr))");
    expect(root(container).style.getPropertyValue("--ui-grid-gap")).toBe("var(--ui-space-4)");
  });

  it("lays out a fixed number of equal columns", () => {
    const { container } = render(Grid, { props: { columns: 3 } });
    expect(root(container).style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("never asks for less than one column", () => {
    const { container } = render(Grid, { props: { columns: 0 } });
    expect(root(container).style.gridTemplateColumns).toBe("repeat(1, minmax(0, 1fr))");
  });

  it("fits columns to a minimum item width, capped at the grid width", () => {
    const { container } = render(Grid, { props: { minItemWidth: "16rem", columns: 4 } });
    expect(root(container).style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
    );
  });

  it("supports no gap and a custom element", () => {
    const { container } = render(Grid, { props: { gap: 0, as: "ul" } });
    expect(root(container).tagName).toBe("UL");
    expect(root(container).style.getPropertyValue("--ui-grid-gap")).toBe("0");
  });

  it("has no axe violations", async () => {
    const { container } = render(Grid, { slots: { default: "<p>one</p><p>two</p>" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
