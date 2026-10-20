import type { ComponentDoc } from "../../docs-model";

export const dividerDoc: ComponentDoc = {
  id: "divider",
  title: "Divider",
  description:
    "Separator with an optional centered label. Renders `role=\"separator\"` with the matching `aria-orientation`.",
  imports: ["UiDivider"],
  api: [
    {
      name: "orientation",
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: "Layout orientation.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Centered label. Horizontal only.",
    },
  ],
  demos: [
    { title: "Horizontal", code: `<div style="width: 100%"><UiDivider /></div>` },
    {
      title: "With label",
      code: `<div style="width: 100%"><UiDivider label="OR" /></div>`,
    },
    {
      title: "Vertical",
      code: `<div style="display: flex; align-items: center; gap: 12px; height: 40px">
  <span>Left</span>
  <UiDivider orientation="vertical" />
  <span>Right</span>
</div>`,
    },
  ],
};
