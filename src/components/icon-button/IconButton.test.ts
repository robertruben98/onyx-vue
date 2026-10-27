import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import IconButton from "./IconButton.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const RESTART = "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9";

describe("IconButton (Vue)", () => {
  it("is named by its label, which is also the tooltip", () => {
    render(IconButton, { props: { label: "reiniciar", icon: RESTART } });
    const btn = screen.getByRole("button", { name: "reiniciar" });
    expect(btn.getAttribute("title")).toBe("reiniciar");
  });

  it("draws the path and hides it from assistive tech", () => {
    const { container } = render(IconButton, { props: { label: "reiniciar", icon: RESTART } });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("path")?.getAttribute("d")).toBe(RESTART);
  });

  it("renders the slot when no path is given", () => {
    render(IconButton, { props: { label: "informacion" }, slots: { default: "i" } });
    expect(screen.getByRole("button", { name: "informacion" }).textContent).toBe("i");
  });

  it("emits clicked", async () => {
    const { emitted } = render(IconButton, { props: { label: "logs", icon: RESTART } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toHaveLength(1);
  });

  it("does not emit while disabled", async () => {
    const { emitted } = render(IconButton, { props: { label: "logs", icon: RESTART, disabled: true } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeUndefined();
  });

  it("exposes aria-pressed only as a toggle", async () => {
    const { rerender } = render(IconButton, { props: { label: "seguir", icon: RESTART } });
    expect(screen.getByRole("button").hasAttribute("aria-pressed")).toBe(false);
    await rerender({ label: "seguir", icon: RESTART, pressed: true });
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(IconButton, { props: { label: "abrir", icon: RESTART } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
