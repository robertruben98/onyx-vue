import type { ComponentDoc } from "../../docs-model";

export const barChartDoc: ComponentDoc = {
  id: "bar-chart",
  title: "Bar Chart",
  description:
    "Stacked vertical bars over time. Hairline grid, 2px gaps between segments, a direct label on the tallest column only, axis labels thinned when they do not fit, a full-height hit area per column for the tooltip, and a table twin with the numbers. Colours come from the --ui-chart-* tokens.",
  imports: ["UiBarChart"],
  api: [
    { name: "series", type: "{ id, label, tone }[]", default: "—", description: "Stacked series, bottom first. tone: ok | warn | bad | none | one." },
    { name: "points", type: "{ label, values, tip?, muted? }[]", default: "—", description: "Columns left to right; values keyed by series id." },
    { name: "label", type: "string", default: "—", description: "Accessible name of the chart." },
    { name: "height", type: "number", default: "300", description: "Plot height in px." },
    { name: "valueFormat", type: "(n: number) => string", default: "toLocaleString", description: "Formats ticks and the direct label." },
    { name: "showLegend", type: "boolean", default: "true", description: "Legend above the chart." },
    { name: "table", type: "{ headers, rows } | null", default: "one row per column", description: "The table twin; null hides it." },
    { name: "tableSummary", type: "string", default: "'data'", description: "Summary of the table fold." },
    { name: "categoryHeader", type: "string", default: "'category'", description: "First header of the default table." },
  ],
  demos: [
    {
      title: "Work per day",
      setup: () => {
        const names = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
        const points = Array.from({ length: 14 }, (_, i) => ({
          label: `${names[i % 7]} ${i + 1}`,
          values: { acted: (i * 7) % 11, skipped: (i * 3) % 5 },
          muted: i % 7 >= 5,
        }));
        return {
          points,
          series: [
            { id: "acted", label: "actuados", tone: "ok" },
            { id: "skipped", label: "saltados", tone: "warn" },
          ],
        };
      },
      code: `<UiBarChart :series="series" :points="points" label="Items actuados y saltados por dia" category-header="dia" table-summary="ver los dias" />`,
    },
  ],
};
