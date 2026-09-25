import type { ComponentDoc } from "../../docs-model";

export const barListDoc: ComponentDoc = {
  id: "bar-list",
  title: "Bar List",
  description:
    "Horizontal bars, one row per category. A row is one bar with its value after the end, or a stack of segments with counts inside those that fit and a summary in a right-hand column. Labels are cut to their column; the full text stays in the tooltip and the table twin.",
  imports: ["UiBarList"],
  api: [
    { name: "items", type: "{ label, value?, tone?, segments?, valueText?, tip? }[]", default: "—", description: "Rows top to bottom. segments: { value, tone, label? }[]." },
    { name: "label", type: "string", default: "—", description: "Accessible name of the chart." },
    { name: "max", type: "number | null", default: "null", description: "Scale maximum; the largest row by default." },
    { name: "gutter", type: "number", default: "200", description: "Label column width in px (at most 40% of the chart)." },
    { name: "trail", type: "number", default: "80", description: "Width after the bars in px." },
    { name: "rowHeight", type: "number", default: "32", description: "Row height in px." },
    { name: "legend", type: "{ label, tone }[]", default: "[]", description: "Keys above the chart." },
    { name: "table", type: "{ headers, rows } | null", default: "one row per item", description: "The table twin; null hides it." },
    { name: "tableSummary", type: "string", default: "'data'", description: "Summary of the table fold." },
    { name: "tableHeaders", type: "[string, string]", default: "['category', 'value']", description: "Headers of the default table." },
  ],
  demos: [
    {
      title: "Why runs get stuck",
      setup: () => ({
        items: [
          { label: "hilo escalado: pide criterio humano", value: 14 },
          { label: "CI en rojo antes de empezar", value: 9 },
          { label: "rama con conflicto", value: 4 },
          { label: "cuota de 5 horas casi llena", value: 2 },
        ],
      }),
      code: `<UiBarList :items="items" label="Motivos de bloqueo" :gutter="300" :table-headers="['motivo', 'veces']" />`,
    },
    {
      title: "Reliability per agent",
      setup: () => ({
        items: [
          { label: "pr-fix", segments: [{ value: 40, tone: "ok", label: "ok" }, { value: 6, tone: "warn", label: "parcial" }, { value: 3, tone: "bad", label: "fallido" }], valueText: "82%" },
          { label: "issue-plan", segments: [{ value: 12, tone: "ok", label: "ok" }, { value: 8, tone: "none", label: "sin trabajo" }], valueText: "60%" },
        ],
        legend: [
          { label: "ok", tone: "ok" },
          { label: "parcial", tone: "warn" },
          { label: "fallido", tone: "bad" },
          { label: "sin trabajo", tone: "none" },
        ],
      }),
      code: `<UiBarList :items="items" :legend="legend" label="Runs por estado y agente" />`,
    },
  ],
};
