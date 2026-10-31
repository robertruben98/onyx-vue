import type { ComponentDoc } from "../../docs-model";

export const selectDoc: ComponentDoc = {
  id: "select",
  title: "Select",
  description:
    "Type to find enabled options by label, ignoring case and accents. Characters typed within 500 ms form a prefix; repeating one letter cycles matches. On the closed, focused trigger, typing selects immediately and emits changed without opening. In the open list, typing moves the active option; Enter confirms it; Space confirms when no search is in progress. Keyboard navigation keeps the active option visible, and clipped edges fade when more options are available. Escape closes only the most recently opened overlay; a containing dialog remains open until the next Escape. The open list follows its trigger on scroll and resize. Single-choice combobox with a listbox that teleports to `body`, so it escapes any ancestor's `overflow: hidden`. That teleport is also why a theme preset has to be applied on the root element and not on a wrapper. Listening to a deprecated event warns once per name per page load in development; old events remain until 1.0. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
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
      title: "Long list and type-ahead",
      description: "Try c repeatedly, dr quickly, or un for Única. Scroll or use Home/End to see the clipped-edge fades disappear at each end.",
      code: `<UiSelect v-model="state" :options="states" aria-label="Long state list" style="width: 280px; max-width: 100%" />
<span>selected: {{ state ?? '(none)' }}</span>`,
      setup: () => ({
        state: null,
        states: [
          { value: "approved", label: "Aprobada" },
          { value: "cancelled", label: "Cancelada" },
          { value: "closed", label: "Cerrada", disabled: true },
          { value: "completed", label: "Completada" },
          { value: "done", label: "Done" },
          { value: "dropped", label: "Dropped" },
          { value: "pending", label: "Pendiente" },
          { value: "review", label: "Revisión" },
          { value: "unique", label: "Única" },
          { value: "united", label: "Unida" },
          { value: "verified", label: "Verificada" },
          { value: "waiting", label: "Waiting" },
        ],
      }),
    },
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
