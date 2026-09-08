import type { ComponentDoc } from "../../docs-model";

export const checkRowDoc: ComponentDoc = {
  id: "check-row",
  title: "Check Row",
  description:
    "One requirement and where it stands: a state, a name, the evidence, and whatever you can do about it. The same row in `dense` covers the steps of a running job — one vocabulary for both, because a checklist item and a job step are the same row and separate state names are how two identical lists drift apart.",
  imports: ["UiCheckRow", "UiButton"],
  api: [
    {
      name: "state",
      type: "'pending' | 'running' | 'done' | 'failed'",
      default: "'pending'",
      description:
        "Where the row stands. `running` renders a spinner: a static dot claims a settled state, which is exactly what running is not.",
    },
    {
      name: "name",
      type: "string",
      default: "—",
      description: "What is being checked.",
    },
    {
      name: "detail",
      type: "string",
      default: "''",
      description: "The evidence, or what is missing. Truncated, with a tooltip.",
    },
    {
      name: "dense",
      type: "boolean",
      default: "false",
      description:
        "Drops the rule and tightens the row, for a live sequence of steps rather than a checklist.",
    },
    {
      name: "#actions",
      type: "slot",
      default: "—",
      description: "Per-row controls, pushed to the end.",
    },
  ],
  demos: [
    {
      title: "A checklist with actions",
      code: `<UiCheckRow state="done" name="CI pasando" detail="todos los checks en SUCCESS">
  <template #actions><UiButton size="sm" variant="secondary">verificar</UiButton></template>
</UiCheckRow>
<UiCheckRow state="running" name="Sandbox" detail="desplegando la rama…" />
<UiCheckRow state="failed" name="Coverage 100%" detail="faltan 3 lineas en payment.py" />
<UiCheckRow state="pending" name="Commits limpios" detail="sin duplicados ni ruido" />`,
    },
    {
      title: "The steps of a job",
      code: `<UiCheckRow dense state="done" name="fetch" detail="origin/develop" />
<UiCheckRow dense state="done" name="merge" detail="sin conflictos" />
<UiCheckRow dense state="running" name="push" />
<UiCheckRow dense state="pending" name="deploy" />`,
    },
  ],
};
