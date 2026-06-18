import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Checkbox from "./Checkbox.vue";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("Checkbox (Vue)", () => {
  it("exposes a checkbox with an accessible name from the label", () => {
    render(Checkbox, { props: { label: "Accept terms" } });
    expect(
      screen.getByRole("checkbox", { name: /accept terms/i }),
    ).toBeTruthy();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(Checkbox, { props: { ariaLabel: "Select row" } });
    expect(screen.getByRole("checkbox", { name: /select row/i })).toBeTruthy();
  });

  it("emits checkedChange when toggled by pointer", async () => {
    const { emitted } = render(Checkbox, { props: { label: "A" } });
    await fireEvent.click(screen.getByRole("checkbox"));
    expect(emitted().checkedChange).toBeTruthy();
    expect(emitted().checkedChange[0]).toEqual([true]);
  });

  it("updates v-model when toggled", async () => {
    const { emitted } = render(Checkbox, { props: { label: "A" } });
    await fireEvent.click(screen.getByRole("checkbox"));
    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"][0]).toEqual([true]);
  });

  it("reflects the modelValue into the control (checked)", () => {
    render(Checkbox, { props: { label: "A", modelValue: true } });
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(
      true,
    );
  });

  it("does NOT emit when disabled", async () => {
    const { emitted } = render(Checkbox, {
      props: { label: "A", disabled: true },
    });
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.disabled).toBe(true);
    await fireEvent.click(box);
    expect(emitted().checkedChange).toBeFalsy();
  });

  it("reflects the indeterminate state on the native control", () => {
    render(Checkbox, { props: { label: "A", indeterminate: true } });
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
  });

  it("reflects invalid via aria-invalid", () => {
    render(Checkbox, { props: { label: "A", invalid: true } });
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("applies the tabindex to the native control", () => {
    render(Checkbox, { props: { label: "A", tabindex: -1 } });
    expect(screen.getByRole("checkbox").getAttribute("tabindex")).toBe("-1");
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(Checkbox, { props: { label: "A" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(Checkbox, {
      props: { label: "A", disabled: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (indeterminate)", async () => {
    const { container } = render(Checkbox, {
      props: { label: "A", indeterminate: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
