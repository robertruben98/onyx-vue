import type { ComponentDoc } from "../../docs-model";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROWS: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@onyx.dev", role: "Lead" },
  { id: 2, name: "Grace Hopper", email: "grace@onyx.dev", role: "Engineer" },
  { id: 3, name: "Alan Turing", email: "alan@onyx.dev", role: "Engineer" },
];

const many = (n: number): Person[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Member ${i + 1}`,
    email: `member${i + 1}@onyx.dev`,
    role: i % 2 ? "Engineer" : "Lead",
  }));

const SORTABLE = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "email", header: "Email", field: "email", sortable: true },
  { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
];

const PLAIN = [
  { id: "name", header: "Name", field: "name" },
  { id: "email", header: "Email", field: "email" },
  { id: "role", header: "Role", field: "role", align: "end" },
];

export const dataTableDoc: ComponentDoc = {
  id: "data-table",
  title: "Data Table",
  description:
    "Sortable, selectable table with three layout modes. `rowKey` is what makes an update reuse the existing rows instead of rebuilding them — with it, a table that refreshes on a timer keeps the text selection and the focus.",
  imports: ["UiDataTable"],
  api: [
    {
      name: "columns",
      type: "DataTableColumn<T>[]",
      default: "— (required)",
      description: "`{ id, header, field?, sortable?, align?, width? }` per column.",
    },
    { name: "rows", type: "T[]", default: "[]", description: "All rows; sorting and paging are client-side." },
    {
      name: "rowKey",
      type: "keyof T | string | ((row: T) => string | number)",
      default: "row.id",
      description: "Row identity. Wrong or missing keys are what make rows get destroyed and rebuilt.",
    },
    {
      name: "mode",
      type: "'paginated' | 'virtual' | 'plain'",
      default: "'paginated'",
      description:
        "`plain` renders every row with no footer and no viewport — for short lists where a scrollbar inside the table would be wrong.",
    },
    { name: "loading", type: "boolean", default: "false", description: "Loading state." },
    { name: "emptyText", type: "string", default: "'No data'", description: "Shown when there are no rows." },
    { name: "caption", type: "string", default: "''", description: "Accessible name for the grid." },
    {
      name: "multiSort",
      type: "boolean",
      default: "false",
      description: "Additive multi-column sort with Shift+click on the headers.",
    },
    {
      name: "pageSizeOptions",
      type: "number[]",
      default: "[10, 25, 50]",
      description: "Options for the rows-per-page control.",
    },
    {
      name: "selectable",
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: "Row selection mode; adds the select column.",
    },
    { name: "rowHeight", type: "number", default: "44", description: "Item size for virtual scroll." },
    {
      name: "viewportHeight",
      type: "string",
      default: "'400px'",
      description: "Virtual scroll viewport height. A non-CSS length such as `auto` computes to zero rows.",
    },
    {
      name: "maxHeight",
      type: "string",
      default: "''",
      description: "Max height in paginated mode; enables internal scroll with a sticky header.",
    },
    {
      name: "v-model:sort / :pageIndex / :pageSize / :selected",
      type: "SortState[] / number / number / Set<RowKey>",
      default: "[] / 0 / 10 / new Set()",
      description: "Table state, all two-way bindable.",
    },
    {
      name: "#cell-<id>",
      type: "slot",
      default: "—",
      description: "Per-column cell template, receiving `{ row }`.",
    },
    {
      name: "rowClass",
      type: "(row: T) => string | string[] | undefined",
      default: "undefined",
      description:
        "Extra classes for one row — a keyboard cursor, a row that is ready, one the user marked. Selection is already modelled; this is for everything else the consumer knows about a row and the table does not.",
    },
    {
      name: "expanded",
      type: "Set<RowKey>",
      default: "new Set()",
      description:
        "Expanded row keys (v-model:expanded). Each opens a full-width detail row underneath, filled by #row-detail. Ignored in virtual mode, where every row has to be exactly rowHeight tall.",
    },
    {
      name: "#row-detail",
      type: "slot({ row })",
      default: "—",
      description:
        "The drawer under an expanded row. The row itself carries no aria-expanded — that is only valid on a treegrid row — so put the disclosure on the control the user actually activates.",
    },
  ],
  demos: [
    {
      title: "Sorting",
      description: "Click a header to sort; Shift+click adds a second column.",
      code: `<UiDataTable
  caption="Team members"
  row-key="id"
  :columns="columns"
  :rows="rows"
  multi-sort
/>`,
      setup: () => ({ columns: SORTABLE, rows: ROWS }),
    },
    {
      title: "Pagination",
      code: `<UiDataTable
  caption="Catalogue"
  row-key="id"
  :columns="columns"
  :rows="rows"
  :page-size="6"
  :page-size-options="[6, 12, 24]"
/>`,
      setup: () => ({ columns: SORTABLE, rows: many(24) }),
    },
    {
      title: "Virtual scroll",
      description: "10 000 rows; only the visible window is in the DOM.",
      code: `<UiDataTable
  caption="10 000 rows"
  row-key="id"
  :columns="columns"
  :rows="rows"
  mode="virtual"
  :row-height="40"
  viewport-height="320px"
/>`,
      setup: () => ({ columns: PLAIN, rows: many(10000) }),
    },
    {
      title: "Plain",
      description: "Every row, no footer, no viewport. The mode the control panel uses.",
      code: `<UiDataTable caption="Team" row-key="id" mode="plain" :columns="columns" :rows="rows" />`,
      setup: () => ({ columns: PLAIN, rows: ROWS }),
    },
    {
      title: "Selection",
      code: `<UiDataTable
  caption="Team members"
  row-key="id"
  :columns="columns"
  :rows="rows"
  selectable="multiple"
  v-model:selected="selected"
/>
<p>selected: {{ [...selected].join(', ') || '(none)' }}</p>`,
      setup: () => ({ columns: PLAIN, rows: ROWS, selected: new Set() }),
    },
    {
      title: "Custom cell",
      code: `<UiDataTable caption="Team" row-key="id" mode="plain" :columns="columns" :rows="rows">
  <template #cell-role="{ row }">
    <UiBadge :variant="row.role === 'Lead' ? 'success' : 'neutral'">{{ row.role }}</UiBadge>
  </template>
</UiDataTable>`,
      setup: () => ({ columns: PLAIN, rows: ROWS }),
    },
    {
      title: "Empty and loading",
      code: `<UiDataTable caption="Team" :columns="columns" :rows="[]" empty-text="No members yet" />
<UiDataTable caption="Team" :columns="columns" :rows="[]" loading />`,
      setup: () => ({ columns: PLAIN }),
    },
    {
      title: "A drawer under its own row",
      description:
        "The adjacency is the point: a panel that opens somewhere else on the page makes the reader find their row again.",
      code: `<UiDataTable
  :columns="cols"
  :rows="rows"
  row-key="id"
  mode="plain"
  caption="Pull requests"
  :expanded="open"
  :row-class="(row) => (row.ready ? 'lista' : undefined)"
>
  <template #row-detail="{ row }">
    <div style="padding: 12px 16px">workflow de {{ row.title }}</div>
  </template>
</UiDataTable>`,
      setup: () => ({
        cols: [
          { id: "title", header: "titulo", field: "title" },
          { id: "state", header: "merge", field: "state", width: "120px" },
        ],
        rows: [
          { id: 1, title: "feat: contador de commits", state: "limpio", ready: true },
          { id: 2, title: "fix: dedupe de worktrees", state: "bloqueado", ready: false },
        ],
        open: new Set([1]),
      }),
    },
  ],
};
