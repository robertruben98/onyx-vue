import type { ComponentDoc } from "../../docs-model";

export const emptyStateDoc: ComponentDoc = {
  id: "empty-state",
  title: "Empty State",
  description:
    "Placeholder for empty and zero-data views: a decorative visual, structured copy, and up to two actions. Ported from the Angular library, with the actions built on UiButton and the description wired only when one is actually given.",
  imports: ["UiEmptyState"],
  api: [
    {
      name: "role",
      type: "'region' | 'status'",
      default: "'region'",
      description: "Use status when the empty state appears dynamically and should be announced.",
    },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name that overrides labelling by the title slot." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables both actions and marks the root aria-disabled." },
    { name: "@primaryAction", type: "(event: MouseEvent) => void", default: "—", description: "Emitted when the primary action is activated." },
    { name: "@secondaryAction", type: "(event: MouseEvent) => void", default: "—", description: "Emitted when the secondary action is activated." },
    { name: "#title", type: "slot", default: "—", description: "Required unless ariaLabel is given." },
    { name: "#description", type: "slot", default: "—", description: "Optional. Wired to aria-describedby only when filled." },
    { name: "#icon / #illustration", type: "slot", default: "—", description: "Decorative visual, hidden from assistive technology." },
    { name: "#primaryAction / #secondaryAction", type: "slot", default: "—", description: "Button labels. The button itself is rendered for you." },
  ],
  demos: [
    {
      title: "Copy only",
      code: `<UiEmptyState>
  <template #title>Sin issues asignadas</template>
  <template #description>Nada que revisar hoy.</template>
</UiEmptyState>`,
    },
    {
      title: "With actions",
      code: `<UiEmptyState>
  <template #title>Alertas en modo a demanda</template>
  <template #description>No se han pedido a GitHub. Esto no es "nada abierto", es "no se sabe".</template>
  <template #primaryAction>Cargar ahora</template>
  <template #secondaryAction>Opciones</template>
</UiEmptyState>`,
    },
  ],
};
