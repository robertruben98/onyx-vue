import type { ComponentDoc } from "../../docs-model";

export const alertDoc: ComponentDoc = {
  id: "alert",
  title: "Alert",
  description:
    "Inline message with an optional title and a dismiss button. The `danger` variant announces itself assertively (`role=\"alert\"`); every other variant is polite (`role=\"status\"`), so a success message never interrupts what is being read.",
  imports: ["UiAlert"],
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'info'",
      description: "Semantic variant. Also decides the ARIA role — see above.",
    },
    {
      name: "appearance",
      type: "'boxed' | 'band'",
      default: "'boxed'",
      description:
        "Layout. `boxed` is a self-contained card; `band` is full-bleed, square, and separated from what follows by a rule.",
    },
    { name: "title", type: "string", default: "''", description: "Bold title above the content." },
    {
      name: "dismissible",
      type: "boolean",
      default: "false",
      description: "Shows the dismiss button.",
    },
    {
      name: "dismissLabel",
      type: "string",
      default: "'Dismiss'",
      description: "Accessible name for the dismiss button.",
    },
    {
      name: "@dismissed",
      type: "() => void",
      default: "—",
      description: "Emitted after dismissal. The alert hides itself.",
    },
    { name: "#default", type: "slot", default: "—", description: "Message body." },
    { name: "#icon", type: "slot", default: "—", description: "Optional icon, typically a spinner in a band appearance." },
    { name: "#action", type: "slot", default: "—", description: "Optional action button or control, typically in a band appearance." },
  ],
  demos: [
    {
      title: "Variants",
      code: `<UiAlert variant="info" title="Info">An informational message.</UiAlert>
<UiAlert variant="success" title="Success">It worked.</UiAlert>
<UiAlert variant="warning" title="Warning">Careful now.</UiAlert>
<UiAlert variant="danger" title="Error">Something broke.</UiAlert>`,
    },
    {
      title: "Dismissible",
      code: `<UiAlert variant="info" dismissible>Dismiss me.</UiAlert>`,
    },
    {
      title: "Without a title",
      code: `<UiAlert variant="neutral">Just the body, no heading.</UiAlert>`,
    },
    {
      title: "Band with an icon and an action",
      description:
        "Full-bleed, square, ruled off from what follows. The icon can be a spinner while the data it is talking about is still in flight.",
      code: `<UiAlert appearance="band" variant="info">
  <template #icon><UiSpinner size="sm" /></template>
  Pidiendo alertas a GitHub: una peticion por repo. Tarda unos segundos.
  <template #action><UiButton size="sm" variant="secondary">cancelar</UiButton></template>
</UiAlert>`,
    },
  ],
};
