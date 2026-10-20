import type { ComponentDoc } from "../../docs-model";

export const sparkBarsDoc: ComponentDoc = {
  id: "spark-bars",
  title: "Spark Bars",
  description:
    "A short labelled series — the context a single number does not carry. A 20 on its own says nothing about whether it was a good day; with the six days behind it, it does. One bar can be marked as the one the reader is standing on, and it is the only one that takes colour.",
  imports: ["UiSparkBars"],
  api: [
    {
      name: "bars",
      type: "SparkBar[]",
      default: "—",
      description:
        "The series in reading order. Each bar is { label, value, current?, title? }.",
    },
    {
      name: "max",
      type: "number | null",
      default: "null",
      description:
        "Value that fills a bar. Defaults to the tallest bar, so the series scales to itself.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "What the series measures. The accessible name reads out every bar, since the bars themselves are hidden from assistive tech.",
    },
    {
      name: "minFilled",
      type: "number",
      default: "8",
      description:
        "Floor for a non-zero bar, in percent. Without it a 1 against a peak of 200 rounds to nothing and reads as a zero.",
    },
  ],
  demos: [
    {
      title: "A week of commits",
      code: `<UiSparkBars :bars="week" label="commits per day" />`,
      setup: () => ({
        week: [
          { label: "jue", value: 22 },
          { label: "vie", value: 25 },
          { label: "sab", value: 0 },
          { label: "dom", value: 4 },
          { label: "lun", value: 36 },
          { label: "mar", value: 89 },
          { label: "hoy", value: 20, current: true },
        ],
      }),
    },
    {
      title: "A fixed ceiling",
      description:
        "Pass `max` when the series has to be read against a target instead of against itself.",
      code: `<UiSparkBars
  :bars="[{ label: 'p50', value: 40 }, { label: 'p95', value: 120 }, { label: 'p99', value: 260 }]"
  :max="300"
  label="latency"
/>`,
    },
  ],
};
