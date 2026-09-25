import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import AppBar from "./AppBar.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("AppBar (Vue)", () => {
  it("renders the title as the page heading", () => {
    render(AppBar, { props: { title: "Todos los agentes" } });
    expect(screen.getByRole("heading", { level: 1, name: "Todos los agentes" })).toBeTruthy();
  });

  it("renders the title as plain text with headingLevel 0", () => {
    // Una pagina que ya tiene su h1 en otro sitio no puede tener dos.
    render(AppBar, { props: { title: "PR Dashboard", headingLevel: 0 } });
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("PR Dashboard")).toBeTruthy();
  });

  it("renders subtitle and eyebrow when given", () => {
    render(AppBar, {
      props: { title: "tiendas.local.com", subtitle: "main", eyebrow: "Banco OIDC" },
    });
    expect(screen.getByText("main")).toBeTruthy();
    expect(screen.getByText("Banco OIDC")).toBeTruthy();
  });

  it("puts the status and the actions in their own regions", () => {
    const { container } = render(AppBar, {
      props: { title: "x" },
      slots: {
        status: "<span>12 vivos</span>",
        actions: "<button type='button'>refrescar</button>",
      },
    });
    expect(container.querySelector(".ui-app-bar__status")?.textContent).toBe("12 vivos");
    expect(screen.getByRole("button", { name: "refrescar" })).toBeTruthy();
  });

  it("omits the empty regions", () => {
    const { container } = render(AppBar, { props: { title: "x" } });
    expect(container.querySelector(".ui-app-bar__status")).toBeNull();
    expect(container.querySelector(".ui-app-bar__actions")).toBeNull();
  });

  it("lets the brand slot replace title and subtitle", () => {
    render(AppBar, { slots: { brand: "<strong>custom</strong>" } });
    expect(screen.getByText("custom")).toBeTruthy();
  });

  it("is sticky unless told otherwise", async () => {
    const { container, rerender } = render(AppBar, { props: { title: "x" } });
    expect(container.querySelector(".ui-app-bar--sticky")).toBeTruthy();
    await rerender({ title: "x", sticky: false });
    expect(container.querySelector(".ui-app-bar--sticky")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(AppBar, {
      props: { title: "Agents", subtitle: "12 agentes" },
      slots: { actions: "<button type='button'>refrescar</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
