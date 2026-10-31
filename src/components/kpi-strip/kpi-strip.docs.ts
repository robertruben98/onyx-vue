import type { ComponentDoc } from "../../docs-model";

export const kpiStripDoc: ComponentDoc = {
  id: "kpi-strip",
  title: "KPI Strip",
  description:
    "A row of headline figures above a list, drawn as one bordered instrument rather than separate cards. Folds to two columns below 1080px. Each cell reads label first, then value, then its sub-line. Passing a deprecated tone warns once per name per page load in development; aliases remain until 1.0.",
  imports: ["UiKpiStrip"],
  api: [
    { name: "items", type: "{ label, value, sub?, hint?, tone?, title? }[]", default: "—", description: "The figures. `tone` is neutral | muted | success | warning | danger (`default` still works as the deprecated name of neutral)." },
    { name: "label", type: "string", default: "'Summary'", description: "Accessible name of the list." },
    { name: "columns", type: "number | null", default: "null", description: "Columns on wide screens; one per item by default." },
    { name: "size", type: "'md' | 'lg'", default: "'md'", description: "`lg` makes the values big (--ui-kpi-strip-value-size-lg)." },
    { name: "variant", type: "'cells' | 'plain'", default: "'cells'", description: "`cells`: one bordered instrument with shared rules. `plain`: spaced cards without the table-like borders, the label in normal case at a readable size." },
    { name: "items[].hint", type: "string", default: "undefined", description: "The line under the label, by the name UiStatCard uses (same place as `sub`; `hint` wins when both are set)." },
    { name: "#icon-<index>", type: "slot { item }", default: "—", description: "Decorative icon above one figure (aria-hidden)." },
    { name: "#item-<index>", type: "slot { item }", default: "—", description: "Custom rendering of one value." },
  ],
  demos: [
    {
      title: "Fleet summary",
      setup: () => ({
        items: [
          { label: "agentes", value: 12, sub: "3 corriendo" },
          { label: "runs hoy", value: 48 },
          { label: "actuado", value: 17, tone: "success" },
          { label: "fallos", value: 2, tone: "danger", sub: "ultimo 10:04" },
          { label: "skip", value: 29, tone: "muted" },
        ],
      }),
      code: `<UiKpiStrip :items="items" label="Resumen de la flota" />`,
    },
    {
      title: "Big values, plain cards",
      description: "For a profile page on a phone: two columns of spaced cards, readable labels, an icon each.",
      setup: () => ({
        stats: [
          { label: "Level", value: 7, hint: "2,340 XP" },
          { label: "Streak", value: "12 days", tone: "success" },
          { label: "Days practised", value: 18 },
          { label: "Practice time", value: "9 h 40 min" },
        ],
      }),
      code: `<UiKpiStrip :items="stats" size="lg" variant="plain" label="Level and practice">
  <template #icon-1><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-8z"/></svg></template>
</UiKpiStrip>`,
    },
  ],
};
