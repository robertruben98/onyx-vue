import type { ComponentDoc } from "../../docs-model";

export const stackDoc: ComponentDoc = {
  id: "stack",
  title: "Stack",
  description:
    "A column or row of children with a gap from the spacing scale. The layout primitive behind most page sections, so pages stop re-writing flex and gap by hand.",
  imports: ["UiStack"],
  api: [
    { name: "direction", type: "'vertical' | 'horizontal'", default: "'vertical'", description: "Main axis." },
    { name: "gap", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "3", description: "Space between children: a step of the `--ui-space-*` scale." },
    { name: "align", type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", default: "'stretch'", description: "Cross-axis alignment." },
    { name: "justify", type: "'start' | 'center' | 'end' | 'between'", default: "'start'", description: "Main-axis distribution." },
    { name: "wrap", type: "boolean", default: "false", description: "Lets children wrap onto new lines." },
    { name: "as", type: "string", default: "'div'", description: "Element to render (`section`, `ul`…)." },
    { name: "#default", type: "slot", default: "—", description: "The children." },
  ],
  demos: [
    {
      title: "Vertical",
      code: `<UiStack :gap="2">
  <UiAlert variant="info">First</UiAlert>
  <UiAlert variant="success">Second</UiAlert>
</UiStack>`,
    },
    {
      title: "Toolbar row",
      description: "Horizontal, centred, wrapping on narrow screens.",
      code: `<UiStack direction="horizontal" align="center" :gap="2" wrap>
  <UiButton>Save</UiButton>
  <UiButton variant="secondary">Cancel</UiButton>
  <UiTag>draft</UiTag>
</UiStack>`,
    },
    {
      title: "Spread",
      code: `<UiStack direction="horizontal" justify="between" align="baseline">
  <strong>Services</strong>
  <UiBadge variant="success">11 healthy</UiBadge>
</UiStack>`,
    },
  ],
};
