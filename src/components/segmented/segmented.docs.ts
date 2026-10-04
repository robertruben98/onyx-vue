import type { ComponentDoc } from "../../docs-model";

export const segmentedDoc: ComponentDoc = {
  id: "segmented",
  title: "Segmented",
  description:
    "One of two to five options, side by side: a view switch (calendar / list), a period, a mode. Built on native radios, so arrow keys and form submission work as the browser does them.",
  imports: ["UiSegmented"],
  api: [
    { name: "v-model", type: "string", default: "''", description: "The selected value." },
    { name: "options", type: "{ value: string; label: string; disabled?: boolean }[]", default: "—", description: "The choices, in order." },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name of the group." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "Control size." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the whole control." },
    { name: "@changed", type: "(value: string) => void", default: "—", description: "Emitted when the user picks another option, in addition to `v-model`." },
  ],
  demos: [
    {
      title: "View switch",
      code: `<UiSegmented v-model="view" aria-label="View" :options="[{ value: 'calendar', label: 'Calendar' }, { value: 'list', label: 'List' }]" />
<span>{{ view }}</span>`,
      setup: () => ({ view: "calendar" }),
    },
    {
      title: "Small, with a disabled option",
      code: `<UiSegmented v-model="range" size="sm" aria-label="Period" :options="[{ value: '24h', label: '24 h' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '1y', label: '1 year', disabled: true }]" />`,
      setup: () => ({ range: "7d" }),
    },
  ],
};
