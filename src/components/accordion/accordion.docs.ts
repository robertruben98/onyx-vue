import type { ComponentDoc } from "../../docs-model";

export const accordionDoc: ComponentDoc = {
  id: "accordion",
  title: "Accordion",
  description:
    "Collapsible sections. By default opening one closes the rest; `multi` lets several stay open. The parent tracks its items through provide/inject, so items can be nested in any markup.",
  imports: ["UiAccordion", "UiAccordionItem"],
  api: [
    {
      name: "multi",
      type: "boolean",
      default: "false",
      description: "Allow several items open at once, on `UiAccordion`.",
    },
    {
      name: "heading",
      type: "string",
      default: "— (required)",
      description: "Header text, on `UiAccordionItem`.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Cannot be toggled, on `UiAccordionItem`.",
    },
    { name: "#default", type: "slot", default: "—", description: "Panel content, on `UiAccordionItem`." },
  ],
  demos: [
    {
      title: "Single",
      code: `<div style="width: 100%">
  <UiAccordion>
    <UiAccordionItem heading="Shipping">Free over $50, 2–4 business days.</UiAccordionItem>
    <UiAccordionItem heading="Returns">30-day window, original packaging.</UiAccordionItem>
    <UiAccordionItem heading="Warranty">Two years against defects.</UiAccordionItem>
  </UiAccordion>
</div>`,
    },
    {
      title: "Multiple",
      code: `<div style="width: 100%">
  <UiAccordion multi>
    <UiAccordionItem heading="Section A">Open several at once.</UiAccordionItem>
    <UiAccordionItem heading="Section B">Multi mode is enabled.</UiAccordionItem>
    <UiAccordionItem heading="Disabled" disabled>Never opens.</UiAccordionItem>
  </UiAccordion>
</div>`,
    },
  ],
};
