import type { ComponentDoc } from "../../docs-model";

export const inputDoc: ComponentDoc = {
  id: "input",
  title: "Input",
  description:
    "Single-line text field with a visible label or an accessible name. Exposes `focus()` and `select()`, because a `ref` on the component is not an element and `ref.querySelector('input')` throws.",
  imports: ["UiInput"],
  api: [
    {
      name: "v-model",
      type: "string",
      default: "''",
      description: "Two-way bound value.",
    },
    {
      name: "type",
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'",
      default: "'text'",
      description: "Native input type.",
    },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control height." },
    { name: "placeholder", type: "string", default: "''", description: "Placeholder text." },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label, rendered as a `<label>` linked to the input.",
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
    {
      name: "focus() / select()",
      type: "exposed methods",
      default: "—",
      description:
        "Focus or select the native input through a component ref: `caja.value?.focus()`.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiInput v-model="value" label="Email" type="email" placeholder="you@example.com" />
<span>value: {{ value || '(empty)' }}</span>`,
      setup: () => ({ value: "" }),
    },
    {
      title: "Sizes",
      code: `<UiInput size="sm" label="Small" placeholder="sm" />
<UiInput label="Medium" placeholder="md" />
<UiInput size="lg" label="Large" placeholder="lg" />`,
    },
    {
      title: "Invalid and disabled",
      code: `<UiInput label="Invalid" invalid placeholder="Required" />
<UiInput label="Disabled" disabled model-value="Read only" />`,
    },
    {
      title: "Programmatic focus",
      code: `<UiInput ref="caja" aria-label="Search" placeholder="Press the button" />
<UiButton size="sm" @clicked="$refs.caja.focus()">Focus the field</UiButton>`,
    },
  ],
};
