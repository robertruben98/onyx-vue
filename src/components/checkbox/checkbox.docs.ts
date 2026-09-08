import type { ComponentDoc } from "../../docs-model";

export const checkboxDoc: ComponentDoc = {
  id: "checkbox",
  title: "Checkbox",
  description:
    "Boolean control with an optional tri-state dash. `indeterminate` is a DOM property, not an attribute, so it is applied imperatively the moment the native input is patched in — it is correct on the very first render, not one tick later.",
  imports: ["UiCheckbox"],
  api: [
    { name: "v-model", type: "boolean", default: "false", description: "Two-way bound checked state." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control size." },
    { name: "label", type: "string", default: "''", description: "Visible label." },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when there is no visible label.",
    },
    {
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Visual dash. Not a checked value — the model stays false.",
    },
    { name: "invalid", type: "boolean", default: "false", description: "Sets `aria-invalid`." },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "A disabled checkbox never emits.",
    },
    {
      name: "tabindex",
      type: "number",
      default: "0",
      description: "Set to -1 inside roving-tabindex grids, such as a data table's select column.",
    },
    {
      name: "@checkedChange",
      type: "(value: boolean) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiCheckbox v-model="accepted" label="Accept terms" />
<span>{{ accepted ? 'accepted' : 'not accepted' }}</span>`,
      setup: () => ({ accepted: false }),
    },
    {
      title: "Indeterminate",
      description: "The dash is a display state; the bound value is still false.",
      code: `<UiCheckbox indeterminate label="Some selected" />`,
    },
    {
      title: "Sizes",
      code: `<UiCheckbox size="sm" label="Small" />
<UiCheckbox label="Medium" />
<UiCheckbox size="lg" label="Large" />`,
    },
    {
      title: "Invalid and disabled",
      code: `<UiCheckbox invalid label="Invalid" />
<UiCheckbox disabled label="Disabled" />`,
    },
  ],
};
