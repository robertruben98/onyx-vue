import type { ComponentDoc } from "../../docs-model";

export const selectDoc: ComponentDoc = {
  id: "select",
  title: "Select",
  description:
    "Single-choice combobox with a listbox that teleports to `body`, so it escapes any ancestor's `overflow: hidden`. That teleport is also why a theme preset has to be applied on the root element and not on a wrapper.",
  imports: ["UiSelect"],
  api: [
    {
      name: "v-model",
      type: "string | null",
      default: "null",
      description: "Selected value.",
    },
    {
      name: "options",
      type: "SelectOption[]",
      default: "[]",
      description: "`{ value, label, disabled? }` per option.",
    },
    {
      name: "placeholder",
      type: "string",
      default: "'Select…'",
      description: "Shown when nothing is selected. Also the fallback accessible name.",
    },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    {
      name: "@change",
      type: "(value: string | null) => void",
      default: "—",
      description: "Emitted when the user picks an option.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiSelect v-model="tool" :options="options" aria-label="Tool" />
<span>selected: {{ tool ?? '(none)' }}</span>`,
      setup: () => ({
        tool: null,
        options: [
          { value: "vue", label: "Vue" },
          { value: "rx", label: "RxJS" },
          { value: "sd", label: "Style Dictionary" },
          { value: "vt", label: "Vitest", disabled: true },
        ],
      }),
    },
    {
      title: "Placeholder and preselection",
      code: `<UiSelect :options="options" placeholder="Pick a tool…" aria-label="Empty" />
<UiSelect :options="options" model-value="rx" aria-label="Preselected" />`,
      setup: () => ({
        options: [
          { value: "vue", label: "Vue" },
          { value: "rx", label: "RxJS" },
        ],
      }),
    },
    {
      title: "Disabled",
      code: `<UiSelect :options="options" disabled aria-label="Disabled" />`,
      setup: () => ({ options: [{ value: "vue", label: "Vue" }] }),
    },
  ],
};
