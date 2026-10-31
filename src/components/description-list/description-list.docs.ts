import type { ComponentDoc } from "../../docs-model";

export const descriptionListDoc: ComponentDoc = {
  id: "description-list",
  title: "Description List",
  description:
    "Terms and values in a grid — the facts of a service, a run, an agent. A real <dl>, values wrap anywhere (they are usually paths and ids), and an empty value shows an em dash instead of a blank that reads as 'not loaded'. Passing a deprecated tone warns once per name per page load in development; aliases remain until 1.0.",
  imports: ["UiDescriptionList"],
  api: [
    { name: "items", type: "{ term, value, tone?, title? }[]", default: "—", description: "The pairs in reading order. `tone` is neutral | muted | success | warning | danger (`default` still works as the deprecated name of neutral)." },
    { name: "columns", type: "number | 'auto'", default: "'auto'", description: "Columns of pairs; auto fits 16rem columns." },
    { name: "dense", type: "boolean", default: "false", description: "Tighter rows." },
    { name: "ruled", type: "boolean", default: "true", description: "A rule under every pair." },
    { name: "variant", type: "'default' | 'emphasis'", default: "'default'", description: "`emphasis`: the value larger and in the main text colour, the term in normal case, muted (no tiny uppercase)." },
    { name: "layout", type: "'stacked' | 'inline'", default: "'stacked'", description: "`inline`: \"term: value\" on one line, wrapping on a phone." },
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
    {
      title: "Emphasis, inline",
      description: "The facts of an exam on a profile page.",
      setup: () => ({
        exam: [
          { term: "Exam", value: "LanguageCert B1 Achiever (online)" },
          { term: "Date", value: "Monday 26 October 2026" },
          { term: "Written", value: "10:20" },
          { term: "Speaking", value: "19:00" },
        ],
      }),
      code: `<UiDescriptionList :items="exam" variant="emphasis" :columns="1" />
<UiDescriptionList :items="exam" variant="emphasis" layout="inline" :columns="1" :ruled="false" dense />`,
    },
  ],
};
