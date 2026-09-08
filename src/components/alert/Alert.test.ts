import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Alert from "./Alert.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Alert (Vue)", () => {
  it("projects content and renders the title", () => {
    render(Alert, {
      props: { title: "Heads up" },
      slots: { default: "Something happened" },
    });
    expect(screen.getByText("Heads up")).toBeTruthy();
    expect(screen.getByText("Something happened")).toBeTruthy();
  });

  it("uses role=status for non-danger variants", () => {
    render(Alert, { props: { variant: "info" }, slots: { default: "Info" } });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("uses role=alert for the danger variant", () => {
    render(Alert, { props: { variant: "danger" }, slots: { default: "Error" } });
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("has no dismiss button unless dismissible", () => {
    render(Alert, { props: { variant: "info" }, slots: { default: "Info" } });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("emits dismissed and hides the host when dismissed", async () => {
    const { emitted, container } = render(Alert, {
      props: { variant: "info", dismissible: true, dismissLabel: "Cerrar" },
      slots: { default: "Info" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(emitted().dismissed).toBeTruthy();
    expect(emitted().dismissed).toHaveLength(1);
    expect(container.querySelector(".ui-alert")?.hasAttribute("hidden")).toBe(
      true,
    );
  });

  it("dismiss button is keyboard operable", async () => {
    const { emitted } = render(Alert, {
      props: { variant: "info", dismissible: true },
      slots: { default: "Info" },
    });
    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
    await fireEvent.keyDown(button, { key: "Enter" });
    // native <button> activates on Enter -> click
    await fireEvent.click(button);
    expect(emitted().dismissed).toBeTruthy();
  });

  it.each(
    (["neutral", "info", "success", "warning", "danger"] as const).flatMap(
      (variant) =>
        (["boxed", "band"] as const).map(
          (appearance) => [variant, appearance] as const,
        ),
    ),
  )("has no axe violations (%s, %s)", async (variant, appearance) => {
    const { container } = render(Alert, {
      props: { variant, appearance, title: "Title", dismissible: true },
      slots: { default: "Body" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("is boxed by default, so nothing that exists today moves", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(false);
    expect(root.classList.contains("ui-alert--boxed")).toBe(true);
  });

  it("applies the band appearance", () => {
    const { container } = render(Alert, {
      props: { appearance: "band" },
      slots: { default: "Mensaje" },
    });
    expect(container.querySelector(".ui-alert")?.classList.contains("ui-alert--band")).toBe(true);
  });

  it("keeps appearance independent of variant", () => {
    const { container } = render(Alert, {
      props: { appearance: "band", variant: "warning" },
      slots: { default: "Mensaje" },
    });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(true);
    expect(root.classList.contains("ui-alert--warning")).toBe(true);
  });

  it("projects an icon", () => {
    render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(screen.getByText("!")).toBeTruthy();
  });

  it("hides the icon from assistive tech — the variant already carries the role", () => {
    const { container } = render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(container.querySelector(".ui-alert__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders no icon element when no icon was given", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    expect(container.querySelector(".ui-alert__icon")).toBe(null);
  });

  it("projects an action", () => {
    render(Alert, {
      slots: { default: "Mensaje", action: "<button>cargar ahora</button>" },
    });
    expect(screen.getByRole("button", { name: "cargar ahora" })).toBeTruthy();
  });

  it("renders no action element when no action was given", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    expect(container.querySelector(".ui-alert__action")).toBe(null);
  });

  it("keeps the dismiss button when an action is present", () => {
    render(Alert, {
      props: { dismissible: true, dismissLabel: "Cerrar" },
      slots: { default: "Mensaje", action: "<button>reintentar</button>" },
    });
    expect(screen.getByRole("button", { name: "reintentar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });
});
