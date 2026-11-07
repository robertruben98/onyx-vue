import type { ComponentDoc } from "../../docs-model";

export const conversationDoc: ComponentDoc = {
  id: "conversation",
  category: "Messaging",
  title: "Conversation",
  description:
    "The scrolling pane of a chat. Items render through the scoped `item` slot (put a UiMessageBubble there) and a day separator is inserted whenever `day` changes. Scrolling within 200 px of the top emits `load-older` once per load. Prepending items keeps the visual position; appending scrolls to the bottom only if the reader was within 80 px of it, otherwise a \"↓ N new\" pill appears. Background is `--ui-chat-bg` from the chat preset (`.ui-theme-chat`) under an original line-icon doodle wallpaper (a mask coloured by `--ui-chat-wallpaper-ink` at .6). Rows have 63 px side padding (25/19 px up to 968 px); an item whose `group` differs from the previous one (or whose day changed) is the start of a run (`first` in the slot scope): 12 px above it, 2 px inside a run. Each day chip is sticky at the top while its day is on screen. The `footer` slot, or `composerText` for a read-only bar, renders the floating composer pill (52 px, radius 26).",
  imports: ["UiConversation", "UiMessageBubble"],
  api: [
    { name: "items", type: "Array<{ key: string; day: string; group?: string }>", default: "—", description: "Items in chronological order. `day` is the label of the day the item belongs to; `group` (for example the sender) delimits runs. Without `group` every item starts a run." },
    { name: "composerText", type: "string", default: "—", description: "Text of the read-only composer pill drawn under the scroller. Ignored when the `footer` slot is used." },
    { name: "hasOlder", type: "boolean", default: "false", description: "There are older items to load; enables `load-older`." },
    { name: "loadingOlder", type: "boolean", default: "false", description: "Older items are being fetched; suppresses `load-older`." },
    { name: "#item", type: "slot ({ item, index, first })", default: "—", description: "Renders one item, usually a UiMessageBubble. `first` is true at the start of a run (group changed or new day)." },
    { name: "#footer", type: "slot", default: "—", description: "Content of the floating composer pill (input, buttons). Replaces `composerText`." },
    { name: "@load-older", type: "event", default: "—", description: "Emitted when scrolled within 200 px of the top and `hasOlder && !loadingOlder`. Once per load." },
  ],
  demos: [
    {
      title: "Two days with a message list",
      code: `<UiConversation
  class="ui-theme-chat"
  style="height: 20rem"
  :items="[
    { key: '1', day: 'ayer', text: 'Hola' },
    { key: '2', day: 'hoy', text: 'Buenas' },
  ]"
>
  <template #item="{ item }">
    <UiMessageBubble direction="in" time="18:42">{{ item.text }}</UiMessageBubble>
  </template>
</UiConversation>`,
    },
    {
      title: "Runs by sender with a read-only composer",
      code: `<UiConversation
  class="ui-theme-chat"
  style="height: 22rem"
  composer-text="Solo lectura"
  :items="[
    { key: '1', day: 'hoy', group: 'ana', text: 'Hola' },
    { key: '2', day: 'hoy', group: 'ana', text: 'Estas?' },
    { key: '3', day: 'hoy', group: 'yo', text: 'Si, dime' },
  ]"
>
  <template #item="{ item }">
    <UiMessageBubble :direction="item.group === 'yo' ? 'out' : 'in'" time="18:42">{{ item.text }}</UiMessageBubble>
  </template>
</UiConversation>`,
    },
  ],
};
