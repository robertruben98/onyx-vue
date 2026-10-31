import type { ComponentDoc } from "../../docs-model";

export const selectDoc: ComponentDoc = {
  id: "select",
  title: "Select",
  description:
    "Escape closes only the most recently opened overlay; a containing dialog remains open until the next Escape. The open list follows its trigger on scroll and resize. Single-choice combobox with a listbox that teleports to `body`, so it escapes any ancestor's `overflow: hidden`. That teleport is also why a theme preset has to be applied on the root element and not on a wrapper. Listening to a deprecated event warns once per name per page load in development; old events remain until 1.0.",
  imports: ["UiSelect", "UiDialog", "UiButton", "UiFormField"],
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
      description: "Shown when nothing is selected. Used as the accessible name only without a UiFormField label, ariaLabel or ariaLabelledby.",
    },
    { name: "ariaLabel", type: "string", default: "''", description: "Explicit accessible name; overrides the placeholder and UiFormField label. ariaLabelledby takes precedence." },
    {
      name: "ariaLabelledby",
      type: "string",
      default: "''",
      description: "Id of the element that names the combobox (e.g. a UiFieldRow label). Wins over ariaLabel.",
    },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    {
      name: "@changed / @change",
      type: "(value: string | null) => void",
      default: "—",
      description: "Emitted when the user picks an option. `@change` is the deprecated name of the same event, still emitted until 1.0.",
    },
  ],
  demos: [
    {
      title: "Labelled by a form field",
      description: "The visible field label names the combobox automatically; the placeholder only describes the empty selection. In UiFieldRow, bind its slot labelId to aria-labelledby.",
      code: `<UiFormField label="Estado">
  <UiSelect placeholder="Select…" :options="[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]" />
</UiFormField>`,
    },
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
      title: "Inside a dialog",
      description:
        "The list opens over the dialog, even where it covers the next field. A click outside the list closes the list and leaves the dialog open; Esc closes the list first and the dialog on a second press.",
      code: `<UiButton @clicked="open = true">Edit row</UiButton>
<UiDialog v-model:open="open" heading="Edit row">
  <div style="display: grid; gap: 12px">
    <UiSelect v-model="state" :options="states" aria-label="State" />
    <UiSelect v-model="result" :options="results" aria-label="Result" />
  </div>
</UiDialog>`,
      setup: () => ({
        open: false,
        state: "open",
        result: "pending",
        states: [
          { value: "open", label: "Open" },
          { value: "done", label: "Done" },
          { value: "dropped", label: "Dropped" },
          { value: "parked", label: "Parked" },
        ],
        results: [
          { value: "pending", label: "Pending" },
          { value: "won", label: "Won" },
          { value: "lost", label: "Lost" },
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
