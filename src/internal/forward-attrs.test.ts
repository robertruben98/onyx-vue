import { render } from "@testing-library/vue";
import type { Component } from "vue";
import { UiButton } from "../components/button";
import { UiCheckbox } from "../components/checkbox";
import { UiConfirmButton } from "../components/confirm-button";
import { UiInput } from "../components/input";
import { UiSelect } from "../components/select";
import { UiSwitch } from "../components/switch";
import { UiTextarea } from "../components/textarea";

// Un control envuelto entrega los atributos del consumidor a su elemento
// nativo (G1). Antes caian en la envoltura: un `aria-describedby` que nadie
// asociaba al campo y un `autocomplete` que el navegador no veia.
const CASES = [
  { name: "UiButton", comp: UiButton, control: "button", props: {} },
  { name: "UiConfirmButton", comp: UiConfirmButton, control: "button", props: { label: "Delete" } },
  { name: "UiInput", comp: UiInput, control: "input", props: {} },
  { name: "UiTextarea", comp: UiTextarea, control: "textarea", props: {} },
  { name: "UiCheckbox", comp: UiCheckbox, control: "input", props: {} },
  { name: "UiSwitch", comp: UiSwitch, control: "input", props: {} },
  {
    name: "UiSelect",
    comp: UiSelect,
    control: "[role=combobox]",
    props: { options: [{ value: "a", label: "A" }] },
  },
] as const;

describe.each(CASES)("$name forwards attributes", ({ comp, control, props }) => {
  function mount(attrs: Record<string, unknown>) {
    const { container } = render(comp as Component, { props: { ...props }, attrs, slots: { default: "x" } });
    const root = container.firstElementChild as HTMLElement;
    const el = container.querySelector(control) as HTMLElement;
    return { root, el };
  }

  it("puts aria-* and other attributes on the native control", () => {
    const { root, el } = mount({ "aria-describedby": "hint", "data-test": "probe", name: "field" });
    expect(el.getAttribute("aria-describedby")).toBe("hint");
    expect(el.getAttribute("data-test")).toBe("probe");
    expect(el.getAttribute("name")).toBe("field");
    expect(root === el || !root.hasAttribute("aria-describedby")).toBe(true);
  });

  it("keeps class and style on the wrapper", () => {
    const { root } = mount({ class: "mine", style: "margin-top: 3px" });
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.style.marginTop).toBe("3px");
  });
});

describe.each([
  { name: "UiInput", comp: UiInput, control: "input" },
  { name: "UiTextarea", comp: UiTextarea, control: "textarea" },
  { name: "UiCheckbox", comp: UiCheckbox, control: "input" },
  { name: "UiSwitch", comp: UiSwitch, control: "input" },
])("$name and a consumer id", ({ comp, control }) => {
  it("uses the consumer's id on the control and keeps its own label pointing at it", () => {
    const { container } = render(comp as Component, { props: { label: "Email" }, attrs: { id: "email" } });
    const el = container.querySelector(control) as HTMLElement;
    expect(el.id).toBe("email");
    expect(container.querySelector("label")?.getAttribute("for")).toBe("email");
  });

  it("generates an id when the consumer gives none", () => {
    const { container } = render(comp as Component, { props: { label: "Email" } });
    const el = container.querySelector(control) as HTMLElement;
    expect(el.id).not.toBe("");
    expect(container.querySelector("label")?.getAttribute("for")).toBe(el.id);
  });
});
