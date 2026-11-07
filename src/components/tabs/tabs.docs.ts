import type { ComponentDoc } from "../../docs-model";

export const tabsDoc: ComponentDoc = {
  id: "tabs",
  category: "Navigation",
  title: "Tabs",
  description:
    "Tab list plus panels. Triggers and panels are numbered from the same list, by position, so a list that grows while it is on screen keeps every trigger's `aria-controls` on its own panel; arrow keys move between tabs and skip the disabled ones.",
  imports: ["UiTabs", "UiTab"],
  api: [
    {
      name: "v-model:selectedIndex",
      type: "number",
      default: "0",
      description: "Index of the active tab, on `UiTabs`.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name for the tab list, on `UiTabs`.",
    },
    {
      name: "overflow",
      type: "'wrap' | 'scroll'",
      default: "'wrap'",
      description: "When the tabs do not fit: wrap onto more rows, or keep one row that scrolls sideways (phones). The selected tab is centred, and each edge that hides tabs shows a fade and an arrow button (for mouse and touch; the keyboard moves with the arrow keys).",
    },
    {
      name: "label",
      type: "string",
      default: "— (required)",
      description: "Trigger label, on `UiTab`.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Skipped by the keyboard and unselectable, on `UiTab`.",
    },
    {
      name: "panels",
      type: "'own' | 'none'",
      default: "'own'",
      description: "On `UiTabs`. `none` renders only the tab list (no `role=\"tabpanel\"`): render ONE panel yourself with `id = panelId(selectedIndex)` and `aria-labelledby = tabId(selectedIndex)` (both exposed on the component ref), so a heavy body is not remounted on every switch.",
    },
    {
      name: "count",
      type: "number | null",
      default: "null",
      description: "On `UiTab`. Badge after the label, part of the trigger's accessible name (\"Ready 3\"). `0` is shown; `null` shows nothing.",
    },
    {
      name: "warn",
      type: "boolean",
      default: "false",
      description: "On `UiTab`. Adds a warning marker and a visually hidden description wired with `aria-describedby` on the trigger.",
    },
    {
      name: "warnText",
      type: "string",
      default: "locale `tabWarnText`",
      description: "On `UiTab`. What the warning means (\"2 stuck\"); the description read by assistive tech.",
    },
    { name: "#default", type: "slot", default: "—", description: "Panel content, on `UiTab`." },
    { name: "index", type: "number", default: "—", description: "Internal: Tabs sets each Tab's position itself. Do not pass it." },
  ],
  demos: [
    {
      title: "Basic",
      code: `<div style="width: 100%">
  <UiTabs aria-label="Account">
    <UiTab label="Profile">Your public profile details.</UiTab>
    <UiTab label="Security">Password and two-factor settings.</UiTab>
    <UiTab label="Billing" disabled>Upgrade to manage billing.</UiTab>
  </UiTabs>
</div>`,
    },
    {
      title: "Controlled",
      code: `<div style="width: 100%">
  <UiTabs v-model:selected-index="index" aria-label="Controlled">
    <UiTab label="One">First panel.</UiTab>
    <UiTab label="Two">Second panel.</UiTab>
  </UiTabs>
  <p>index: {{ index }}</p>
  <UiButton size="sm" @clicked="index = index === 0 ? 1 : 0">Toggle from outside</UiButton>
</div>`,
      setup: () => ({ index: 0 }),
    },
    {
      title: "Count and warning",
      code: `<div style="width: 100%">
  <UiTabs aria-label="Trays">
    <UiTab label="Ready" :count="3" warn warn-text="2 stuck">Ready packages.</UiTab>
    <UiTab label="Running" :count="0">Nothing running.</UiTab>
    <UiTab label="Done" :count="128">Finished packages.</UiTab>
  </UiTabs>
</div>`,
    },
    {
      title: "Scrolling list with warnings (360 px)",
      code: `<div style="width: 360px; max-width: 100%" data-demo="tabs-warn-scroll">
  <UiTabs overflow="scroll" aria-label="Trays">
    <UiTab label="Ready" :count="3" warn warn-text="2 packages are stuck in this tray">Ready.</UiTab>
    <UiTab label="Running" :count="1" warn warn-text="1 package has been running for hours">Running.</UiTab>
    <UiTab label="Failed" :count="4" warn warn-text="4 packages failed and need a retry">Failed.</UiTab>
    <UiTab label="Done" :count="128" warn warn-text="Some finished packages were not published">Done.</UiTab>
  </UiTabs>
</div>`,
    },
    {
      title: "Without panels",
      code: `<div style="width: 100%">
  <UiTabs panels="none" v-model:selected-index="index" aria-label="Filter">
    <UiTab label="All" :count="9" />
    <UiTab label="Failing" :count="2" warn warn-text="2 failing" />
  </UiTabs>
  <div role="tabpanel" id="ui-tabpanel-0" aria-labelledby="ui-tab-0">One panel the app owns (selected: {{ index }}).</div>
</div>`,
      setup: () => ({ index: 0 }),
    },
  ],
};
