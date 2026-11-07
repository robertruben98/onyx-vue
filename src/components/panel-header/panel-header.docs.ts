import type { ComponentDoc } from "../../docs-model";

export const panelHeaderDoc: ComponentDoc = {
  id: "panel-header",
  category: "Layout",
  title: "Panel Header",
  description:
    "The header of a list panel: a 64 px bar with the panel title (22/28) on the left and a row of action buttons on the right. Its colours come from `--ui-panel-header-*` tokens, which the chat preset feeds from `--ui-chat-surface` and `--ui-chat-ink`.",
  imports: ["UiPanelHeader", "UiIconButton"],
  api: [
    { name: "title", type: "string", default: "''", description: "Panel title, rendered as the heading." },
    { name: "headingLevel", type: "0 | 1 | 2 | 3", default: "2", description: "Heading level of the title; 0 renders plain text." },
    { name: "#title", type: "slot", default: "—", description: "Replaces the title text." },
    { name: "#actions", type: "slot", default: "—", description: "Right side: a row of icon buttons (8 px apart)." },
  ],
  demos: [
    {
      title: "Chat list header",
      code: `<UiPanelHeader title="Chats">
  <template #actions>
    <UiIconButton label="New chat" icon="M12 5v14M5 12h14" />
    <UiIconButton label="Menu" icon="M12 6h.01M12 12h.01M12 18h.01" />
  </template>
</UiPanelHeader>`,
    },
  ],
};
