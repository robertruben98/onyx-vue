import type { ComponentDoc } from "../../docs-model";

export const stepperDoc: ComponentDoc = {
  id: "stepper",
  title: "Stepper",
  description:
    "The steps of a flow and where each one stands, one row per step so the notes get the width. Every state has a glyph as well as a colour, is spoken to assistive tech, and the step in progress is aria-current.",
  imports: ["UiStepper"],
  api: [
    { name: "steps", type: "{ label, state, meta?, note? }[]", default: "—", description: "The steps in order. state: done | active | warn | error | pending | skipped." },
    { name: "label", type: "string", default: "'Steps'", description: "Accessible name of the list." },
    { name: "stateLabels", type: "Partial<Record<StepState, string>>", default: "{}", description: "Spoken names of the states in another language." },
  ],
  demos: [
    {
      title: "A pr-fix run",
      setup: () => ({
        steps: [
          { label: "checkout de la rama", state: "done", meta: "3s" },
          { label: "leer hilos", state: "done", meta: "11s", note: "4 hilos, 1 de seguridad" },
          { label: "arreglar", state: "warn", note: "1 hilo escalado: pide criterio humano" },
          { label: "tests", state: "active", meta: "1m 20s" },
          { label: "push", state: "pending" },
          { label: "self-review", state: "skipped", note: "desactivado en este repo" },
        ],
      }),
      code: `<UiStepper :steps="steps" label="Fases del run" :state-labels="{ done: 'hecho', active: 'en curso' }" />`,
    },
  ],
};
