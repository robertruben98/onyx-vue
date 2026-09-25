import type { ComponentDoc } from "../../docs-model";

export const filterBarDoc: ComponentDoc = {
  id: "filter-bar",
  title: "Filter Bar",
  description:
    "The strip under a page's top bar: a search box, filter chips, and trailing controls. It wraps onto more rows instead of scrolling sideways, and exposes focusSearch() for the '/' shortcut.",
  imports: ["UiFilterBar", "UiFilterChip", "UiButton"],
  api: [
    { name: "v-model:search", type: "string", default: "''", description: "The search text." },
    { name: "searchPlaceholder", type: "string", default: "'filter'", description: "Placeholder of the search box." },
    { name: "searchLabel", type: "string", default: "'Filter'", description: "Accessible name of the search box." },
    { name: "showSearch", type: "boolean", default: "true", description: "Hides the search box." },
    { name: "label", type: "string", default: "'Filters'", description: "Accessible name of the search landmark." },
    { name: "#default", type: "slot", default: "—", description: "Filter chips." },
    { name: "#trailing", type: "slot", default: "—", description: "Controls pushed to the end: clear, hidden-rows notice." },
    { name: "focusSearch()", type: "exposed method", default: "—", description: "Moves focus to the search box." },
  ],
  demos: [
    {
      title: "Search, chips and a hidden-rows notice",
      setup: () => ({ q: "", on: "todos" }),
      code: `<UiFilterBar v-model:search="q" search-placeholder="filtrar run, repo, PR" search-label="filtrar runs">
  <UiFilterChip label="todos" :count="42" :pressed="on === 'todos'" @toggled="on = 'todos'" />
  <UiFilterChip label="ok" :count="36" tone="ok" :pressed="on === 'ok'" @toggled="on = 'ok'" />
  <UiFilterChip label="fallo" :count="4" tone="danger" :pressed="on === 'fallo'" @toggled="on = 'fallo'" />
  <template #trailing>
    <UiFilterChip label="oculto" :count="2" tone="warn" dashed />
  </template>
</UiFilterBar>`,
    },
  ],
};
