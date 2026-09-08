import type { ComponentDoc } from "../../docs-model";

export const tagDoc: ComponentDoc = {
  id: "tag",
  title: "Tag",
  description:
    "Compact label for keywords and filters. Optionally removable, which adds a close button that emits `removed`.",
  imports: ["UiTag"],
  api: [
    {
      name: "variant",
      type: "'neutral' | 'muted' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Semantic variant.",
    },
    {
      name: "removable",
      type: "boolean",
      default: "false",
      description: "Shows the remove button.",
    },
    {
      name: "removeLabel",
      type: "string",
      default: "'Remove'",
      description: "Accessible name for the remove button.",
    },
    {
      name: "@removed",
      type: "() => void",
      default: "—",
      description:
        "Emitted when the remove button is activated. The tag does not remove itself — the owner of the list does.",
    },
    { name: "#default", type: "slot", default: "—", description: "Tag label." },
  ],
  demos: [
    {
      title: "Variants",
      code: `<UiTag>Neutral</UiTag>
<UiTag variant="info">Info</UiTag>
<UiTag variant="success">Success</UiTag>
<UiTag variant="warning">Warning</UiTag>
<UiTag variant="danger">Danger</UiTag>`,
    },
    {
      title: "Muted",
      description:
        "For a tag that states what a row is rather than warning about it — a draft, an archived item.",
      code: `<UiTag variant="muted">draft</UiTag>`,
    },
    {
      title: "Removable",
      description:
        "`removed` is a request, not a removal: the list that owns the tags decides.",
      code: `<UiTag
  v-for="t in tags"
  :key="t"
  variant="info"
  removable
  @removed="tags = tags.filter((x) => x !== t)"
>{{ t }}</UiTag>
<span v-if="!tags.length">All removed.</span>`,
      setup: () => ({ tags: ["Vue", "Angular", "React"] }),
    },
  ],
};
