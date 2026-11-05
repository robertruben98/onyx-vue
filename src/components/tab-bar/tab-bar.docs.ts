import type { ComponentDoc } from "../../docs-model";

export const tabBarDoc: ComponentDoc = {
  id: "tab-bar",
  title: "Tab Bar",
  description:
    "The navigation a phone keeps under the thumb: the first few destinations in a bar fixed to the bottom, the rest behind \"More\", a sheet that opens upwards. Entries are real links; `itemClicked` lets a single-page app route them itself. Above `hideAbove` it is not rendered, so the page's own rail or header takes over. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiTabBar"],
  api: [
    {
      name: "items",
      type: "TabBarItem[]",
      default: "—",
      description:
        "Every destination, in order: `{ id, label, href, icon?, count?, live?, group? }`. `group` lists consecutive hidden items under one heading in the More sheet (ungrouped items stay in the flat list). `count` shows a number badge (hidden at 0); `live` a dot that says something is running, and wins over `count`.",
    },
    {
      name: "activeId",
      type: "string",
      default: "''",
      description:
        "The destination the page shows. Marked with `aria-current=\"page\"`; when it is one of the hidden ones, \"More\" is marked instead.",
    },
    {
      name: "visible",
      type: "number",
      default: "4",
      description:
        "Destinations in the bar before \"More\" takes the rest. When only one would be left over it goes in the bar instead: a menu holding one link is a link behind an extra tap.",
    },
    {
      name: "hideAbove",
      type: "number",
      default: "640",
      description: "Viewport width (px) from which the bar is not rendered. `0` renders it at every width.",
    },
    { name: "More button count", type: "behaviour", default: "—", description: "\"More\" shows the sum of the `count`s of the items in the sheet, or the live marker when any of them is `live` (live wins). Its accessible name says so: \"More, 3 waiting\" / \"More, running\" (locale key `tabBarWaitingLabel`)." },
    { name: "Sheet height", type: "behaviour", default: "—", description: "The sheet never grows past the viewport minus the bar: it scrolls inside itself. The bar honours `env(safe-area-inset-bottom)`." },
    { name: "moreLabel", type: "string", default: "'More'", description: "Name of the overflow button." },
    { name: "moreIcon", type: "string", default: "'☰'", description: "Glyph of the overflow button." },
    { name: "label", type: "string", default: "'Main' ('Sections' for `chat`)", description: "Accessible name of the navigation landmark. The `chat` variant defaults to 'Sections' so it differs from a side rail." },
    { name: "variant", type: "'default' | 'chat'", default: "'default'", description: "`chat`: messaging-app bottom nav — 80 px tall, icon in a 64x32 pill filled when active, 12/16 label, count badge. Applied automatically under `.ui-theme-chat`. Item `icon` may be a string or a component." },
    { name: "liveLabel", type: "string", default: "'running'", description: "Spoken name of the `live` dot." },
    {
      name: "@itemClicked",
      type: "(item: TabBarItem, event: MouseEvent) => void",
      default: "—",
      description:
        "A plain left click on a destination (a click with Ctrl, Cmd, Shift or Alt is left to the browser). Call `event.preventDefault()` and push the route to keep a single-page app from reloading.",
    },
  ],
  demos: [
    {
      title: "Grouped More sheet",
      description: "Hidden items with a `group` sit under headings; More carries the sum of their counts.",
      code: `<UiTabBar :hide-above="0" :visible="3" :items="[
  { id: 'a', label: 'Home', href: '#a' },
  { id: 'b', label: 'Get', href: '#b' },
  { id: 'c', label: 'Library', href: '#c' },
  { id: 'd', label: 'Jobs', href: '#d', group: 'System', count: 2 },
  { id: 'e', label: 'Log', href: '#e', group: 'System', count: 1 },
  { id: 'f', label: 'Rules', href: '#f', group: 'Library' },
]" />`,
    },
    {
      title: "Chat variant",
      description: "Icon in a pill, filled when active; the count is a badge.",
      code: `<UiTabBar variant="chat" :hide-above="0" active-id="chats"
  :items="[
    { id: 'chats', label: 'Chats', href: '#/chats', icon: '💬', count: 5 },
    { id: 'updates', label: 'Updates', href: '#/updates', icon: '◎' },
    { id: 'calls', label: 'Calls', href: '#/calls', icon: '✆' },
  ]" />`,
    },
    {
      title: "Four in the bar, the rest behind More",
      description:
        "Rendered at every width here (`:hide-above=\"0\"`) so it shows on a desktop; it is fixed to the bottom of the window.",
      code: `<UiTabBar
  :items="items"
  :active-id="active"
  :hide-above="0"
  @item-clicked="(item, e) => { e.preventDefault(); active = item.id }"
/>`,
      setup: () => ({
        active: "home",
        items: [
          { id: "home", label: "Home", href: "#home", icon: "🏠" },
          { id: "get", label: "Get", href: "#get", icon: "⬇" },
          { id: "library", label: "Library", href: "#library", icon: "📚" },
          { id: "jobs", label: "Jobs", href: "#jobs", icon: "⚡", live: true },
          { id: "rules", label: "Rules", href: "#rules" },
          { id: "channels", label: "Channels", href: "#channels", count: 3 },
          { id: "log", label: "Log", href: "#log" },
        ],
      }),
    },
  ],
};
