import type { ComponentDoc } from "../../docs-model";

export const metricChipDoc: ComponentDoc = {
  id: "metric-chip",
  title: "Metric Chip",
  description:
    "One number and its caption, sized for a top bar. It takes four states, not a bare number: a failed measurement shows as failed and never as a zero, and a value being recomputed fades instead of disappearing. Optionally a button, for a chip that opens the screen behind the number.",
  imports: ["UiMetricChip"],
  api: [
    {
      name: "label",
      type: "string",
      default: "—",
      description: "What is being measured. Rendered as the caption.",
    },
    {
      name: "value",
      type: "number | null",
      default: "null",
      description: "The measurement. Only read when state is 'known'.",
    },
    {
      name: "state",
      type: "'known' | 'pending' | 'unrequested' | 'error'",
      default: "'known'",
      description:
        "Whether the value is a fact, in flight, never asked for, or failed to compute.",
    },
    {
      name: "tone",
      type: "'neutral' | 'ok' | 'warn' | 'danger' | 'info'",
      default: "'neutral'",
      description: "Tone of a known value. An error is always danger.",
    },
    {
      name: "stale",
      type: "boolean",
      default: "false",
      description:
        "Fades a value that is being recomputed behind the scenes. It stays readable — it was true a moment ago.",
    },
    {
      name: "interactive",
      type: "boolean",
      default: "false",
      description: "Renders a real button and emits activated.",
    },
    {
      name: "errorGlyph",
      type: "string",
      default: "'!'",
      description: "Glyph shown when the measurement failed.",
    },
    {
      name: "@activated",
      type: "() => void",
      default: "—",
      description: "Fired when an interactive chip is activated.",
    },
  ],
  demos: [
    {
      title: "The four states",
      description:
        "A zero, a dot, a dash and a bang are four different claims. Only the first one says the work was counted and came to nothing.",
      code: `<UiMetricChip label="commits hoy" :value="23" tone="ok" />
<UiMetricChip label="commits hoy" :value="0" />
<UiMetricChip label="commits hoy" state="pending" />
<UiMetricChip label="commits hoy" state="error" />`,
    },
    {
      title: "Stale, and clickable",
      code: `<UiMetricChip label="commits hoy" :value="23" tone="ok" stale />
<UiMetricChip label="commits hoy" :value="23" tone="ok" interactive />`,
    },
  ],
};
