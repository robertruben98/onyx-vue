import type { ComponentDoc } from "../../docs-model";

export const textareaDoc: ComponentDoc = {
  id: "textarea",
  title: "Textarea",
  description: "Multi-line text field. Same label, invalid and disabled contract as Input.",
  imports: ["UiTextarea"],
  api: [
    { name: "v-model", type: "string", default: "''", description: "Two-way bound value." },
    { name: "rows", type: "number", default: "3", description: "Visible rows." },
    { name: "placeholder", type: "string", default: "''", description: "Placeholder text." },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label linked to the control.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when there is no visible label.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Sets `aria-invalid` and the invalid border token.",
    },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    {
      name: "@valueChange",
      type: "(value: string) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiTextarea v-model="value" label="Bio" :rows="3" placeholder="Tell us about yourself…" />
<span>{{ value.length }} characters</span>`,
      setup: () => ({ value: "" }),
    },
    { title: "Invalid", code: `<UiTextarea label="Bio" invalid placeholder="Required" />` },
    {
      title: "Disabled",
      code: `<UiTextarea label="Bio" disabled model-value="Read only" />`,
    },
  ],
};
