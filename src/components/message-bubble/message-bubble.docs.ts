import type { ComponentDoc } from "../../docs-model";

export const messageBubbleDoc: ComponentDoc = {
  id: "message-bubble",
  title: "Message Bubble",
  description:
    "A chat message: incoming aligns to the start, outgoing to the end. Slots for media (above the text), meta lines (under it) and a footer link. The text keeps its line breaks and wraps long words and URLs. The time floats inline at the end of the text (WhatsApp spacer technique). The bubble uses WhatsApp geometry: 7.5px radius, 6/7/8/9px padding, 14.2px text, max width 65/75/85/95% by viewport. Links inside the bubble (text, meta, footer) use `--ui-chat-link` (fallback `--ui-color-primary`), visited included, and are underlined on hover and focus. A draft has a dashed accent border and can offer a copy pill; a context bubble is dimmed and smaller. Colours come from the chat preset (`.ui-theme-chat`) with generic fallbacks.",
  imports: ["UiMessageBubble"],
  api: [
    { name: "direction", type: "'in' | 'out'", default: "—", description: "`in` aligns to the start, `out` to the end." },
    { name: "author", type: "string", default: "''", description: "Sender name, shown in groups and rooms." },
    { name: "time", type: "string", default: "—", description: "Time of the message, already formatted." },
    { name: "tail", type: "boolean", default: "false", description: "First bubble of a run: draws the WhatsApp tail on the outer top corner (end side for `out`, start side for `in`) and squares that corner." },
    { name: "variant", type: "'message' | 'draft' | 'context'", default: "'message'", description: "`draft` is an unsent suggestion; `context` is dimmed and smaller." },
    { name: "copyText", type: "string", default: "''", description: "Only for `draft`: renders a copy button that copies this text." },
    { name: "copyLabel", type: "string", default: "locale catalog", description: "Label of the copy button: \"Copy\", or \"Copiar\" under the Spanish catalog (`provideOnyxLocale(ES_MESSAGES)`)." },
    { name: "#default", type: "slot", default: "—", description: "The text. Line breaks are kept; long words and URLs wrap. Not rendered when empty." },
    { name: "#media", type: "slot", default: "—", description: "Image or file, above the text." },
    { name: "#meta", type: "slot", default: "—", description: "Lines under the text, e.g. an order lookup." },
    { name: "#footer", type: "slot", default: "—", description: "e.g. an \"abrir en Rocket.Chat\" link." },
    { name: "@copied", type: "event", default: "—", description: "Emitted after the clipboard write succeeded." },
  ],
  demos: [
    {
      title: "Incoming order message with lookup",
      code: `<UiMessageBubble direction="in" author="Baby Sm23" time="18:42">
  Recupérame estas 4 del 1041
  <template #meta>
    <span>Pedido 1041 · enviado</span>
    <span>Pedido 1042 · pendiente</span>
  </template>
</UiMessageBubble>`,
    },
    {
      title: "First of a run (tail)",
      code: `<UiMessageBubble direction="in" tail author="Baby Sm23" time="18:41">Hola</UiMessageBubble>
<UiMessageBubble direction="out" tail time="18:43">voy</UiMessageBubble>`,
    },
    { title: "Outgoing", code: `<UiMessageBubble direction="out" time="18:43">voy</UiMessageBubble>` },
    {
      title: "Draft with copy",
      code: `<UiMessageBubble direction="out" variant="draft" time="borrador" copy-text="Su pedido sale hoy.">
  Su pedido sale hoy.
</UiMessageBubble>`,
    },
    {
      title: "Links in body, meta and footer",
      code: `<UiMessageBubble direction="out" time="18:44">
  Seguimiento en <a href="#track">este enlace</a>
  <template #meta><a href="#order">Pedido 1041</a></template>
  <template #footer><a href="#rc">abrir en Rocket.Chat</a></template>
</UiMessageBubble>`,
    },
    {
      title: "Context",
      code: `<UiMessageBubble direction="in" variant="context" time="ayer">Mensaje anterior</UiMessageBubble>`,
    },
  ],
};
