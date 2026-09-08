import type { ComponentDoc } from "../../docs-model";

export const sectionHeaderDoc: ComponentDoc = {
  id: "section-header",
  title: "Section Header",
  description:
    "The band above a list: an uppercase title, an optional count, actions beside it and controls pushed to the far end. The title is a real heading, so a page of sections keeps a usable outline.",
  imports: ["UiSectionHeader"],
  api: [
    { name: "title", type: "string", default: "—", description: "Section name, rendered as a heading." },
    {
      name: "count",
      type: "string | number | null",
      default: "null",
      description: "Shown beside the title. Zero renders; null omits the element.",
    },
    { name: "quiet", type: "boolean", default: "false", description: "Dims the title for an empty or inactive section." },
    {
      name: "headingLevel",
      type: "2 | 3 | 4 | 5 | 6",
      default: "2",
      description: "Heading level used for the title.",
    },
    { name: "#actions", type: "slot", default: "—", description: "Buttons placed beside the count." },
    { name: "#controls", type: "slot", default: "—", description: "Controls pushed to the far end, e.g. a sort select." },
  ],
  demos: [
    {
      title: "Title and count",
      code: `<UiSectionHeader title="pull requests" :count="12" />
<UiSectionHeader title="secrets sin resolver" count="nada abierto" quiet />`,
    },
    {
      title: "With actions and controls",
      code: `<UiSectionHeader title="pull requests" :count="12">
  <template #actions>
    <UiButton variant="text" size="sm">agrupar por repo</UiButton>
  </template>
  <template #controls>
    <span>orden</span>
    <UiSelect :options="orden" v-model="criterio" />
  </template>
</UiSectionHeader>`,
      setup: () => ({
        criterio: "recientes",
        orden: [
          { value: "recientes", label: "mas recientes" },
          { value: "viejas", label: "mas viejas" },
        ],
      }),
    },
  ],
};
