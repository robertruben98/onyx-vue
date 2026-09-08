import type { ComponentDoc } from "../../docs-model";

export const tabsDoc: ComponentDoc = {
  id: "tabs",
  title: "Tabs",
  description:
    "Tab list plus panels. The parent assigns the ids in mount order so every trigger's `aria-controls` lines up with its panel; arrow keys move between tabs and skip the disabled ones.",
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
    { name: "#default", type: "slot", default: "—", description: "Panel content, on `UiTab`." },
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
  ],
};
