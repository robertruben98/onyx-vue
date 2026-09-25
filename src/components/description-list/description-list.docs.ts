import type { ComponentDoc } from "../../docs-model";

export const descriptionListDoc: ComponentDoc = {
  id: "description-list",
  title: "Description List",
  description:
    "Terms and values in a grid — the facts of a service, a run, an agent. A real <dl>, values wrap anywhere (they are usually paths and ids), and an empty value shows an em dash instead of a blank that reads as 'not loaded'.",
  imports: ["UiDescriptionList"],
  api: [
    { name: "items", type: "{ term, value, tone?, title? }[]", default: "—", description: "The pairs in reading order." },
    { name: "columns", type: "number | 'auto'", default: "'auto'", description: "Columns of pairs; auto fits 16rem columns." },
    { name: "dense", type: "boolean", default: "false", description: "Tighter rows." },
    { name: "ruled", type: "boolean", default: "true", description: "A rule under every pair." },
    { name: "emptyValue", type: "string", default: "'—'", description: "What an empty value shows." },
    { name: "#value-<term>", type: "slot { item }", default: "—", description: "Overrides one value, e.g. with a link." },
  ],
  demos: [
    {
      title: "Facts of a service",
      setup: () => ({
        items: [
          { term: "puerto", value: 8000 },
          { term: "stack", value: "django" },
          { term: "directorio", value: "/home/robert/Workspaces/sm23/api-core" },
          { term: "rama base", value: "main" },
          { term: "migraciones", value: "2 pendientes", tone: "warning" },
          { term: "ultimo reinicio", value: "" },
        ],
      }),
      code: `<UiDescriptionList :items="items" />`,
    },
    {
      title: "Fixed columns, dense",
      setup: () => ({
        items: [
          { term: "runs", value: 42 },
          { term: "ok", value: 38, tone: "success" },
          { term: "fallo", value: 4, tone: "danger" },
          { term: "skip", value: 0, tone: "muted" },
        ],
      }),
      code: `<UiDescriptionList :items="items" :columns="4" dense />`,
    },
  ],
};
