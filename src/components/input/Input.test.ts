import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Input from "./Input.vue";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("Input (Vue)", () => {
  it("associates a visible label with the input", () => {
    render(Input, { props: { label: "Email" } });
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(Input, { props: { ariaLabel: "Search" } });
    expect(screen.getByLabelText("Search")).toBeTruthy();
  });

  it("emits valueChange as the user types", async () => {
    const { emitted } = render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    await fireEvent.update(el, "abc");
    expect(emitted().valueChange).toBeTruthy();
    expect(emitted().valueChange.at(-1)).toEqual(["abc"]);
  });

  it("supports v-model via update:modelValue", async () => {
    const { emitted } = render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    await fireEvent.update(el, "hello");
    expect(emitted()["update:modelValue"].at(-1)).toEqual(["hello"]);
  });

  it("writes the modelValue into the input", () => {
    render(Input, { props: { label: "Name", modelValue: "initial" } });
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "initial",
    );
  });

  it("is reachable by keyboard (focusable)", () => {
    render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    el.focus();
    expect(document.activeElement).toBe(el);
  });

  it("reflects invalid state via aria-invalid", () => {
    render(Input, { props: { label: "Name", invalid: true } });
    expect(
      screen.getByLabelText("Name").getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("does NOT emit when disabled", async () => {
    const { emitted } = render(Input, {
      props: { label: "Name", disabled: true },
    });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    expect(el.disabled).toBe(true);
    await fireEvent.input(el, { target: { value: "abc" } });
    expect(emitted().valueChange).toBeFalsy();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(Input, { props: { label: "Email" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = render(Input, {
      props: { label: "Email", invalid: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(Input, {
      props: { label: "Email", disabled: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
