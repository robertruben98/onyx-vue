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
    { name: "#default", type: "slot", default: "—", description: "Button label." },
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
  ],
};
