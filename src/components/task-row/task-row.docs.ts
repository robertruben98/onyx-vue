import type { ComponentDoc } from "../../docs-model";

export const taskRowDoc: ComponentDoc = {
  id: "task-row",
  title: "Task Row",
  description:
    "A to-do row: a checkbox labelled with the task text and an optional meta line. Ticking emits `toggle` with the next state; the parent updates `done` (optimistically) and sets `busy` while the request runs, which disables the checkbox and shows a spinner. Done rows are struck through and dimmed to `--ui-task-row-done-text`, which keeps 4.5:1 text contrast. The whole row is at least 44 px tall.",
  imports: ["UiTaskRow"],
  api: [
    { name: "text", type: "string", default: "—", description: "Task text; it is the checkbox's accessible name. Long text wraps." },
    { name: "done", type: "boolean", default: "false", description: "Done: text struck through and dimmed." },
    { name: "meta", type: "string", default: "—", description: "Secondary line under the text, linked to the checkbox with aria-describedby." },
    { name: "busy", type: "boolean", default: "false", description: "Request in flight: checkbox disabled, spinner shown, aria-busy set." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the checkbox." },
    { name: "@toggle", type: "event: boolean", default: "—", description: "Event: the checkbox was ticked (true) or unticked (false). Never emitted while busy or disabled." },
  ],
  demos: [
    {
      title: "Open, done and busy",
      code: `<UiTaskRow text="mandame por whatsapp el valor de X" meta="Robert · OpenID-Payment-Seguridad · hace 2 h" @toggle="done = $event" :done="done" />
<UiTaskRow text="Revisar el informe" meta="Robert · hace 1 d" done />
<UiTaskRow text="Guardando…" busy />`,
    },
  ],
};
