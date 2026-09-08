import type { ComponentDoc } from "../../docs-model";

export const radioGroupDoc: ComponentDoc = {
  id: "radio-group",
  title: "Radio Group",
  description:
    "Single choice from a list of options, rendered as a `<fieldset>` with a `<legend>`. Options are data, not markup, so the group cannot end up with two radios sharing a name.",
  imports: ["UiRadioGroup"],
  api: [
    { name: "v-model", type: "string", default: "''", description: "Selected value." },
    {
      name: "options",
      type: "RadioOption[]",
      default: "— (required)",
      description: "`{ label, value, disabled? }` per option.",
    },
    { name: "label", type: "string", default: "''", description: "Visible group label (`<legend>`)." },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when there is no visible label.",
    },
    { name: "invalid", type: "boolean", default: "false", description: "Sets `aria-invalid`." },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the whole group; selection is ignored.",
    },
    {
      name: "@valueChange",
      type: "(value: string) => void",
      default: "—",
      description: "Emitted on every selection change.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiRadioGroup v-model="size" label="Size" :options="options" />
<span>selected: {{ size || '(none)' }}</span>`,
      setup: () => ({
        size: "md",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      }),
    },
    {
      title: "Disabled option",
      code: `<UiRadioGroup label="Size" :options="options" />`,
      setup: () => ({
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "X-Large", value: "xl", disabled: true },
        ],
      }),
    },
    {
      title: "Invalid and disabled group",
      code: `<UiRadioGroup label="Size" invalid :options="options" />
<UiRadioGroup label="Size" disabled :options="options" />`,
      setup: () => ({
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
        ],
      }),
    },
  ],
};
