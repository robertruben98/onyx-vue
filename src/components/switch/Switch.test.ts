import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import Switch from "./Switch.vue";

describe("Switch (Vue)", () => {
  it("exposes a switch with an accessible name from the label", () => {
    render(Switch, { props: { label: "Notifications" } });
    expect(screen.getByRole("switch", { name: /notifications/i })).toBeTruthy();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(Switch, { props: { ariaLabel: "Dark mode" } });
    expect(screen.getByRole("switch", { name: /dark mode/i })).toBeTruthy();
  });

  it("emits checkedChange when toggled by pointer", async () => {
    const { emitted } = render(Switch, { props: { label: "A" } });
    await fireEvent.click(screen.getByRole("switch"));
    expect(emitted().checkedChange).toBeTruthy();
    expect(emitted().checkedChange[0]).toEqual([true]);
  });

  it("is toggleable by keyboard (Space)", async () => {
    const user = userEvent.setup();
    const { emitted } = render(Switch, { props: { label: "A" } });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("switch"));
    await user.keyboard(" ");
    expect(emitted().checkedChange).toBeTruthy();
    expect(emitted().checkedChange[0]).toEqual([true]);
  });

  it("does not emit checkedChange when disabled", async () => {
    const { emitted } = render(Switch, {
      props: { label: "A", disabled: true },
    });
    const sw = screen.getByRole("switch") as HTMLInputElement;
    expect(sw.disabled).toBe(true);
    await fireEvent.click(sw);
    expect(emitted().checkedChange).toBeFalsy();
  });

  it("reflects invalid via aria-invalid", () => {
    render(Switch, { props: { ariaLabel: "A", invalid: true } });
    expect(screen.getByRole("switch").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  describe("v-model", () => {
    it("writes the model value into the control", () => {
      render(Switch, { props: { label: "A", modelValue: true } });
      expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(
        true,
      );
    });

    it("updates the model when toggled", async () => {
      const { emitted } = render(Switch, {
        props: { label: "A", modelValue: true },
      });
      await fireEvent.click(screen.getByRole("switch"));
      expect(emitted()["update:modelValue"]).toBeTruthy();
      expect(emitted()["update:modelValue"][0]).toEqual([false]);
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(Switch, { props: { label: "A" } });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(Switch, {
      props: { label: "A", disabled: true },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
