import type { ComponentDoc } from "../../docs-model";

export const conversationDoc: ComponentDoc = {
  id: "conversation",
  title: "Conversation",
  description:
    "The scrolling pane of a chat. Items render through the scoped `item` slot (put a UiMessageBubble there) and a day separator is inserted whenever `day` changes. Scrolling within 200 px of the top emits `load-older` once per load. Prepending items keeps the visual position; appending scrolls to the bottom only if the reader was within 80 px of it, otherwise a \"↓ N new\" pill appears. Background is `--ui-chat-bg` from the chat preset (`.ui-theme-chat`).",
  imports: ["UiConversation", "UiMessageBubble"],
  api: [
    { name: "items", type: "Array<{ key: string; day: string }>", default: "—", description: "Items in chronological order. `day` is the label of the day the item belongs to." },
    { name: "hasOlder", type: "boolean", default: "false", description: "There are older items to load; enables `load-older`." },
    { name: "loadingOlder", type: "boolean", default: "false", description: "Older items are being fetched; suppresses `load-older`." },
    { name: "#item", type: "slot ({ item, index })", default: "—", description: "Renders one item, usually a UiMessageBubble." },
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
  ],
};
