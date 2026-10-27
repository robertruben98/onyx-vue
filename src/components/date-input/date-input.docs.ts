import type { ComponentDoc } from "../../docs-model";

export const dateInputDoc: ComponentDoc = {
  id: "date-input",
  title: "Date Input",
  description:
    "A day, a time, both or a month, with the browser's own picker and the look of Input. The value is ISO (`2026-10-04`, `13:00`), whatever format the user's locale shows.",
  imports: ["UiDateInput"],
  api: [
    { name: "v-model", type: "string", default: "''", description: "The value in ISO format, or ''." },
    { name: "type", type: "'date' | 'time' | 'datetime-local' | 'month'", default: "'date'", description: "What is picked." },
    { name: "label", type: "string", default: "''", description: "Visible label." },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name when there is no visible label." },
    { name: "min", type: "string", default: "''", description: "Earliest accepted value, in the input's format." },
    { name: "max", type: "string", default: "''", description: "Latest accepted value." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control size." },
    { name: "invalid", type: "boolean", default: "false", description: "Sets `aria-invalid` and the error style." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    { name: "@valueChanged", type: "(value: string) => void", default: "—", description: "Emitted on every change, in addition to `v-model`." },
  ],
  demos: [
    {
      title: "Day",
      code: `<UiDateInput v-model="day" label="Release date" min="2026-10-01" />
<span>{{ day || 'no date' }}</span>`,
      setup: () => ({ day: "2026-10-04" }),
    },
    {
      title: "Time and date-time",
      code: `<UiDateInput v-model="at" type="time" label="Starts at" size="sm" />
<UiDateInput v-model="when" type="datetime-local" label="Schedule for" />`,
      setup: () => ({ at: "09:30", when: "" }),
    },
    { title: "Invalid", code: `<UiDateInput label="Deadline" invalid model-value="2026-09-01" />` },
  ],
};
