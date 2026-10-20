import type { ComponentDoc } from "../../docs-model";

export const heatStripDoc: ComponentDoc = {
  id: "heat-strip",
  title: "Heat Strip",
  description:
    "One cell per bucket, shaded by how busy the bucket was — the shape of a day in the width of a sentence. Intensity is relative to the busiest bucket, and any bucket with something in it is always at least one step above empty.",
  imports: ["UiHeatStrip"],
  api: [
    {
      name: "values",
      type: "number[]",
      default: "—",
      description: "One value per bucket, in bucket order.",
    },
    {
      name: "levels",
      type: "number",
      default: "4",
      description: "How many intensity steps above zero.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "What the strip measures. The accessible name reports the total and the peak, since the cells themselves say nothing out loud.",
    },
    {
      name: "bucketLabel",
      type: "(index: number, value: number) => string",
      default: "index: value",
      description: "Names one bucket, for its tooltip.",
    },
    {
      name: "legend",
      type: "string",
      default: "''",
      description: "Scale caption rendered after the cells.",
    },
  ],
  demos: [
    {
      title: "A day by the hour",
      code: `<UiHeatStrip
  :values="hours"
  label="commits by hour"
  legend="00 · 06 · 12 · 18 · 23"
  :bucket-label="(h, n) => \`\${String(h).padStart(2, '0')}:00 — \${n} commits\`"
/>`,
      setup: () => ({
        hours: [0, 0, 0, 0, 0, 0, 0, 1, 3, 6, 2, 0, 0, 1, 4, 5, 2, 1, 7, 9, 3, 0, 0, 0],
      }),
    },
    {
      title: "A quiet strip is still a strip",
      description:
        "Every bucket empty renders as a row of empty cells — which reads as 'nothing happened', not as 'nothing was measured'.",
      code: `<UiHeatStrip :values="[0, 0, 0, 0, 0, 0]" label="deploys" />`,
    },
  ],
};
