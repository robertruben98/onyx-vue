import type { ComponentDoc } from "../../docs-model";

const ESC = "\u001b";

export const ansiTerminalDoc: ComponentDoc = {
  id: "ansi-terminal",
  title: "ANSI Terminal",
  description:
    "The raw output of another program with its ANSI colours, live while it runs. It only appends: when lines grows, only the new tail is parsed, continuing the colour state the previous chunk left open. Text goes in as text, never markup. createAnsiParser() and stripAnsi() are exported for other renderers and downloads.",
  imports: ["UiAnsiTerminal", "UiCheckbox", "createAnsiParser", "stripAnsi"],
  api: [
    { name: "lines", type: "string[]", default: "[]", description: "The output, one entry per line. Append; replacing it starts over." },
    { name: "live", type: "boolean", default: "false", description: "Blinking caret at the end while the program runs." },
    { name: "v-model:follow", type: "boolean", default: "true", description: "Keeps the end in view as output arrives." },
    { name: "maxHeight", type: "string", default: "''", description: "Height before it scrolls." },
    { name: "label", type: "string", default: "'Terminal output'", description: "Accessible name of the log region." },
    { name: "emptyText", type: "string", default: "''", description: "Shown while there is no output." },
    { name: "createAnsiParser()", type: "() => { feed(chunk), reset() }", default: "—", description: "Stateful SGR parser returning { text, fg, bold, dim } segments." },
  ],
  demos: [
    {
      title: "A live session",
      setup: () => {
        const lines = [
          `${ESC}[2m$ claude -p --output-format stream-json${ESC}[0m`,
          `${ESC}[1;34m▸ Read${ESC}[0m agents/pr_fix.py`,
          `${ESC}[33mwarn:${ESC}[0m thread 3 asks for a design decision`,
          `${ESC}[31merror:${ESC}[0m tests/test_queue.py::test_claim ${ESC}[1mFAILED`,
          `  assert 2 == 3${ESC}[0m`,
          `${ESC}[32m✓${ESC}[0m 41 passed, ${ESC}[31m1 failed${ESC}[0m`,
          `${ESC}[35mmagenta${ESC}[0m and ${ESC}[36mcyan${ESC}[0m keep their own colours`,
        ];
        return { lines, follow: true };
      },
      code: `<UiCheckbox v-model="follow" label="seguir" />
<UiAnsiTerminal :lines="lines" v-model:follow="follow" live max-height="14rem" label="sesion s1" />`,
    },
  ],
};
