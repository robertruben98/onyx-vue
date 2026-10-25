import type { ComponentDoc } from "../../docs-model";

export const chipRowDoc: ComponentDoc = {
  id: "chip-row",
  title: "Chip Row",
  description:
    "Lays out a set of chips (UiChip or UiFilterChip). `wrap` flows onto more lines; `scroll` keeps one line that slides sideways and leaves room around the first and last chip and the focus ring, so neither is clipped by the scroll box.",
  imports: ["UiChipRow", "UiChip"],
  api: [
    {
      name: "overflow",
      type: "'wrap' | 'scroll'",
      default: "'wrap'",
      description:
        "`wrap` onto more lines, or one `scroll`ing line with no visible scrollbar. The scroll inset is `--ui-chip-row-inset` (the focus ring width plus its offset).",
    },
    {
      name: "label",
      type: "string",
      default: "undefined",
      description: "Accessible name. When set, the row is a `role=\"group\"`.",
    },
    { name: "#default", type: "slot", default: "—", description: "The chips." },
  ],
  demos: [
    {
      title: "Scrolling row",
      description: "One line on a narrow screen; the first and last chips keep their full shape.",
      code: `<div style="max-width: 18rem">
  <UiChipRow overflow="scroll" label="Ask about this screen">
    <UiChip>Explain this</UiChip>
    <UiChip>Give me an example</UiChip>
    <UiChip>Is my answer B1?</UiChip>
    <UiChip>Make it simpler</UiChip>
  </UiChipRow>
</div>`,
    },
    {
      title: "Wrapping row",
      code: `<UiChipRow>
  <UiChip>Past simple</UiChip>
  <UiChip>Present perfect</UiChip>
  <UiChip>Future</UiChip>
</UiChipRow>`,
    },
  ],
};
