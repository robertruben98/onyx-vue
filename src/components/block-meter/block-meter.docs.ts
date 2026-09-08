import type { ComponentDoc } from "../../docs-model";

export const blockMeterDoc: ComponentDoc = {
  id: "block-meter",
  title: "Block Meter",
  description:
    "Progress drawn in text — eight glyphs that fit inside a dense table row where a graphical bar would not. It costs no layout, survives being copied out of the page as text, and still announces itself as a progressbar. Use ProgressBar when the bar is the point; use this one when the row is.",
  imports: ["UiBlockMeter"],
  api: [
    {
      name: "value",
      type: "number",
      default: "—",
      description: "Current value.",
    },
    {
      name: "max",
      type: "number",
      default: "100",
      description: "Value that fills the meter.",
    },
    {
      name: "blocks",
      type: "number",
      default: "8",
      description: "How many blocks the meter is drawn with.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "What is being measured. Goes into the accessible name, which states the measurement and never the glyphs.",
    },
    {
      name: "tone",
      type: "'neutral' | 'ok' | 'warn' | 'danger' | 'info'",
      default: "'neutral'",
      description:
        "Tone of the filled part. The empty part is a track and stays quiet.",
    },
    {
      name: "showRatio",
      type: "boolean",
      default: "false",
      description: "Renders `value/max` after the blocks.",
    },
    {
      name: "filledGlyph",
      type: "string",
      default: "'▰'",
      description: "Glyph for a filled block.",
    },
    {
      name: "emptyGlyph",
      type: "string",
      default: "'▱'",
      description: "Glyph for an empty block.",
    },
  ],
  demos: [
    {
      title: "A checklist inside a row",
      code: `<UiBlockMeter :value="3" :max="7" :blocks="7" label="workflow" show-ratio />
<UiBlockMeter :value="7" :max="7" :blocks="7" label="workflow" tone="ok" show-ratio />`,
    },
    {
      title: "A budget running out",
      description:
        "The tone is the consumer's call: it knows where the thresholds are.",
      code: `<UiBlockMeter :value="4200" :max="5000" label="api budget" tone="ok" />
<UiBlockMeter :value="820" :max="5000" label="api budget" tone="warn" />
<UiBlockMeter :value="120" :max="5000" label="api budget" tone="danger" />`,
    },
  ],
};
