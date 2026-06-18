/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content (markup of `UiAccordionItem` children). */
  slot: string;
}

const basicSlot = `<UiAccordionItem heading="Shipping">Free over $50, 2–4 business days.</UiAccordionItem>
<UiAccordionItem heading="Returns">30-day window, original packaging.</UiAccordionItem>
<UiAccordionItem heading="Warranty">Two years against defects.</UiAccordionItem>`;

const multiSlot = `<UiAccordionItem heading="Section A">Open several at once.</UiAccordionItem>
<UiAccordionItem heading="Section B">Multi mode is enabled.</UiAccordionItem>`;

export const accordionDemos: Demo[] = [
  { title: "Single", slot: basicSlot },
  { title: "Multiple", props: { multi: true }, slot: multiSlot },
];
