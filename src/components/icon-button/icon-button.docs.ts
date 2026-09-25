import type { ComponentDoc } from "../../docs-model";

export const iconButtonDoc: ComponentDoc = {
  id: "icon-button",
  title: "Icon Button",
  description:
    "A button that is only a glyph. The label is required: it is the accessible name and the tooltip, so mouse and screen reader get the same word. Pass an SVG path for a 24×24 stroke icon, or use the slot for any other glyph. Pairs with Action Cluster for row actions.",
  imports: ["UiIconButton", "UiActionCluster"],
  api: [
    { name: "label", type: "string", default: "—", description: "Accessible name and tooltip." },
    { name: "icon", type: "string", default: "''", description: "`d` of a 24×24 stroke icon." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "Control size." },
    { name: "disabled", type: "boolean", default: "false", description: "Never emits clicked while disabled." },
    { name: "pressed", type: "boolean | null", default: "null", description: "Toggle state as aria-pressed; null for a plain button." },
    { name: "#default", type: "slot", default: "—", description: "Glyph used when there is no icon path." },
    { name: "@clicked", type: "(event: MouseEvent) => void", default: "—", description: "Activation." },
  ],
  demos: [
    {
      title: "Row actions",
      code: `<UiActionCluster label="acciones de api-core">
  <UiIconButton label="abrir" size="sm" icon="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  <UiIconButton label="parar" size="sm" icon="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
</UiActionCluster>`,
    },
    {
      title: "A glyph from the slot",
      code: `<UiIconButton label="informacion del agente">i</UiIconButton>`,
    },
  ],
};
