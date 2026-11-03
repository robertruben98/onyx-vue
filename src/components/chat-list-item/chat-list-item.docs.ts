import type { ComponentDoc } from "../../docs-model";

export const chatListItemDoc: ComponentDoc = {
  id: "chat-list-item",
  title: "Chat List Item",
  description:
    "One row of a conversation list: avatar, name, last message cut to one line, time, unread count, channel mark and tag. The root is a button (keyboard, 44 px tall); the open chat carries aria-current. Colours come from the chat preset (`.ui-theme-chat`) and fall back to the generic tokens elsewhere.",
  imports: ["UiChatListItem"],
  api: [
    { name: "title", type: "string", default: "—", description: "Chat name." },
    { name: "preview", type: "string", default: "''", description: "Last message. One line, ellipsis when long." },
    { name: "time", type: "string", default: "''", description: "Time of the last message, already formatted." },
    { name: "unread", type: "number", default: "0", description: "Unread messages. 0 shows no badge; above 99 reads 99+." },
    { name: "source", type: "string", default: "''", description: "Short mark of the channel, e.g. \"WA\" or \"RC\"." },
    { name: "tag", type: "string", default: "''", description: "Label under the preview, e.g. \"#ordenes\"." },
    { name: "tagTone", type: "'neutral' | 'danger' | 'success'", default: "'neutral'", description: "Colour of the tag." },
    { name: "selected", type: "boolean", default: "false", description: "The chat open in the conversation pane. Sets aria-current=\"true\"." },
    { name: "avatarText", type: "string", default: "''", description: "Initials in the avatar. Defaults to the ones of the title." },
    { name: "avatarSeed", type: "string", default: "''", description: "Text the avatar colour is picked from; the same seed is always the same colour. Defaults to the title." },
    { name: "select", type: "event", default: "—", description: "Emitted when the row is activated (click, Enter or Space)." },
  ],
  demos: [
    {
      title: "A busy chat",
      code: `<UiChatListItem
  title="Baby Sm23"
  preview="Recupérame estas 4 del 1041"
  time="18:42"
  :unread="3"
  source="WA"
  tag="#ordenes"
  tag-tone="danger"
  avatar-seed="baby-sm23"
/>`,
    },
    {
      title: "Selected, read",
      code: `<UiChatListItem title="Equipo Procesamiento" preview="Listo, desplegado en sandbox" time="Ayer" source="RC" selected />`,
    },
  ],
};
