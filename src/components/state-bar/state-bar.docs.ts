import type { ComponentDoc } from "../../docs-model";

export const stateBarDoc: ComponentDoc = {
  id: "state-bar",
  title: "State Bar",
  description:
    "A run's progress and its composition in one track. UiProgressBar answers 'how far along'; this also answers 'how is it going', which is what a run view is really asked. Segments are ordered worst-first from runStateRank, so a red sliver sits at the left edge instead of hiding between two greens, and the gap at the right is what is still pending. The legend doubles as the filter, so counts, segments and selection cannot disagree.",
  imports: ["UiStateBar"],
  api: [
    {
      name: "counts",
      type: "Partial<Record<RunState, number>>",
      default: "—",
      description: "How many steps ended in each state. States with 0 are dropped.",
    },
    {
      name: "total",
      type: "number",
      default: "sum of counts",
      description:
        "Steps the run will have when it finishes. Anything above the sum is drawn as the pending gap; the default describes a run that is over.",
    },
    {
      name: "interactive",
      type: "boolean",
      default: "false",
      description: "Turns the legend into filter buttons and emits `selected`.",
    },
    {
      name: "selected",
      type: "RunState | null",
      default: "null",
      description: "Which entry the legend shows as active.",
    },
    {
      name: "showLegend",
      type: "boolean",
      default: "true",
      description: "Renders the counts under the bar.",
    },
    {
      name: "@selected",
      type: "event: RunState | null",
      default: "—",
      description:
        "A legend entry was activated. Emits null when the active one is clicked again, so the same handler clears the filter.",
    },
  ],
  demos: [
    {
      title: "A run in flight",
      code: `<UiStateBar
  :counts="{ ok: 19, arreglado: 2, aviso: 3, defecto: 5, omitido: 5, info: 1 }"
  :total="40"
/>`,
    },
    {
      title: "Legend as filter",
      code: `<UiStateBar
  :counts="counts"
  :interactive="true"
  :selected="filtro"
  @selected="filtro = $event"
/>`,
    },
  ],
};
