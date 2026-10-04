import type { ComponentDoc } from "../../docs-model";

export const paginationDoc: ComponentDoc = {
  id: "pagination",
  title: "Pagination",
  description:
    "Previous, next and the pages around the current one, with gaps for the rest. The current page is announced as such (`aria-current`).",
  imports: ["UiPagination"],
  api: [
    { name: "v-model:page", type: "number", default: "1", description: "The current page, from 1." },
    { name: "pageCount", type: "number", default: "—", description: "Number of pages (required)." },
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
  ],
};
