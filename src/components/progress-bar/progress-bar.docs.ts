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
  ],
};
