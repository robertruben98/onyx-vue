import type { ComponentDoc } from "../../docs-model";

export const breadcrumbDoc: ComponentDoc = {
  id: "breadcrumb",
  title: "Breadcrumb",
  description:
    "Where the page sits. Levels with href are real links; the last level is the current page and is never a link. A client-side router listens to navigated and calls preventDefault() on the event.",
  imports: ["UiBreadcrumb"],
  api: [
    { name: "items", type: "{ label, href? }[]", default: "—", description: "The trail, root first." },
    { name: "label", type: "string", default: "'Breadcrumb'", description: "Accessible name of the nav landmark." },
    { name: "separator", type: "string", default: "'/'", description: "Glyph between levels (hidden from assistive tech)." },
    { name: "@navigated", type: "(item, index, event: MouseEvent) => void", default: "—", description: "A linked level was activated." },
  ],
  demos: [
    {
      title: "Service detail",
      setup: () => ({
        items: [{ label: "servicios", href: "#" }, { label: "SM23" }, { label: "api-core" }],
      }),
      code: `<UiBreadcrumb :items="items" label="Ruta" @navigated="(item, i, e) => e.preventDefault()" />`,
    },
  ],
};
