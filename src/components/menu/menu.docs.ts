import type { ComponentDoc } from "../../docs-model";

export const menuDoc: ComponentDoc = {
  id: "menu",
  title: "Menu",
  description:
    "Trigger plus a list of actions. The panel teleports to `body`, opens with the first enabled item focused, and returns focus to the trigger on close. Listening to a deprecated event warns once per name per page load in development; old events remain until 1.0.",
  imports: ["UiMenu"],
  api: [
    {
      name: "items",
      type: "MenuItem[]",
      default: "[]",
      description:
        "`{ id, label, disabled?, checked? }` per item. Disabled items are skipped by the keyboard. An item with `checked` (true or false) is an option that toggles: it renders as `menuitemcheckbox` with `aria-checked` and a check mark; without `checked` it is a plain `menuitem`.",
    },
    {
      name: "label",
      type: "string",
      default: "—",
      description:
        "Accessible name of the trigger, set as its `aria-label` and `title`. Use it when the slot is only a glyph (\"⋯\"); a text slot names the trigger by itself.",
    },
    {
      name: "@itemSelected / @itemSelect",
      type: "(item: MenuItem) => void",
      default: "—",
      description: "Emitted with the chosen item. `@itemSelect` is the deprecated name of the same event, still emitted until 1.0.",
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
    {
      title: "Glyph trigger and checkable items",
      description:
        "`label` names a \"⋯\" trigger. Items with `checked` toggle: the menu emits the item and the page flips its state.",
      code: `<UiMenu
  label="More actions"
  :items="[
    { id: 'seen', label: 'Seen', checked: seen },
    { id: 'saved', label: 'Saved for later', checked: saved },
    { id: 'share', label: 'Share' },
  ]"
  @item-selected="$event.id === 'seen' ? (seen = !seen) : $event.id === 'saved' ? (saved = !saved) : null"
>⋯</UiMenu>
<span>seen: {{ seen }}, saved: {{ saved }}</span>`,
      setup: () => ({ seen: true, saved: false }),
    },
  ],
};
