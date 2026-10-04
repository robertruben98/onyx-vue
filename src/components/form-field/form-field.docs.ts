import type { ComponentDoc } from "../../docs-model";

export const formFieldDoc: ComponentDoc = {
  id: "form-field",
  title: "Form Field",
  description:
    "A control with its label, a hint and an error, wired together. The library's form controls inside it pick up its id, the hint and error ids for `aria-describedby`, and whether it is invalid or required, so screen readers read the hint and the error with the field and you write no bindings.",
  imports: ["UiFormField", "UiInput", "UiSelect"],
  api: [
    { name: "label", type: "string", default: "—", description: "What the field is (required)." },
    { name: "help", type: "string", default: "''", description: "A hint under the control." },
    { name: "error", type: "string", default: "''", description: "What is wrong. Non-empty marks the field and its control invalid." },
    { name: "required", type: "boolean", default: "false", description: "Shows an asterisk and makes the control required." },
    {
      name: "#default",
      type: "slot { id, describedBy, invalid, required }",
      default: "—",
      description:
        "The control. UiInput, UiTextarea, UiSelect, UiDateInput, UiCheckbox, UiSwitch and UiSlider wire themselves; for any other control bind the slot values. Only the first control in a field takes its id, and what you bind explicitly wins.",
    },
  ],
  demos: [
    {
      title: "With a hint",
      code: `<UiFormField label="Email" help="We only use it for receipts." required>
  <UiInput v-model="email" type="email" />
</UiFormField>`,
      setup: () => ({ email: "" }),
    },
    {
      title: "With an error",
      code: `<UiFormField label="Team" error="Pick the team that owns the service.">
  <UiSelect v-model="team" :options="[{ value: 'payments', label: 'Payments' }, { value: 'platform', label: 'Platform' }]" />
</UiFormField>`,
      setup: () => ({ team: null }),
    },
    {
      title: "Any other control",
      description: "A native or third-party control takes the same values from the slot.",
      code: `<UiFormField label="Colour" help="Used for the chart series." v-slot="{ id, describedBy }">
  <input :id="id" type="color" :aria-describedby="describedBy" value="#047857" />
</UiFormField>`,
    },
  ],
};
