import type { ComponentDoc } from "../../docs-model";

export const formFieldDoc: ComponentDoc = {
  id: "form-field",
  title: "Form Field",
  description:
    "A control with its label, a hint and an error, wired together: the slot gives the control its id and the ids to put in `aria-describedby`, so screen readers read the hint and the error with the field.",
  imports: ["UiFormField", "UiInput", "UiSelect"],
  api: [
    { name: "label", type: "string", default: "—", description: "What the field is (required)." },
    { name: "help", type: "string", default: "''", description: "A hint under the control." },
    { name: "error", type: "string", default: "''", description: "What is wrong. Non-empty marks the field invalid." },
    { name: "required", type: "boolean", default: "false", description: "Shows an asterisk; pass `required` to the control too." },
    {
      name: "#default",
      type: "slot { id, describedBy, invalid, required }",
      default: "—",
      description: "The control. Bind `id`, `aria-describedby` and `invalid` (or `aria-invalid`) to it.",
    },
  ],
  demos: [
    {
      title: "With a hint",
      code: `<UiFormField label="Email" help="We only use it for receipts." required v-slot="{ id, describedBy, invalid, required }">
  <UiInput :id="id" v-model="email" type="email" :aria-describedby="describedBy" :invalid="invalid" :required="required" />
</UiFormField>`,
      setup: () => ({ email: "" }),
    },
    {
      title: "With an error",
      code: `<UiFormField label="Team" error="Pick the team that owns the service." v-slot="{ id, describedBy, invalid }">
  <UiSelect :id="id" v-model="team" :aria-describedby="describedBy" :aria-invalid="invalid" :options="[{ value: 'payments', label: 'Payments' }, { value: 'platform', label: 'Platform' }]" />
</UiFormField>`,
      setup: () => ({ team: null }),
    },
  ],
};
