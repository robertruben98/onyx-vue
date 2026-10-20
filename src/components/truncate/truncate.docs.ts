import type { ComponentDoc } from "../../docs-model";

export const truncateDoc: ComponentDoc = {
  id: "truncate",
  title: "Truncate",
  description:
    "Text that ellipsizes on one line or clamps to several, with the full string in the title so nothing is lost. Sets min-width: 0 so it actually shrinks inside a flex or grid row.",
  imports: ["UiTruncate"],
  api: [
    { name: "text", type: "string", default: "—", description: "The text, and the default tooltip." },
    {
      name: "lines",
      type: "number",
      default: "1",
      description:
        "Lines kept before clamping. 0 or a negative number falls back to single-line, same as 1.",
    },
    {
      name: "title",
      type: "string",
      default: "''",
      description: "Overrides the tooltip.",
    },
  ],
  demos: [
    {
      title: "One line",
      code: `<div style="max-width: 12rem">
  <UiTruncate text="treew-inc/supervision-api-payment" />
</div>`,
    },
    {
      title: "Two lines",
      code: `<div style="max-width: 12rem">
  <UiTruncate :lines="2" text="feat(payments): reconciliar los reembolsos parciales contra el extracto del banco" />
</div>`,
    },
  ],
};
