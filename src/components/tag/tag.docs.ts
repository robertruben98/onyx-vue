import type { ComponentDoc } from "../../docs-model";

export const tagDoc: ComponentDoc = {
  id: "tag",
  title: "Tag",
  description:
    "Compact label for keywords and filters. Optionally removable, which adds a close button that emits `removed`. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiTag"],
  api: [
    {
      name: "variant",
      type: "'neutral' | 'muted' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Semantic variant.",
    },
    {
      name: "appearance",
      type: "'filled' | 'outline'",
      default: "'filled'",
      description: "Outline draws only a hairline in the variant's colour, for small facts inside table cells.",
    },
    {
      name: "mono",
      type: "boolean",
      default: "false",
      description: "Sets the label in the data font family (`--ui-font-family-data`): hashes, ids, numbers.",
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
      name: "wrap",
      type: "boolean",
      default: "false",
      description: "A tag stays on one line by default (`white-space: nowrap`); `wrap` lets a long label break.",
    },
    {
      name: "maxWidth",
      type: "string",
      default: "''",
      description:
        "Caps the width (any CSS length, e.g. `12ch`). The label ends in an ellipsis, keeps its full text in the DOM for assistive tech and shows it as the native tooltip.",
    },
    {
      name: "title",
      type: "string",
      default: "''",
      description: "Tooltip text. Defaults to the label when `maxWidth` is set.",
    },
    {
      name: "showIcon",
      type: "boolean",
      default: "false",
      description:
        "Shows the variant's glyph before the label (info ℹ, success ✓, warning ⚠, danger ✕) so the state is not told by colour alone. Neutral and muted have none.",
    },
    {
      name: "@removed",
      type: "() => void",
      default: "—",
      description:
        "Emitted when the remove button is activated. The tag does not remove itself — the owner of the list does.",
    },
    { name: "#default", type: "slot", default: "—", description: "Tag label." },
    { name: "#icon", type: "slot", default: "—", description: "Replaces the status glyph (decorative, hidden from assistive tech)." },
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
      title: "Mono",
      description: "Identifiers keep the data family even when the preset uses a proportional body.",
      code: `<UiTag mono appearance="outline">a1b2c3d</UiTag>`,
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
    {
      title: "Outline",
      code: `<UiTag appearance="outline">draft</UiTag>
<UiTag appearance="outline" variant="warning">sin review</UiTag>
<UiTag appearance="outline" variant="danger">3 checks rojos</UiTag>`,
    },
    {
      title: "Status icon",
      description: "With `show-icon` the state is readable without colour.",
      code: `<UiTag variant="success" show-icon>ok</UiTag>
<UiTag variant="warning" show-icon>dudas</UiTag>
<UiTag variant="danger" show-icon>tests rojos</UiTag>
<UiTag variant="info" show-icon>revisando</UiTag>`,
    },
    {
      title: "Narrow cells: no wrap, truncation",
      description:
        "A tag never breaks mid-word. `max-width` ends a long label in an ellipsis; hover shows the full text.",
      code: `<div style="width: 160px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
  <UiTag variant="warning" appearance="outline">vieja</UiTag>
  <UiTag max-width="14ch">capataz: sin juicio (treew-inc/supervision-api-payment)</UiTag>
</div>`,
    },
  ],
};
