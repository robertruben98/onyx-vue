import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent } from "vue";
import Panel from "./Panel.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Panel (Vue)", () => {
  it("is a region named by its title, with the title as a heading", () => {
    render(Panel, { props: { title: "runs" }, slots: { default: "<p>rows</p>" } });
    expect(screen.getByRole("region", { name: "runs" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "runs" })).toBeTruthy();
  });

  it("renders the count beside the title, zero included", () => {
    render(Panel, { props: { title: "cola", count: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("renders the body", () => {
    render(Panel, { props: { title: "runs" }, slots: { default: "<p>una fila</p>" } });
    expect(screen.getByText("una fila")).toBeTruthy();
  });

  it("says it is empty instead of rendering the body", () => {
    render(Panel, {
      props: { title: "cola", empty: true, emptyText: "nada pendiente" },
      slots: { default: "<p>una fila</p>" },
    });
    expect(screen.getByText("nada pendiente")).toBeTruthy();
    expect(screen.queryByText("una fila")).toBeNull();
  });

  it("dims the title of an empty panel", () => {
    const { container } = render(Panel, { props: { title: "cola", empty: true } });
    expect(container.querySelector(".ui-section-header--quiet")).toBeTruthy();
  });

  it("passes actions and controls to the header", () => {
    render(Panel, {
      props: { title: "PRs" },
      slots: {
        actions: "<button type='button'>agrupar</button>",
        controls: "<button type='button'>orden</button>",
      },
    });
    expect(screen.getByRole("button", { name: "agrupar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "orden" })).toBeTruthy();
  });

  it("renders a footer only when given", async () => {
    const { container } = render(Panel, {
      props: { title: "listas" },
      slots: { footer: "<span>2 mas plegadas</span>" },
    });
    expect(container.querySelector(".ui-panel__footer")?.textContent).toBe("2 mas plegadas");
  });

  it("honours the heading level", () => {
    const { container } = render(Panel, { props: { title: "x", headingLevel: 3 } });
    expect(container.querySelector("h3")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(Panel, {
      props: { title: "runs", count: "12 · hoy" },
      slots: { default: "<p>rows</p>", actions: "<button type='button'>recargar</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("names its region with aria-labelledby on the heading, not a copy of the text", () => {
    const { container } = render(Panel, { props: { title: "runs" } });
    const region = screen.getByRole("region", { name: "runs" });
    const heading = screen.getByRole("heading", { name: "runs" });
    expect(heading.id).toBeTruthy();
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(region.hasAttribute("aria-label")).toBe(false);
    expect(container.querySelector("section")).toBe(region);
  });

  it("gives every panel on a page its own heading id", () => {
    render(defineComponent({
      components: { Panel },
      template: `<div><Panel title="a" /><Panel title="b" /></div>`,
    }));
    const ids = screen.getAllByRole("heading").map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("with landmark=false is a plain div, still with its heading", () => {
    const { container } = render(Panel, { props: { title: "runs", landmark: false } });
    expect(screen.queryByRole("region")).toBeNull();
    expect(container.querySelector("section")).toBeNull();
    expect(container.querySelector("div.ui-panel")?.hasAttribute("aria-labelledby")).toBe(false);
    expect(screen.getByRole("heading", { name: "runs" })).toBeTruthy();
  });
});
