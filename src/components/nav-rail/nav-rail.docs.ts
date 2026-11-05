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
        "Renders a real link instead of a button, so middle-click, Ctrl/Cmd+click, \"open in new tab\" and \"copy link\" work. Use it for in-app entries too: listen to `selected`, `preventDefault()` and push the route.",
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
      type: "(event?: MouseEvent) => void",
      default: "—",
      description:
        "The entry was activated. A link entry (`href`) emits it with the MouseEvent on a plain left click only (Ctrl, Cmd, Shift, Alt and middle clicks are left to the browser and do not emit): `preventDefault()` it to route in-app. A button entry emits it with no argument.",
    },
    { name: "NavRailGroup collapsible", type: "boolean", default: "false", description: "The heading becomes a button (`aria-expanded`, `aria-controls`) that folds the group's entries. Not collapsible, the group renders exactly as before." },
    { name: "NavRailGroup v-model:open", type: "boolean", default: "true", description: "Whether the entries are shown. A folded group that contains the `active` entry opens by itself." },
    { name: "NavRailGroup storageKey", type: "string", default: "''", description: "Keeps the open state in `localStorage` under this exact key (prefix it if the origin is shared). Blocked or throwing storage is ignored: the group still renders and folds." },
    { name: "NavRailGroup count / countTone", type: "number | null / TriStateTone", default: "null / 'neutral'", description: "What is waiting inside, shown on the heading only while the group is folded." },
    { name: "NavRail active entry", type: "behaviour", default: "—", description: "On mount, and whenever the active entry (`aria-current=\"page\"`) changes or its folded group opens, the rail moves its scrolling container's `scrollTop` just enough to show it (not `scrollIntoView`, which in Chromium also moves the Tab starting point past the skip link): a no-op when it is already visible, never smooth (`prefers-reduced-motion` is respected)." },
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
    { name: "NavRail variant", type: "'default' | 'icons'", default: "'default'", description: "`icons` is the 64 px icon strip of a messaging app." },
    { name: "NavRail #footer", type: "slot", default: "—", description: "Entries pinned to the bottom of the rail (settings, profile)." },
    { name: "NavRailItem icon / #icon", type: "Component / slot", default: "—", description: "Makes the entry a round icon button; `label` becomes its accessible name and tooltip." },
    { name: "NavRailItem badge", type: "number | null", default: "null", description: "Count pill on the icon's corner, 99+ above 99, hidden at 0; spoken as part of the name." },
    { name: "NavRailItem dot", type: "boolean", default: "false", description: "A dot on the icon's corner for 'something new' without a number." },
    { name: "NavRailItem #meta", type: "slot", default: "meta", description: "Replaces `meta`. Put one element per line so each one truncates." },
  ],
  demos: [
    {
      title: "Icon rail (chat apps)",
      description: "variant=\"icons\": a 64 px strip of round 40 px buttons. The label is the accessible name and tooltip; badge/dot sit on the corner; the footer slot pins entries to the bottom.",
      code: `<UiNavRail variant="icons" label="Apps" style="height: 22rem">
  <UiNavRailItem label="Chats" :icon="ChatIcon" :badge="5" active />
  <UiNavRailItem label="Calls" :icon="CallIcon" />
  <UiNavRailItem label="Status" :icon="StatusIcon" dot />
  <template #footer>
    <UiNavRailItem label="Settings" :icon="GearIcon" />
  </template>
</UiNavRail>`,
    },
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
      title: "Routable links and collapsible groups",
      description: "Every entry is a real link; a plain click is handed to the app to route, a modified click opens a new tab. Groups fold, remember it, and show what waits inside while folded.",
      code: `<UiNavRail label="Console">
  <UiNavRailItem label="Home" href="/" :active="route === '/'"
    @selected="(e) => { e.preventDefault(); go('/') }" />
  <UiNavRailGroup label="System" collapsible storage-key="console:nav:system" :count="3" count-tone="warning">
    <UiNavRailItem label="Jobs" href="/jobs" :active="route === '/jobs'"
      @selected="(e) => { e.preventDefault(); go('/jobs') }" />
    <UiNavRailItem label="Log" href="/log" :active="route === '/log'"
      @selected="(e) => { e.preventDefault(); go('/log') }" />
  </UiNavRailGroup>
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
