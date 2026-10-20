import type { ComponentDoc } from "../../docs-model";

export const filterChipDoc: ComponentDoc = {
  id: "filter-chip",
  title: "Filter Chip",
  description:
    "A toggleable filter that carries its own match count. The tone says what is being filtered for; pressed says whether the filter is applied. A chip that would match nothing dims instead of disappearing, because 'nothing matches this' is an answer worth keeping on screen.",
  imports: ["UiFilterChip"],
  api: [
    {
      name: "label",
      type: "string",
      default: "—",
      description: "What the chip filters for.",
    },
    {
      name: "count",
      type: "number | null",
      default: "null",
      description: "How many rows match. Only read when state is 'known'.",
    },
    {
      name: "state",
      type: "'known' | 'pending' | 'unrequested'",
      default: "'known'",
      description:
        "Whether the count is a fact, in flight, or was never asked for. Rendered by TriStateCount, so a pending chip shows a dot and not a zero.",
    },
    {
      name: "tone",
      type: "'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'muted'",
      default: "'neutral'",
      description: "Semantic tone of the thing being filtered.",
    },
    {
      name: "pressed",
      type: "boolean",
      default: "false",
      description: "Whether the filter is applied. Exposed as aria-pressed.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "A disabled chip never emits toggled.",
    },
    {
      name: "@toggled",
      type: "(pressed: boolean) => void",
      default: "—",
      description: "Fired on activation with the state the chip is moving to.",
    },
  ],
  demos: [
    {
      title: "A bar of filters",
      description:
        "Chips combine: the consumer decides whether they OR within a group and AND across groups.",
      code: `<UiFilterChip label="ci rojo" :count="3" tone="danger" :pressed="true" />
<UiFilterChip label="aprobado" :count="12" tone="ok" />
<UiFilterChip label="draft" :count="0" tone="muted" />
<UiFilterChip label="hilos" state="pending" tone="warn" />`,
    },
    {
      title: "Counts that are not numbers",
      description:
        "A filter whose data has not arrived shows a dot; one nobody asked for shows a dash. Neither is a zero.",
      code: `<UiFilterChip label="secrets" state="unrequested" tone="danger" />
<UiFilterChip label="vulns" state="pending" tone="warn" />
<UiFilterChip label="conflicto" :count="0" tone="danger" />`,
    },
  ],
};
