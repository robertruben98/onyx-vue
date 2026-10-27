import type { ComponentDoc } from "../../docs-model";

export const runStateDoc: ComponentDoc = {
  id: "run-state",
  title: "Run State",
  description:
    "The seven-outcome scale of a run step. Ships with runStateRank() to sort worst-first and runStateMark() for the [X]/[!]/[ ] tri-state a plain-text export needs. The scale keeps three distinctions a green/red light throws away: defecto (known, documented) is not fallo (broke now), omitido means the step could not conclude rather than passed, and arreglado means a defect moved — the thing a deploy is actually asking about.",
  imports: [
    "UiRunState",
    "runStateRank",
    "runStateMark",
    "runStateNeedsAttention",
  ],
  api: [
    {
      name: "state",
      type: "'ok' | 'arreglado' | 'aviso' | 'defecto' | 'fallo' | 'omitido' | 'info'",
      default: "'info'",
      description:
        "Outcome of the step. The values are the wire format — they arrive verbatim in the runner's NDJSON, so they are not translated.",
    },
    {
      name: "showMark",
      type: "boolean",
      default: "false",
      description:
        "Renders the tri-state mark before the label, matching the plain-text export. Worth turning on in a list people copy out as text.",
    },
    {
      name: "#default",
      type: "slot",
      default: "the state",
      description: "Overrides the visible text — e.g. to append a count.",
    },
    {
      name: "runStateRank(state): number",
      type: "exported function",
      default: "—",
      description:
        "Sort key, worst first: fallo 0, defecto 1, aviso 2, omitido 3, arreglado 4, ok 5, info 6, anything unrecognised 9. omitido sorts ahead of arreglado and ok on purpose: an unanswered question outranks a settled one.",
    },
    {
      name: "runStateMark(state): string",
      type: "exported function",
      default: "—",
      description:
        "The tri-state mark: `[X]` for ok and arreglado, `[!]` for defecto, fallo and aviso, `[ ]` for omitido and info. Three and not two because with two you have to lie about one of them.",
    },
    {
      name: "runStateNeedsAttention(state): boolean",
      type: "exported function",
      default: "—",
      description:
        "True for the states marked `[!]`. What a 'only show me what is wrong' filter should key off, instead of each consumer hard-coding its own list.",
    },
  ],
  demos: [
    {
      title: "Scale",
      code: `<UiRunState state="fallo" />
<UiRunState state="defecto" />
<UiRunState state="aviso" />
<UiRunState state="omitido" />
<UiRunState state="arreglado" />
<UiRunState state="ok" />
<UiRunState state="info" />`,
    },
    {
      title: "With the text-export mark",
      code: `<UiRunState state="defecto" :show-mark="true" />
<UiRunState state="omitido" :show-mark="true" />`,
    },
    {
      title: "With a count",
      code: `<UiRunState state="defecto">defecto · 5</UiRunState>`,
    },
  ],
};
