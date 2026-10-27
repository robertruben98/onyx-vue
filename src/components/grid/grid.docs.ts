import type { ComponentDoc } from "../../docs-model";

export const gridDoc: ComponentDoc = {
  id: "grid",
  title: "Grid",
  description:
    "Equal columns, either a fixed number or as many as fit a minimum item width. With `minItemWidth` it reflows by itself and never scrolls sideways on a phone.",
  imports: ["UiGrid"],
  api: [
    { name: "columns", type: "number", default: "1", description: "Fixed number of equal columns. Ignored when `minItemWidth` is set." },
    { name: "minItemWidth", type: "string", default: "''", description: "Minimum width of an item (CSS length): fits as many columns as there is room for." },
    { name: "gap", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "4", description: "Space between items: a step of the `--ui-space-*` scale." },
    { name: "as", type: "string", default: "'div'", description: "Element to render." },
    { name: "#default", type: "slot", default: "—", description: "The items." },
  ],
  demos: [
    {
      title: "Fitted to the room",
      description: "Resize the window: three, two or one column.",
      code: `<UiGrid min-item-width="12rem" :gap="3">
  <UiCard variant="outlined">Traffic</UiCard>
  <UiCard variant="outlined">Error budget</UiCard>
  <UiCard variant="outlined">Incidents</UiCard>
</UiGrid>`,
    },
    {
      title: "Fixed columns",
      code: `<UiGrid :columns="2" :gap="2">
  <UiReadout label="Requests" value="14.1k" />
  <UiReadout label="5xx" value="0.81" unit="%" tone="warning" />
  <UiReadout label="Uptime" value="99.96" unit="%" tone="success" />
  <UiReadout label="Need a look" :value="3" tone="danger" />
</UiGrid>`,
    },
  ],
};
