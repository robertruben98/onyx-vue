import type { ComponentDoc } from "../../docs-model";

export const codeBlockDoc: ComponentDoc = {
  id: "code-block",
  title: "Code Block",
  description:
    "Monospaced output in a box: an HTTP response, the tail of a log, a prompt. With followTail it keeps the end in view as text arrives — but only while the reader is at the end, so scrolling up to read an error keeps your place.",
  imports: ["UiCodeBlock"],
  api: [
    { name: "text", type: "string", default: "''", description: "The text." },
    { name: "maxHeight", type: "string", default: "''", description: "Height before it scrolls." },
    { name: "followTail", type: "boolean", default: "false", description: "Keeps the end in view while the reader is there." },
    { name: "wrap", type: "boolean", default: "true", description: "Wraps long lines; false scrolls sideways." },
    { name: "emptyText", type: "string", default: "''", description: "Shown while there is no text." },
    { name: "loading", type: "boolean", default: "false", description: "Spinner instead of the text; aria-busy." },
    { name: "label", type: "string", default: "''", description: "Makes it a named region." },
    { name: "tone", type: "'default' | 'muted' | 'danger'", default: "'default'", description: "Tone of the text." },
    { name: "scrollToEnd()", type: "exposed method", default: "—", description: "Jumps to the end and re-pins." },
  ],
  demos: [
    {
      title: "A response body",
      code: `<UiCodeBlock label="respuesta" text='{ "ok": true, "id": 42, "topic": "orders" }' />`,
    },
    {
      title: "Log tail",
      setup: () => ({ lines: Array.from({ length: 30 }, (_, i) => `10:04:${String(i).padStart(2, "0")} GET /api/health 200`).join("\n") }),
      code: `<UiCodeBlock :text="lines" max-height="10rem" follow-tail label="logs de api-core" />`,
    },
    {
      title: "Empty and loading",
      code: `<UiCodeBlock empty-text="(sin logs)" />
<UiCodeBlock loading />`,
    },
  ],
};
