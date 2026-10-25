import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Chip from "./Chip.vue";

describe("Chip (Vue)", () => {
  it("is a plain button named by its label, with no pressed state", () => {
    render(Chip, { slots: { default: "Give me an example" } });
    const chip = screen.getByRole("button", { name: "Give me an example" });
    expect(chip.getAttribute("type")).toBe("button");
    expect(chip.hasAttribute("aria-pressed")).toBe(false);
  });

  it("emits clicked on every activation (one-shot, not a toggle)", async () => {
    const { emitted } = render(Chip, { slots: { default: "Shorter" } });
    const chip = screen.getByRole("button");
    await fireEvent.click(chip);
    await fireEvent.click(chip);
    expect(emitted().clicked).toHaveLength(2);
    expect(chip.hasAttribute("aria-pressed")).toBe(false);
  });

  it("does not emit clicked when disabled", async () => {
    const { emitted } = render(Chip, { props: { disabled: true }, slots: { default: "Shorter" } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it("hides the leading icon from the accessible name", () => {
    const { container } = render(Chip, { slots: { default: "Add", leading: "<svg></svg>" } });
    expect(container.querySelector(".ui-chip__icon")!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(Chip, { slots: { default: "Explain this" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
