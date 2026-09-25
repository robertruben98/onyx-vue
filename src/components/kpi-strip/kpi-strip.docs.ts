import type { ComponentDoc } from "../../docs-model";

export const kpiStripDoc: ComponentDoc = {
  id: "kpi-strip",
  title: "KPI Strip",
  description:
    "A row of headline figures above a list, drawn as one bordered instrument rather than separate cards. Folds to two columns below 1080px. Each cell reads label first, then value, then its sub-line.",
  imports: ["UiKpiStrip"],
  api: [
    { name: "items", type: "{ label, value, sub?, tone?, title? }[]", default: "—", description: "The figures." },
    { name: "label", type: "string", default: "'Summary'", description: "Accessible name of the list." },
    { name: "columns", type: "number | null", default: "null", description: "Columns on wide screens; one per item by default." },
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
  ],
};
