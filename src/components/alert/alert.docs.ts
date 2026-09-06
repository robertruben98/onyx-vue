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
  ],
};
