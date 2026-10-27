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
    {
      name: "as",
      type: "'div' | 'button' | 'a'",
      default: "'div'",
      description:
        "Root element. `button` and `a` make the whole card one control: hover, outline focus ring, pressed state (a slight sink, none under reduced motion), keyboard activation from the native element and a 44px minimum height (`--ui-card-interactive-min-height`). Its parts render as spans so the markup stays valid inside a button. Listen with `@click`.",
    },
    {
      name: "href",
      type: "string",
      default: "undefined",
      description: "Link target when `as=\"a\"`.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables an `as=\"button\"` card. Ignored for `div` and `a`.",
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
      title: "Interactive (button and link)",
      description: "The whole card is the target. The content is the accessible name, so keep it short.",
      code: `<div style="display: grid; gap: 12px; max-width: 320px">
  <UiCard as="button" @click="() => {}">
    <template #header>Writing</template>
    Task 2 of 4 · 12 min
  </UiCard>
  <UiCard as="a" href="#speaking" variant="outlined">Speaking: part 3</UiCard>
  <UiCard as="button" disabled>Locked until tomorrow</UiCard>
</div>`,
    },
    {
      title: "Outlined",
      code: `<UiCard variant="outlined" style="max-width: 320px">Outlined surface</UiCard>`,
    },
  ],
};
