import type { ComponentDoc } from "../../docs-model";

export const badgeDoc: ComponentDoc = {
  id: "badge",
  title: "Badge",
  description:
    "Small status label with neutral, info, success, warning and danger variants.",
  imports: ["UiBadge"],
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Semantic variant.",
    },
    { name: "#default", type: "slot", default: "—", description: "Badge content." },
  ],
  demos: [
    {
      title: "Variants",
      code: `<UiBadge>Neutral</UiBadge>
<UiBadge variant="info">Info</UiBadge>
<UiBadge variant="success">Success</UiBadge>
<UiBadge variant="warning">Warning</UiBadge>
<UiBadge variant="danger">Danger</UiBadge>`,
    },
  ],
};
