import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Button from "./Button.vue";

describe("Button (Vue)", () => {
  it("renders the default slot label", () => {
    render(Button, { slots: { default: "Save" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("emits clicked when interactive", async () => {
    const { emitted } = render(Button, { slots: { default: "Go" } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeTruthy();
  });

  it("does not emit clicked when disabled", async () => {
    const { emitted } = render(Button, {
      props: { disabled: true },
      slots: { default: "Go" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it("does not emit clicked when loading", async () => {
    const { emitted } = render(Button, {
      props: { loading: true },
      slots: { default: "Go" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it("marks the button aria-busy when loading", () => {
    render(Button, { props: { loading: true }, slots: { default: "Go" } });
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(Button, { slots: { default: "Save" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
