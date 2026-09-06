import type { ComponentDoc } from "../../docs-model";

export const popoverDoc: ComponentDoc = {
  id: "popover",
  title: "Popover",
  description:
    "Floating panel anchored to a trigger, with focus trapped inside while it is open and restored to the trigger on close. Unlike a Tooltip it holds interactive content.",
  imports: ["UiPopover"],
  api: [
    {
      name: "v-model:open",
      type: "boolean",
      default: "false",
      description: "Open state. Leave it unbound to let the popover manage itself.",
    },
    {
      name: "placement",
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'bottom'",
      description: "Preferred placement relative to the trigger.",
    },
    { name: "label", type: "string", default: "''", description: "Accessible label for the panel." },
    {
      name: "@toggle",
      type: "(open: boolean) => void",
      default: "—",
      description: "Emitted whenever the open state changes.",
    },
    { name: "#trigger", type: "slot", default: "—", description: "The activator." },
    { name: "#content", type: "slot", default: "—", description: "Panel content." },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiPopover label="Quick actions">
  <template #trigger><UiButton variant="secondary">Actions</UiButton></template>
  <template #content>
    <p style="margin: 0 0 8px">Choose an action for this item.</p>
    <UiButton size="sm">Rename</UiButton>
    <UiButton size="sm" variant="danger">Delete</UiButton>
  </template>
</UiPopover>`,
    },
    {
      title: "Placement: top",
      code: `<UiPopover placement="top" label="Details">
  <template #trigger><UiButton variant="secondary">Show above</UiButton></template>
  <template #content><p style="margin: 0">Anchored to the top of the trigger.</p></template>
</UiPopover>`,
    },
  ],
};
