import type { ComponentDoc } from "../../docs-model";

export const groupHeaderDoc: ComponentDoc = {
  id: "group-header",
  title: "Group Header",
  description:
    "The band that opens a group inside a list: a short name, any marks the group carries, and its long form pushed to the end and dropped on narrow viewports. The interactive form is a real button, not a clickable div.",
  imports: ["UiGroupHeader"],
  api: [
    { name: "name", type: "string", default: "—", description: "Short name identifying the group." },
    { name: "full", type: "string", default: "''", description: "Long form, hidden below 77.5rem." },
    {
      name: "interactive",
      type: "boolean",
      default: "false",
      description: "Renders the band as a button and enables `selected`.",
    },
    { name: "@selected", type: "() => void", default: "—", description: "Emitted when an interactive header is activated." },
    { name: "#marks", type: "slot", default: "—", description: "Counts and risk indicators for the group." },
  ],
  demos: [
    {
      title: "With marks",
      code: `<UiGroupHeader name="supervision-api-payment" full="treew-inc/supervision-api-payment">
  <template #marks>
    <UiTriStateCount :value="4" label="pull requests" />
    <UiTriStateCount :value="2" tone="ok" label="ready to merge" />
    <UiTriStateCount :value="1" tone="danger" label="secrets" />
  </template>
</UiGroupHeader>`,
    },
    {
      title: "Activatable",
      code: `<UiGroupHeader name="core-api" interactive />`,
    },
  ],
};
