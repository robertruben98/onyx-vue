import type { ComponentDoc } from "../../docs-model";

export const paginationDoc: ComponentDoc = {
  id: "pagination",
  title: "Pagination",
  description:
    "Previous, next and the pages around the current one, with gaps for the rest. The current page is announced as such (`aria-current`). Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiPagination"],
  api: [
    { name: "v-model:page", type: "number", default: "1", description: "The current page, from 1." },
    {
      name: "pageCount",
      type: "number",
      default: "—",
      description: "Number of pages. Required unless `total` and `pageSize` are given, then it is `ceil(total / pageSize)`.",
    },
    {
      name: "total",
      type: "number",
      default: "—",
      description:
        "Items in the whole list. With `pageSize` it shows the range summary (\"1–20 of 43\", locale `paginationRange`) in a polite live region.",
    },
    {
      name: "v-model:pageSize",
      type: "number",
      default: "—",
      description: "Items per page. Changing it from the selector keeps the first item that was shown on the current page.",
    },
    {
      name: "pageSizeOptions",
      type: "number[]",
      default: "[]",
      description: "Page sizes offered in a compact select named by the locale `paginationPageSizeLabel` (\"Rows per page\").",
    },
    { name: "siblings", type: "number", default: "1", description: "Pages shown on each side of the current one." },
    { name: "label", type: "string", default: "'Pagination'", description: "Accessible name of the navigation." },
    { name: "@pageChanged", type: "(page: number) => void", default: "—", description: "Emitted when the user goes to another page, in addition to `v-model:page`." },
  ],
  demos: [
    {
      title: "Many pages",
      code: `<UiPagination v-model:page="page" :page-count="20" label="Results" />
<span>page {{ page }}</span>`,
      setup: () => ({ page: 7 }),
    },
    { title: "Few pages", code: `<UiPagination v-model:page="page" :page-count="4" />`, setup: () => ({ page: 1 }) },
    {
      title: "Range summary and page size",
      description: "For a list paginated by the server: pass the total and the page size; the page count follows.",
      code: `<UiPagination v-model:page="page" v-model:page-size="size" :total="43" :page-size-options="[20, 50]" />
<p>page {{ page }}, {{ size }} per page</p>`,
      setup: () => ({ page: 1, size: 20 }),
    },
  ],
};
