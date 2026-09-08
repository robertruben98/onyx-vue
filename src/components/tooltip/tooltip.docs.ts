import type { ComponentDoc } from "../../docs-model";

export const tooltipDoc: ComponentDoc = {
  id: "tooltip",
  title: "Tooltip",
  description:
    "Text attached to a trigger, shown on hover and on focus. It teleports to `body` and positions itself against the trigger's box, so it is never clipped by an ancestor's overflow.",
  imports: ["UiTooltip"],
  api: [
    {
      name: "text",
      type: "string",
      default: "— (required)",
      description: "Tooltip text. An empty string suppresses the tooltip entirely.",
    },
    {
      name: "placement",
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      description: "Preferred placement, centered on the cross axis.",
    },
    {
      name: "@toggle",
      type: "(shown: boolean) => void",
      default: "—",
      description: "Emitted whenever the tooltip is shown or hidden.",
    },
    { name: "#default", type: "slot", default: "—", description: "The trigger." },
  ],
  demos: [
    {
      title: "Hover or focus the trigger",
      code: `<UiTooltip text="Saves your changes">
  <UiButton>Save</UiButton>
</UiTooltip>`,
    },
    {
      title: "Placements",
      code: `<UiTooltip text="Above" placement="top"><UiButton variant="secondary">top</UiButton></UiTooltip>
<UiTooltip text="Below" placement="bottom"><UiButton variant="secondary">bottom</UiButton></UiTooltip>
<UiTooltip text="Left" placement="left"><UiButton variant="secondary">left</UiButton></UiTooltip>
<UiTooltip text="Right" placement="right"><UiButton variant="secondary">right</UiButton></UiTooltip>`,
    },
  ],
};
