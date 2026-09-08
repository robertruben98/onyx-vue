import type { ComponentDoc } from "../../docs-model";

export const logLinesDoc: ComponentDoc = {
  id: "log-lines",
  title: "Log Lines",
  description:
    "What was tried and what came back, newest first. Three columns that start in the same place on every line, so the log can be read by running an eye down one of them. An empty log says so in words rather than rendering nothing.",
  imports: ["UiLogLines"],
  api: [
    {
      name: "lines",
      type: "LogLine[]",
      default: "—",
      description:
        "The entries, newest first. Each is { time, action, result?, detail? }; `time` arrives already formatted, because the log does not own a clock.",
    },
    {
      name: "emptyText",
      type: "string",
      default: "'(no activity recorded)'",
      description: "Shown when nothing has happened yet.",
    },
    {
      name: "label",
      type: "string",
      default: "'Activity'",
      description: "Accessible name for the list.",
    },
  ],
  demos: [
    {
      title: "An activity log",
      code: `<UiLogLines :lines="lines" label="workflow activity" />`,
      setup: () => ({
        lines: [
          { time: "19:22:04", action: "approve", result: "ok", detail: "review enviada" },
          { time: "19:21:40", action: "rerun ci", result: "pending", detail: "encolado" },
          { time: "19:18:02", action: "sandbox/start", result: "error", detail: "conflicto en core/" },
        ],
      }),
    },
    {
      title: "Nothing yet",
      code: `<UiLogLines :lines="[]" empty-text="(sin actividad registrada)" />`,
    },
  ],
};
