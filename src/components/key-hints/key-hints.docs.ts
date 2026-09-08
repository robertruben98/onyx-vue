import type { ComponentDoc } from "../../docs-model";

export const keyHintsDoc: ComponentDoc = {
  id: "key-hints",
  title: "Key Hints",
  description:
    "The shortcut legend of a keyboard-first page. A definition list wearing a single line: the key/meaning pairs are the content, so a screen reader can tell where one ends and the next begins, and the trailing slot takes whatever status the footer also has to carry.",
  imports: ["UiKeyHints"],
  api: [
    {
      name: "hints",
      type: "KeyHint[]",
      default: "—",
      description:
        "The shortcuts, in scanning order. Each is { keys, action }; `keys` is written as typed — `j k`, `enter`, `1-7`.",
    },
    {
      name: "label",
      type: "string",
      default: "'Keyboard shortcuts'",
      description: "Accessible name for the list.",
    },
    {
      name: "#trailing",
      type: "slot",
      default: "—",
      description: "Pushed to the far end: a refresh interval, a timestamp.",
    },
  ],
  demos: [
    {
      title: "A footer legend",
      code: `<UiKeyHints :hints="hints">
  <template #trailing>auto-refresh 60s</template>
</UiKeyHints>`,
      setup: () => ({
        hints: [
          { keys: "j k", action: "mover" },
          { keys: "enter", action: "workflow" },
          { keys: "o", action: "abrir" },
          { keys: "1-7", action: "vistas" },
          { keys: "/", action: "filtrar" },
          { keys: ",", action: "opciones" },
        ],
      }),
    },
  ],
};
