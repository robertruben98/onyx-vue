import type { ComponentDoc } from "../../docs-model";

export const readoutDoc: ComponentDoc = {
  id: "readout",
  title: "Readout",
  description:
    "One large instrument figure with a caption and an optional unit. Not a metric chip: a chip is one of many and stays small, a readout is the figure read from across the desk. Use one or two per view. It picks up the phosphor bloom under the matrix preset and is simply a large number everywhere else.",
  imports: ["UiReadout"],
  api: [
    {
      name: "value",
      type: "string | number",
      default: "—",
      description:
        "The figure. A string is allowed so `06.0`, `BYPASS` and `—` are all valid readings.",
    },
    { name: "label", type: "string", default: "—", description: "What is being measured." },
    {
      name: "unit",
      type: "string",
      default: "—",
      description: "Rendered smaller next to the value: `s`, `%`, `ms`.",
    },
    {
      name: "tone",
      type: "'default' | 'success' | 'warning' | 'danger' | 'muted'",
      default: "'default'",
      description: "Semantic tone of the figure. `muted` also drops the glow.",
    },
  ],
  demos: [
    { title: "Duration", code: `<UiReadout label="Tiempo" value="6.0" unit="s" />` },
    { title: "A state as the figure", code: `<UiReadout label="Cache" value="BYPASS" tone="warning" />` },
  ],
};
