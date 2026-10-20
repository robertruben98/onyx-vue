import type { ComponentDoc } from "../../docs-model";

export const cardDoc: ComponentDoc = {
  id: "card",
  title: "Card",
  description:
    "Surface with an optional header and footer. Both are rendered only when their slot is filled, so an empty header leaves no stray padding.",
  imports: ["UiCard"],
  api: [
    {
      name: "variant",
      type: "'elevated' | 'outlined'",
      default: "'elevated'",
      description: "Shadow or border. Under the `console` preset shadows are off entirely.",
    },
    { name: "#default", type: "slot", default: "—", description: "Card body." },
    {
      name: "#header",
      type: "slot",
      default: "—",
      description: "Header. The header element only renders when this slot has content.",
    },
    { name: "#footer", type: "slot", default: "—", description: "Footer. Same rule as the header." },
  ],
  demos: [
    {
      title: "Header, body and footer",
      code: `<UiCard style="max-width: 320px">
  <template #header>Project Atlas</template>
  A concise summary of the card body content goes here.
  <template #footer>Updated 2 hours ago</template>
</UiCard>`,
    },
    {
      title: "Body only",
      description: "No header and no footer means no header and footer elements at all.",
      code: `<UiCard style="max-width: 320px">Elevated surface</UiCard>`,
    },
    {
      title: "Outlined",
      code: `<UiCard variant="outlined" style="max-width: 320px">Outlined surface</UiCard>`,
    },
  ],
};
