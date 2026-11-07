import type { ComponentDoc } from "../../docs-model";

export const conversationHeaderDoc: ComponentDoc = {
  id: "conversation-header",
  category: "Messaging",
  title: "Conversation Header",
  description:
    "The header of an open conversation: 64 px high, a `leading` slot (the back arrow on a phone), a 40 px avatar, the name (16/21) with the subtitle (13/20) stacked under it, and an `actions` slot. It floats over the wallpaper with a soft shadow (`--ui-chat-shadow-header`) instead of a border line.",
  imports: ["UiConversationHeader", "UiIconButton"],
  api: [
    { name: "name", type: "string", default: "''", description: "Contact or group name; rendered as the heading and used for the avatar initials." },
    { name: "subtitle", type: "string", default: "''", description: "Line under the name: online state, member list." },
    { name: "avatarSrc", type: "string", default: "''", description: "Avatar image URL; without it the avatar shows initials." },
    { name: "avatarGradient", type: "boolean", default: "true", description: "Initials on a gradient chosen from the name." },
    { name: "headingLevel", type: "0 | 1 | 2 | 3", default: "2", description: "Heading level of the name; 0 renders plain text." },
    { name: "#leading", type: "slot", default: "—", description: "Before the avatar: the back button on narrow screens." },
    { name: "#avatar", type: "slot", default: "—", description: "Replaces the avatar." },
    { name: "#title", type: "slot", default: "—", description: "Replaces the name." },
    { name: "#subtitle", type: "slot", default: "—", description: "Replaces the subtitle." },
    { name: "#actions", type: "slot", default: "—", description: "Right side: search, menu." },
  ],
  demos: [
    {
      title: "Contact with actions",
      code: `<UiConversationHeader name="Ana Torres" subtitle="online">
  <template #actions>
    <UiIconButton label="Search" icon="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />
    <UiIconButton label="Menu" icon="M12 6h.01M12 12h.01M12 18h.01" />
  </template>
</UiConversationHeader>`,
    },
  ],
};
