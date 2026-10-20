import type { ComponentDoc } from "../../docs-model";

export const actionClusterDoc: ComponentDoc = {
  id: "action-cluster",
  title: "Action Cluster",
  description:
    "The actions at the end of a dense list row. Dimmed until hovered or focused, so twenty rows of icons do not compete with the data beside them — and revealed on focus-within, so a keyboard can still reach them.",
  imports: ["UiActionCluster"],
  api: [
    { name: "label", type: "string", default: "—", description: "Accessible name for the group." },
    { name: "quiet", type: "boolean", default: "true", description: "Dim until hovered or focused." },
    { name: "revealed", type: "boolean", default: "false", description: "Force the revealed state, e.g. for the selected row." },
    { name: "#default", type: "slot", default: "—", description: "The action buttons." },
  ],
  demos: [
    {
      title: "In a row",
      description:
        "Tab into the cluster to see it reveal without a mouse. Revealing on the whole row's hover needs one line from the consumer, since CSS cannot select on an ancestor's hover: .fila:hover .ui-action-cluster { opacity: 1 }",
      code: `<UiActionCluster label="acciones de la fila">
  <UiButton variant="text" size="sm">wf</UiButton>
  <UiButton variant="text" size="sm">appr</UiButton>
  <UiButton variant="text" size="sm">ci</UiButton>
</UiActionCluster>`,
    },
    {
      title: "Revealed",
      code: `<UiActionCluster label="acciones de la fila" revealed>
  <UiButton variant="text" size="sm">wf</UiButton>
  <UiButton variant="text" size="sm">appr</UiButton>
</UiActionCluster>`,
    },
  ],
};
