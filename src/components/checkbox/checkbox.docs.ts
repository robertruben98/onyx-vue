import type { ComponentDoc } from "../../docs-model";

export const checkboxDoc: ComponentDoc = {
  id: "checkbox",
  title: "Checkbox",
  description:
    "Boolean control with an optional tri-state dash. `indeterminate` is a DOM property, not an attribute, so it is applied imperatively the moment the native input is patched in — it is correct on the very first render, not one tick later. Listening to a deprecated event warns once per name per page load in development; old events remain until 1.0.",
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
      name: "@checkedChanged / @checkedChange",
      type: "(value: boolean) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`. `@checkedChange` is the deprecated name of the same event, still emitted until 1.0.",
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
      title: "Long labels in a narrow column",
      description:
        "A label that wraps keeps the box at its size and on the first line, so a list of mixed lengths lines up.",
      code: `<div style="display: grid; gap: 8px; max-width: 16rem">
  <UiCheckbox label="Cancel the trial" />
  <UiCheckbox label="Move the gym membership to the cheaper plan before it renews in November" />
  <UiCheckbox label="Ask the bank" />
  <UiCheckbox size="lg" label="Sell the second monitor and the old phone on a second-hand site" />
</div>`,
    },
    {
      title: "Invalid and disabled",
      code: `<UiCheckbox invalid label="Invalid" />
<UiCheckbox disabled label="Disabled" />`,
    },
  ],
};
