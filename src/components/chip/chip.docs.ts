import type { ComponentDoc } from "../../docs-model";

export const chipDoc: ComponentDoc = {
  id: "chip",
  title: "Chip",
  description:
    "Suggestion chip: a small one-shot action shaped like a chip, such as a canned reply or a quick prompt. Unlike UiFilterChip it has no pressed state and no count: it does something once. Lay several out with UiChipRow.",
  imports: ["UiChip", "UiChipRow"],
  api: [
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "A disabled chip never emits `clicked`.",
    },
    {
      name: "@clicked",
      type: "(event: MouseEvent) => void",
      default: "—",
      description: "Emitted on activation, only while enabled.",
    },
    { name: "#default", type: "slot", default: "—", description: "Chip label; also its accessible name." },
    {
      name: "#leading",
      type: "slot",
      default: "—",
      description: "Decorative icon before the label (`aria-hidden`), sized by `--ui-chip-icon-size`.",
    },
  ],
  demos: [
    {
      title: "Suggestions",
      code: `<UiChipRow label="Suggestions">
  <UiChip>Give me an example</UiChip>
  <UiChip>Make it shorter</UiChip>
  <UiChip disabled>Translate</UiChip>
</UiChipRow>`,
    },
    {
      title: "With an icon",
      code: `<UiChip>
  <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg></template>
  Add a phrase
</UiChip>`,
    },
  ],
};
