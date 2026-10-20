import type { ComponentDoc } from "../../docs-model";

export const menuDoc: ComponentDoc = {
  id: "menu",
  title: "Menu",
  description:
    "Trigger plus a list of actions. The panel teleports to `body`, opens with the first enabled item focused, and returns focus to the trigger on close.",
  imports: ["UiMenu"],
  api: [
    {
      name: "items",
      type: "MenuItem[]",
      default: "[]",
      description: "`{ id, label, disabled? }` per item. Disabled items are skipped by the keyboard.",
    },
    {
      name: "@itemSelect",
      type: "(item: MenuItem) => void",
      default: "—",
      description: "Emitted with the chosen item.",
    },
    { name: "#default", type: "slot", default: "—", description: "Trigger label." },
  ],
  demos: [
    {
      title: "Basic",
      description: "Open it and walk the items with the arrow keys.",
      code: `<UiMenu :items="items" @item-select="last = $event.label">Actions</UiMenu>
<span>last: {{ last || '(none)' }}</span>`,
      setup: () => ({
        last: "",
        items: [
          { id: "edit", label: "Edit" },
          { id: "duplicate", label: "Duplicate" },
          { id: "archive", label: "Archive" },
          { id: "delete", label: "Delete", disabled: true },
        ],
      }),
    },
  ],
};
