import type { ComponentDoc } from "../../docs-model";

export const noteDoc: ComponentDoc = {
  id: "note",
  category: "Feedback",
  title: "Note",
  description:
    "A small line of text: a muted hint, an inline \"nothing here\" line or a tone word (ok, warning, error). Colours come only from semantic tokens, so every preset re-routes them. Heavier than this (title, icon, actions) is `UiEmptyState`.",
  imports: ["UiNote"],
  api: [
    {
      name: "tone",
      type: "'muted' | 'success' | 'warning' | 'danger'",
      default: "'muted'",
      description: "Semantic colour (`--ui-color-text-muted`, `--ui-color-success|warning|danger`).",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Text size: 11px, 12px or 12.5px (tokens `--ui-note-font-size-*`).",
    },
    {
      name: "variant",
      type: "'inline' | 'block' | 'empty'",
      default: "'inline'",
      description:
        "`inline` flows with the surrounding text, `block` is a paragraph with no margin, `empty` adds the padded \"nothing here\" spacing (`--ui-note-empty-padding-*`, from `--ui-space-*`).",
    },
    {
      name: "mono",
      type: "boolean",
      default: "false",
      description: "Monospace text with `overflow-wrap: anywhere`, for ids, paths and hashes.",
    },
    { name: "as", type: "string", default: "'p'", description: "Element to render." },
    {
      name: "live",
      type: "boolean",
      default: "false",
      description:
        "With `variant=\"empty\"`, sets `role=\"status\"` so an empty state that appears after loading is announced. No role otherwise.",
    },
    { name: "#default", type: "slot", default: "—", description: "Note text." },
  ],
  demos: [
    {
      title: "Muted hint",
      code: `<UiNote>Refreshes every 30 seconds.</UiNote>`,
    },
    {
      title: "Tones",
      code: `<UiNote variant="block">Muted</UiNote>
<UiNote variant="block" tone="success">ok, all green</UiNote>
<UiNote variant="block" tone="warning">3 checks pending</UiNote>
<UiNote variant="block" tone="danger">deploy failed</UiNote>`,
    },
    {
      title: "Sizes",
      code: `<UiNote variant="block" size="sm">Small, 11px</UiNote>
<UiNote variant="block">Medium, 12px</UiNote>
<UiNote variant="block" size="lg">Large, 12.5px</UiNote>`,
    },
    {
      title: "Empty line",
      description: "The padded \"nothing here\" line. With `live` it is announced when it appears.",
      code: `<UiNote variant="empty" live>No worktrees yet.</UiNote>`,
    },
    {
      title: "Mono",
      description: "Long ids break anywhere instead of overflowing.",
      code: `<div style="width: 180px">
  <UiNote variant="block" mono>a75976e0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6</UiNote>
</div>`,
    },
    {
      title: "As another element",
      code: `<label>Name <UiNote as="small">(optional)</UiNote></label>`,
    },
  ],
};
