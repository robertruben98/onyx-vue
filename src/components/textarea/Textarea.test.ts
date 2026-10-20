import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Textarea from "./Textarea.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Textarea (Vue)", () => {
  it("associates a visible label with the control", () => {
    render(Textarea, { props: { label: "Bio" } });
    expect(screen.getByLabelText("Bio")).toBeTruthy();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(Textarea, { props: { ariaLabel: "Notes" } });
    expect(screen.getByLabelText("Notes")).toBeTruthy();
  });

  it("emits valueChange as the user types", async () => {
    const { emitted } = render(Textarea, { props: { label: "Bio" } });
    const el = screen.getByLabelText("Bio");
    await fireEvent.update(el, "hi");
    const events = emitted().valueChange as unknown[][];
    expect(events).toBeTruthy();
    expect(events[events.length - 1]).toEqual(["hi"]);
  });

  it("supports v-model via update:modelValue", async () => {
    const { emitted } = render(Textarea, { props: { label: "Bio" } });
    const el = screen.getByLabelText("Bio");
    await fireEvent.update(el, "world");
    const events = emitted()["update:modelValue"] as unknown[][];
    expect(events[events.length - 1]).toEqual(["world"]);
  });

  it("writes the model value into the control", () => {
    render(Textarea, { props: { label: "Bio", modelValue: "hello" } });
    expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe(
      "hello",
    );
  });

  it("is reachable by keyboard", () => {
    render(Textarea, { props: { label: "Bio" } });
    const el = screen.getByLabelText("Bio");
    (el as HTMLTextAreaElement).focus();
    expect(document.activeElement).toBe(el);
  });

  it("applies the configured rows", () => {
    render(Textarea, { props: { label: "Bio", rows: 6 } });
    expect(screen.getByLabelText("Bio").getAttribute("rows")).toBe("6");
  });

  it("reflects invalid via aria-invalid", () => {
    render(Textarea, { props: { label: "Bio", invalid: true } });
    expect(screen.getByLabelText("Bio").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("does NOT accept input when disabled", async () => {
    const { emitted } = render(Textarea, {
      props: { label: "Bio", disabled: true },
    });
    const el = screen.getByLabelText("Bio") as HTMLTextAreaElement;
    expect(el.disabled).toBe(true);
    await fireEvent.update(el, "x");
    expect(emitted().valueChange).toBeFalsy();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(Textarea, { props: { label: "Bio" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = render(Textarea, {
      props: { label: "Bio", invalid: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("gives independent ids to two instances so each label targets its own control", () => {
    const { container } = render({
      render() {
        return h("div", [h(Textarea, { label: "First" }), h(Textarea, { label: "Second" })]);
      },
    });
    const controls = [...container.querySelectorAll("textarea")];
    const labels = [...container.querySelectorAll("label")];
    expect(controls.length).toBe(2);
    const ids = controls.map((c) => c.id);
    expect(new Set(ids).size).toBe(2);
    labels.forEach((label, i) => {
      expect(label.getAttribute("for")).toBe(controls[i].id);
    });
  });
});
