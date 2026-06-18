import type { DataTableColumn } from "./DataTable.vue";

/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  /** Props bound to the DataTable in the example. */
  props: Record<string, unknown>;
  /** Reference markup for the docs code block. */
  code: string;
}

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

const SORTABLE_COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "email", header: "Email", field: "email", sortable: true },
  { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
];

const PLAIN_COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "email", header: "Email", field: "email" },
  { id: "role", header: "Role", field: "role", align: "end" },
];

const MANY: Person[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  email: `member${i + 1}@onyx.dev`,
  role: i % 2 ? "Engineer" : "Lead",
}));

const HUGE: Person[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  email: `member${i + 1}@onyx.dev`,
  role: i % 2 ? "Engineer" : "Lead",
}));

const basicCode = `<UiDataTable
  caption="Team members"
  :row-key="'id'"
  :columns="columns"
  :rows="rows"
  :multi-sort="true"
/>

// columns (Shift+click headers for multi-column sort)
[
  { id: 'name',  header: 'Name',  field: 'name',  sortable: true },
  { id: 'email', header: 'Email', field: 'email', sortable: true },
  { id: 'role',  header: 'Role',  field: 'role',  sortable: true, align: 'end' },
]`;

const paginatedCode = `<UiDataTable
  caption="Catalogue"
  :row-key="'id'"
  :columns="columns"
  :rows="rows"
  :page-size="6"
  :page-size-options="[6, 12, 24]"
/>`;

const virtualCode = `<UiDataTable
  caption="10 000 rows"
  :row-key="'id'"
  :columns="columns"
  :rows="rows"
  mode="virtual"
  :row-height="40"
  viewport-height="320px"
/>`;

const selectionCode = `<UiDataTable
  caption="Team members"
  :row-key="'id'"
  :columns="columns"
  :rows="rows"
  selectable="multiple"
  v-model:selected="selected"
/>`;

const emptyCode = `<UiDataTable caption="Team" :columns="columns" :rows="[]" empty-text="No members yet" />`;

const loadingCode = `<UiDataTable caption="Team" :columns="columns" :rows="[]" :loading="true" />`;

export const dataTableDemos: Demo[] = [
  {
    title: "Basic",
    code: basicCode,
    props: {
      caption: "Team members",
      rowKey: "id",
      columns: SORTABLE_COLUMNS,
      rows: ROWS,
      multiSort: true,
    },
  },
  {
    title: "Pagination",
    code: paginatedCode,
    props: {
      caption: "Catalogue",
      rowKey: "id",
      columns: SORTABLE_COLUMNS,
      rows: MANY,
      pageSize: 6,
      pageSizeOptions: [6, 12, 24],
    },
  },
  {
    title: "Virtual scroll",
    code: virtualCode,
    props: {
      caption: "10 000 rows",
      rowKey: "id",
      columns: PLAIN_COLUMNS,
      rows: HUGE,
      mode: "virtual",
      rowHeight: 40,
      viewportHeight: "320px",
    },
  },
  {
    title: "Selection",
    code: selectionCode,
    props: {
      caption: "Team members",
      rowKey: "id",
      columns: PLAIN_COLUMNS,
      rows: ROWS,
      selectable: "multiple",
    },
  },
  {
    title: "Empty state",
    code: emptyCode,
    props: {
      caption: "Team",
      columns: PLAIN_COLUMNS,
      rows: [],
      emptyText: "No members yet",
    },
  },
  {
    title: "Loading",
    code: loadingCode,
    props: {
      caption: "Team",
      columns: PLAIN_COLUMNS,
      rows: [],
      loading: true,
    },
  },
];
