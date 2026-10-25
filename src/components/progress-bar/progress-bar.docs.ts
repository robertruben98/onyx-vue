import type { ComponentDoc } from "../../docs-model";

export const progressBarDoc: ComponentDoc = {
  id: "progress-bar",
  title: "Progress Bar",
  description:
    "Determinate or indeterminate progress. In indeterminate mode `aria-valuenow` is omitted rather than set to zero, which is what tells assistive tech the progress is unknown instead of stalled.",
  imports: ["UiProgressBar"],
  api: [
    { name: "value", type: "number", default: "0", description: "Current value, clamped to 0–max." },
    { name: "max", type: "number", default: "100", description: "Maximum value." },
    {
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Unknown progress: animates and drops `aria-valuenow`.",
    },
    { name: "label", type: "string", default: "''", description: "Accessible label." },
    { name: "startLabel", type: "string", default: "''", description: "Text at the start of the bar, e.g. the current level \"18\". Visual only: the aria values do not change." },
    { name: "endLabel", type: "string", default: "''", description: "Text at the end of the bar, e.g. the next level \"19\"." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Thickness: 4px, --ui-progress-height (8px), 12px." },
  ],
  demos: [
    {
      title: "Determinate",
      code: `<div style="width: 100%; display: grid; gap: 12px">
  <UiProgressBar :value="25" label="Step 1 of 4" />
  <UiProgressBar :value="70" label="Upload" />
  <UiProgressBar :value="100" label="Done" />
</div>`,
    },
    {
      title: "Indeterminate",
      code: `<div style="width: 100%"><UiProgressBar indeterminate label="Loading" /></div>`,
    },
    {
      title: "Live",
      code: `<div style="width: 100%; display: grid; gap: 10px; justify-items: start">
  <UiProgressBar :value="value" label="Upload" />
  <UiButton size="sm" @clicked="value = (value + 20) % 120">Advance</UiButton>
</div>`,
      setup: () => ({ value: 20 }),
    },
    {
      title: "End labels and sizes",
      code: `<div style="width: 100%; display: grid; gap: 12px">
  <UiProgressBar :value="62" label="Progress to level 19: 62%" start-label="18" end-label="19" size="lg" />
  <UiProgressBar :value="40" label="Reading" size="sm" />
</div>`,
    },
  ],
};
