import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Grid from "./Grid.vue";
import MediaCard from "../media-card/MediaCard.vue";

const scss = readFileSync(join(process.cwd(), "src", "components", "grid", "grid.scss"), "utf8");

/** Body of the first rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const at = scss.indexOf(`${selector} {`);
  expect(at, `${selector} not found in grid.scss`).toBeGreaterThan(-1);
  return scss.slice(at, scss.indexOf("}", at));
}

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
      "repeat(var(--ui-grid-repeat, auto-fit), minmax(min(100%, 16rem), 1fr))",
    );
  });

  it("leaves the repeat keyword to the stylesheet unless tracks is set", () => {
    const { container } = render(Grid, { props: { minItemWidth: "15rem" } });
    expect(root(container).style.getPropertyValue("--ui-grid-repeat")).toBe("");
  });

  it("tracks fill keeps the empty columns, tracks fit collapses them", () => {
    const fill = render(Grid, { props: { minItemWidth: "15rem", tracks: "fill" } });
    expect(root(fill.container).style.getPropertyValue("--ui-grid-repeat")).toBe("auto-fill");
    const fit = render(Grid, { props: { minItemWidth: "15rem", tracks: "fit" } });
    expect(root(fit.container).style.getPropertyValue("--ui-grid-repeat")).toBe("auto-fit");
  });

  it("ignores tracks on a grid of fixed columns", () => {
    const { container } = render(Grid, { props: { columns: 3, tracks: "fill" } });
    expect(root(container).style.getPropertyValue("--ui-grid-repeat")).toBe("");
    expect(root(container).style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("fits by default, so other content keeps stretching over the row", () => {
    // Every grid sets its own value: a grid nested in a grid of media cards
    // must not inherit the parent's auto-fill.
    expect(rule(".ui-grid")).toMatch(/--ui-grid-repeat:\s*auto-fit;/);
  });

  // Issue #94. With auto-fit one card took the whole row (a 1838 px poster at
  // 1500 px) and a section of 4 cards laid out 4 columns where one of 8 laid
  // out 5. auto-fill keeps the empty columns: the column count, and so a
  // card's width, depends only on the grid's width.
  it("keeps the empty columns of a grid of media cards", () => {
    expect(rule(".ui-grid:has(> .ui-media-card)")).toMatch(/--ui-grid-repeat:\s*auto-fill;/);
  });

  it("a lone media card is a direct child the :has rule matches", () => {
    const { container } = render(Grid, {
      props: { minItemWidth: "15rem" },
      slots: { default: () => h(MediaCard, { title: "The Last: Naruto the Movie" }) },
    });
    const grid = root(container);
    expect(grid.querySelector(":scope > .ui-media-card")).not.toBeNull();
    expect(grid.matches(".ui-grid:has(> .ui-media-card)")).toBe(true);
    expect(grid.style.gridTemplateColumns).toBe(
      "repeat(var(--ui-grid-repeat, auto-fit), minmax(min(100%, 15rem), 1fr))",
    );
  });

  it("a grid of other content does not match the media-card rule", () => {
    const { container } = render(Grid, {
      props: { minItemWidth: "15rem" },
      slots: { default: "<div>a</div>" },
    });
    expect(root(container).matches(".ui-grid:has(> .ui-media-card)")).toBe(false);
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
