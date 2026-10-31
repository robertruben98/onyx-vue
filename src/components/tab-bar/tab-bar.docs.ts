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
        "Every destination, in order: `{ id, label, href, icon?, count?, live? }`. `count` shows a number badge (hidden at 0); `live` a dot that says something is running, and wins over `count`.",
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
    { name: "moreLabel", type: "string", default: "'More'", description: "Name of the overflow button." },
    { name: "moreIcon", type: "string", default: "'☰'", description: "Glyph of the overflow button." },
    { name: "label", type: "string", default: "'Main'", description: "Accessible name of the navigation landmark." },
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
