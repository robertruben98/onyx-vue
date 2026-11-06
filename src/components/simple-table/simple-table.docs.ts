import type { ComponentDoc } from "../../docs-model";

export const simpleTableDoc: ComponentDoc = {
  id: "simple-table",
  title: "Simple Table",
  description:
    "A semantic, read-only native table (`<th scope=\"col\">`) inside a labelled, keyboard-focusable region that scrolls sideways, so a narrow screen never scrolls the page. For sorting, selection or virtualisation use UiDataTable.",
  imports: ["UiSimpleTable"],
  api: [
    { name: "columns", type: "{ key, label, align?, mono?, muted?, hideBelow? }[]", default: "—", description: "Column definitions. `mono` and `muted` style the cells with tokens; `hideBelow` drops the column under that viewport width (px), like UiDataTable." },
    { name: "rows", type: "T[]", default: "[]", description: "Row data. With no rows the body is omitted and the `empty` slot shows." },
    { name: "rowKey", type: "string | (row, index) => string | number", default: "'id'", description: "Row identity." },
    { name: "ariaLabel", type: "string", default: "— (required)", description: "Accessible name of the scrollable region." },
    { name: "dense", type: "boolean", default: "false", description: "Tighter cell padding." },
    { name: "tone", type: "(row, column) => 'success' | 'warning' | 'danger' | 'muted' | undefined", default: "—", description: "Per-cell tone." },
    { name: "#cell-<key>", type: "slot ({ row, column, value })", default: "—", description: "Replaces one column's cell content." },
    { name: "#empty", type: "slot", default: "—", description: "Shown instead of the body when `rows` is empty." },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiSimpleTable aria-label="Services" :columns="columns" :rows="rows" :tone="tone" />`,
      setup: () => ({
        columns: [
          { key: "name", label: "Service" },
          { key: "port", label: "Port", align: "end", mono: true },
          { key: "state", label: "State" },
          { key: "note", label: "Note", muted: true, hideBelow: 600 },
        ],
        rows: [
          { id: "api", name: "transact-hub-api", port: 3000, state: "up", note: "NestJS" },
          { id: "web", name: "transact-hub-webapp", port: 4200, state: "up", note: "Angular" },
          { id: "pay", name: "apiTreewPayment", port: 8000, state: "down", note: "Django" },
        ],
        tone: (row: { state: string }, col: { key: string }) =>
          col.key === "state" ? (row.state === "up" ? "success" : "danger") : undefined,
      }),
    },
    {
      title: "Scrolls inside a narrow container",
      code: `<div style="width: 360px">
  <UiSimpleTable aria-label="Wide table" dense :columns="cols" :rows="rows" />
</div>`,
      setup: () => ({
        cols: ["alpha", "bravo", "charlie", "delta", "echo"].map((k) => ({ key: k, label: k.toUpperCase(), mono: true })),
        rows: [{ id: 1, alpha: "aaaaaaaaaaaa", bravo: "bbbbbbbbbbbb", charlie: "cccccccccccc", delta: "dddddddddddd", echo: "eeeeeeeeeeee" }],
      }),
    },
    {
      title: "Empty",
      code: `<UiSimpleTable aria-label="Empty" :columns="[{ key: 'a', label: 'A' }]" :rows="[]">
  <template #empty>No rows yet.</template>
</UiSimpleTable>`,
    },
  ],
};
