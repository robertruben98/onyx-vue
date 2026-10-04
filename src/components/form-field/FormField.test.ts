import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick } from "vue";
import FormField from "./FormField.vue";
import { UiInput } from "../input";
import { UiTextarea } from "../textarea";
import { UiDateInput } from "../date-input";
import { UiSelect } from "../select";
import { UiCheckbox } from "../checkbox";
import { UiSwitch } from "../switch";
import { UiSlider } from "../slider";
import { UiButton } from "../button";

/** A field wired the way the docs show it. */
function field(props: { label: string; help?: string; error?: string; required?: boolean }) {
  return render(
    defineComponent({
      setup() {
        return () =>
          h(FormField, props, {
            default: (s: { id: string; describedBy?: string; invalid: boolean; required: boolean }) =>
              h(UiInput, { id: s.id, "aria-describedby": s.describedBy, invalid: s.invalid, required: s.required }),
          });
      },
    }),
  );
}

describe("FormField (Vue)", () => {
  it("labels the control through the id it hands to the slot", () => {
    field({ label: "Email" });
    expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
  });

  it("describes the control with the hint", () => {
    field({ label: "Email", help: "Only for receipts." });
    const el = screen.getByLabelText("Email");
    const hint = document.getElementById(el.getAttribute("aria-describedby") ?? "");
    expect(hint?.textContent).toBe("Only for receipts.");
  });

  it("marks the control invalid and describes it with hint and error", () => {
    field({ label: "Email", help: "Only for receipts.", error: "Not an address." });
    const el = screen.getByLabelText("Email");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    const ids = (el.getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids.length).toBe(2);
    expect(document.getElementById(ids[1])?.textContent).toBe("Not an address.");
  });

  it("leaves aria-describedby off with neither hint nor error", () => {
    field({ label: "Email" });
    expect(screen.getByLabelText("Email").hasAttribute("aria-describedby")).toBe(false);
  });

  it("shows the required mark, hidden from screen readers, and passes required down", () => {
    const { container } = field({ label: "Email", required: true });
    const mark = container.querySelector(".ui-form-field__required");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect((screen.getByRole("textbox") as HTMLInputElement).required).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = field({ label: "Email", help: "Hint", error: "Wrong" });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FormField (Vue) — wires its control without bindings", () => {
  const OPTIONS = '[{ value: "a", label: "A" }]';

  it.each([
    ["UiInput", `<UiInput />`, "input"],
    ["UiTextarea", `<UiTextarea />`, "textarea"],
    ["UiDateInput", `<UiDateInput />`, "input"],
    ["UiSelect", `<UiSelect :options='${OPTIONS}' />`, "[role=combobox]"],
    ["UiCheckbox", `<UiCheckbox />`, "input"],
    ["UiSwitch", `<UiSwitch />`, "input"],
    ["UiSlider", `<UiSlider />`, "input"],
  ])("%s takes the field's id, hint, error and required", async (_name, control, selector) => {
    const { container } = render({
      components: { FormField, UiInput, UiTextarea, UiDateInput, UiSelect, UiCheckbox, UiSwitch, UiSlider },
      template: `<FormField label="Field" help="The hint." error="The error." required>${control}</FormField>`,
    });
    const el = container.querySelector(selector) as HTMLElement;
    const label = container.querySelector(".ui-form-field__label") as HTMLLabelElement;
    expect(el.id).toBe(label.htmlFor);
    const described = (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(["The hint.", "The error."]);
    expect(el.getAttribute("aria-invalid")).toBe("true");
    if (selector !== "[role=combobox]") expect((el as HTMLInputElement).required).toBe(true);
  });

  it("lets explicit bindings win over the field", () => {
    const { container } = render({
      components: { FormField, UiInput },
      template: `<FormField label="Email" help="Hint"><UiInput id="mine" aria-describedby="other" /></FormField>`,
    });
    const el = container.querySelector("input") as HTMLInputElement;
    expect(el.id).toBe("mine");
    expect(el.getAttribute("aria-describedby")).toBe("other");
  });

  it("gives the field to the first control only, never to a button", () => {
    const { container } = render({
      components: { FormField, UiInput, UiButton },
      template: `<FormField label="Range"><UiButton>Reset</UiButton><UiInput aria-label="From" /><UiInput aria-label="To" /></FormField>`,
    });
    const label = container.querySelector(".ui-form-field__label") as HTMLLabelElement;
    const [from, to] = [...container.querySelectorAll("input")];
    expect(container.querySelector("button")?.id).toBe("");
    expect(from.id).toBe(label.htmlFor);
    expect(to.id).not.toBe(label.htmlFor);
  });

  it("hands the field back when its control unmounts, to the next one that mounts", async () => {
    const wrapper = render({
      components: { FormField, UiInput, UiTextarea },
      template: `<FormField label="Body"><UiInput v-if="short" /><UiTextarea v-else /></FormField><button type="button" @click="short = !short">swap</button>`,
      data: () => ({ short: true }),
    });
    const label = wrapper.container.querySelector(".ui-form-field__label") as HTMLLabelElement;
    expect(wrapper.container.querySelector("input")?.id).toBe(label.htmlFor);
    wrapper.getByRole("button", { name: "swap" }).click();
    await nextTick();
    expect(wrapper.container.querySelector("textarea")?.id).toBe(label.htmlFor);
  });

  it("marks the control invalid only while there is an error", async () => {
    const wrapper = render({
      components: { FormField, UiInput },
      template: `<FormField label="Name" :error="err"><UiInput /></FormField><button type="button" @click="err = ''">fix</button>`,
      data: () => ({ err: "Required." }),
    });
    const input = wrapper.container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(wrapper.container.querySelector(".ui-input--invalid")).toBeTruthy();
    wrapper.getByRole("button", { name: "fix" }).click();
    await nextTick();
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(wrapper.container.querySelector(".ui-input--invalid")).toBeNull();
  });
});
