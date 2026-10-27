import type { ComponentDoc } from "../../docs-model";

export const hudFrameDoc: ComponentDoc = {
  id: "hud-frame",
  title: "HUD Frame",
  description:
    "A panel with corner brackets and an optional titled header — a chassis rather than a content surface. Deliberately not a UiCard variant: a card brings padding and a shadow, and every use here would have had to override them. The brackets are two diagonal corners, because a closed frame reads as a box and two corners read as an instrument.",
  imports: ["UiHudFrame"],
  api: [
    {
      name: "title",
      type: "string",
      default: "—",
      description: "Header label. Omit it and no header is rendered at all.",
    },
    {
      name: "plain",
      type: "boolean",
      default: "false",
      description: "Drops the brackets, keeping the border and the header.",
    },
    { name: "#default", type: "slot", default: "—", description: "Panel body." },
    {
      name: "#meta",
      type: "slot",
      default: "—",
      description:
        "Right-hand side of the header, past the rule. A count, a duration, a status.",
    },
  ],
  demos: [
    {
      title: "Titled panel",
      code: `<UiHudFrame title="Progreso">
  <template #meta>35 pasos</template>
  …
</UiHudFrame>`,
    },
    { title: "Bare", code: `<UiHudFrame :plain="true">…</UiHudFrame>` },
  ],
};
