import type { ComponentDoc } from "../../docs-model";

export const loadMoreRowDoc: ComponentDoc = {
  id: "load-more-row",
  title: "Load More Row",
  description:
    "Closes a truncated list with a button that names how many rows are still hidden. Renders nothing when nothing remains — a row offering to load zero says the list is truncated when it is complete.",
  imports: ["UiLoadMoreRow"],
  api: [
    { name: "remaining", type: "number", default: "—", description: "Rows still hidden. At zero or below nothing renders." },
    { name: "label", type: "string", default: "''", description: "Overrides the generated label." },
    { name: "loading", type: "boolean", default: "false", description: "Shows the button busy and suppresses activation." },
    { name: "@loadMore", type: "() => void", default: "—", description: "Emitted when the user asks for the rest." },
  ],
  demos: [
    {
      title: "Remaining rows",
      code: `<UiLoadMoreRow :remaining="737" />
<UiLoadMoreRow :remaining="12" label="ver las 12 restantes" />
<UiLoadMoreRow :remaining="9" loading />`,
    },
  ],
};
