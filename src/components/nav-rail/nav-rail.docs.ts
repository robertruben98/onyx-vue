import type { ComponentDoc } from "../../docs-model";

export const navRailDoc: ComponentDoc = {
  id: "nav-rail",
  title: "Nav Rail",
  description:
    "The standing navigation of a console page, where every entry carries how many things are behind it — the count is what tells you whether a section is worth opening, so it keeps its own tri-state and never shows a zero for 'not loaded yet'. Entries that stay in the app are buttons; one that leaves is a real link. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiNavRail", "UiNavRailGroup", "UiNavRailItem", "UiTag"],
  api: [
    {
      name: "NavRail label",
      type: "string",
      default: "'Sections'",
      description: "Accessible name for the navigation region.",
    },
    {
      name: "NavRailGroup label",
      type: "string",
      default: "—",
      description: "Heading for the group.",
    },
    {
      name: "NavRailGroup #trailing",
      type: "slot",
      default: "—",
      description:
        "A control for the group, in its own heading — a sort order, a filter. It belongs next to the list it changes.",
    },
    {
      name: "NavRailItem label",
      type: "string",
      default: "—",
      description: "What the entry navigates to.",
    },
    {
      name: "NavRailItem active",
      type: "boolean",
      default: "false",
      description:
        "The entry the page is showing. Marked on the edge as well as in colour, and exposed as aria-current.",
    },
    {
      name: "NavRailItem count / countState / countTone",
      type: "number | null / TriState / TriStateTone",
      default: "null / 'known' / 'neutral'",
      description: "How many things are behind the entry, and how sure we are.",
    },
    {
      name: "NavRailItem href",
      type: "string",
      default: "''",
      description:
        "Renders a real link instead of a button, for an entry that leaves the app — middle-click has to keep working.",
    },
    {
      name: "NavRailItem #marks",
      type: "slot",
      default: "—",
      description:
        "Warnings, before the count: they are what makes you look at the row.",
    },
    {
      name: "NavRailItem @selected",
      type: "() => void",
      default: "—",
      description: "A button entry was activated. Links navigate on their own.",
    },
    { name: "NavRail #default", type: "slot", default: "—", description: "The entries: NavRailItem and NavRailGroup." },
    { name: "NavRailGroup #default", type: "slot", default: "—", description: "The group's entries." },
    { name: "NavRailItem title", type: "string", default: "''", description: "Tooltip: the full name, or the shortcut that also gets here." },
    {
      name: "NavRailItem meta",
      type: "string | string[]",
      default: "undefined",
      description:
        "Secondary lines under the label, quieter and smaller: one per array item, each truncated on its own. Without it the entry is exactly the one-line entry it always was.",
    },
    { name: "NavRailItem #meta", type: "slot", default: "meta", description: "Replaces `meta`. Put one element per line so each one truncates." },
  ],
  demos: [
    {
      title: "Views and repositories",
      code: `<UiNavRail label="PR dashboard">
  <UiNavRailItem label="Todos" :count="57" active />
  <UiNavRailItem label="Listos para merge" :count="4" count-tone="success" />
  <UiNavRailItem label="Seguridad" count-state="unrequested" />
  <UiNavRailGroup label="Repos">
    <UiNavRailItem label="payment" :count="12" />
    <UiNavRailItem label="oidc" :count="6" />
  </UiNavRailGroup>
  <UiNavRailItem label="Dashboard" href="/" />
</UiNavRail>`,
    },
    {
      title: "Entries with meta",
      description: "A watched repo says how much is waiting and when it is next looked at, without opening it.",
      code: `<UiNavRail label="Watched repos" style="max-width: 18rem">
  <UiNavRailItem label="Todos" :count="9" />
  <UiNavRailItem label="shannon" :count="37" active :meta="['37 commits pendientes', 'último 31-10 · próx. 07-11']">
    <template #marks><UiTag variant="info" appearance="outline">analizando</UiTag></template>
  </UiNavRailItem>
  <UiNavRailItem label="gstack" :count="4" meta="próx. 07-11" />
  <UiNavRailItem label="LibreChat" :count="0" meta="al día" />
</UiNavRail>`,
    },
  ],
};
