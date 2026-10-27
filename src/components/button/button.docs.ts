import type { ComponentDoc } from "../../docs-model";

export const buttonDoc: ComponentDoc = {
  id: "button",
  title: "Button",
  description:
    "Action control with primary, secondary, danger and text variants, three sizes, and disabled and loading states.",
  imports: ["UiButton"],
  api: [
    {
      name: "variant",
      type: "'primary' | 'secondary' | 'danger' | 'text'",
      default: "'primary'",
      description:
        "Visual variant. `danger` is for destructive actions: flat ink with a border at rest, filling with colour only on hover.",
    },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control height." },
    {
      name: "type",
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: "Native button type.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "A disabled button never emits `clicked`.",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description:
        "Shows a spinner, sets `aria-busy` and suppresses interaction — a loading button does not emit `clicked` either.",
    },
    {
      name: "@clicked",
      type: "(event: MouseEvent) => void",
      default: "—",
      description: "Emitted on activation, only while interactive.",
    },
    {
      name: "block",
      type: "boolean",
      default: "false",
      description: "Full width: the root becomes a block and the button fills its container.",
    },
    {
      name: "wrap",
      type: "boolean",
      default: "false",
      description:
        "Lets a long label wrap onto a second line. The height becomes a minimum (`--ui-button-height*`) instead of a fixed value, so the text stays inside the button.",
    },
    { name: "#default", type: "slot", default: "—", description: "Button label." },
    {
      name: "#leading",
      type: "slot",
      default: "—",
      description:
        "Decorative icon before the label, sized by `--ui-button-icon-size` (1.125em) and `aria-hidden`: the label names the button. A loading button shows its spinner here instead.",
    },
    {
      name: "#trailing",
      type: "slot",
      default: "—",
      description: "Decorative icon after the label, `aria-hidden`.",
    },
  ],
  demos: [
    { title: "Primary", code: `<UiButton>Primary</UiButton>` },
    { title: "Secondary", code: `<UiButton variant="secondary">Secondary</UiButton>` },
    {
      title: "Danger",
      description: "For actions that destroy or stop something.",
      code: `<UiButton variant="danger">Delete</UiButton>`,
    },
    { title: "Text", code: `<UiButton variant="text">Text</UiButton>` },
    {
      title: "Sizes",
      code: `<UiButton size="sm">Small</UiButton>
<UiButton>Medium</UiButton>
<UiButton size="lg">Large</UiButton>`,
    },
    { title: "Disabled", code: `<UiButton disabled>Disabled</UiButton>` },
    { title: "Loading", code: `<UiButton loading>Loading</UiButton>` },
    {
      title: "Icons",
      description: "A leading and a trailing glyph. They are decorative; the label is the accessible name.",
      code: `<UiButton size="lg">
  <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg></template>
  Start today's practice
</UiButton>
<UiButton variant="secondary">
  Next
  <template #trailing><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" /></svg></template>
</UiButton>`,
    },
    {
      title: "Block and wrapping label",
      description: "Full width on a phone, and a label that may take two lines without spilling out.",
      code: `<div style="max-width: 16rem">
  <UiButton block wrap>Create my exercise from today's mistakes</UiButton>
</div>`,
    },
  ],
};
