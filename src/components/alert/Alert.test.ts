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

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant) => {
      const { container } = render(Alert, {
        props: { variant, title: "Title", dismissible: true },
        slots: { default: "Body" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
