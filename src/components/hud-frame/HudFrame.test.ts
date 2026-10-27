import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import HudFrame from "./HudFrame.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("HudFrame (Vue)", () => {
  it("renders its body", () => {
    render(HudFrame, { slots: { default: "contenido" } });
    expect(screen.getByText("contenido")).toBeTruthy();
  });

  it("renders no header at all without a title", () => {
    // Un header vacio deja un filete flotando encima del cuerpo.
    const { container } = render(HudFrame, { slots: { default: "x" } });
    expect(container.querySelector(".ui-hud-frame__header")).toBeNull();
  });

  it("renders the title as a heading, so the panel is a landmark", () => {
    render(HudFrame, { props: { title: "Progreso" }, slots: { default: "x" } });
    expect(screen.getByRole("heading", { name: "Progreso" })).toBeTruthy();
  });

  it("puts the meta slot past the rule", () => {
    render(HudFrame, {
      props: { title: "Progreso" },
      slots: { default: "x", meta: "35 pasos" },
    });
    expect(screen.getByText("35 pasos")).toBeTruthy();
  });

  it("drops the brackets when plain", () => {
    const { container } = render(HudFrame, {
      props: { plain: true },
      slots: { default: "x" },
    });
    expect(
      container.querySelector(".ui-hud-frame")?.classList.contains("ui-hud-frame--plain"),
    ).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(HudFrame, {
      props: { title: "Progreso" },
      slots: { default: "contenido", meta: "35" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
