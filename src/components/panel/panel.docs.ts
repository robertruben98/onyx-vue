import type { ComponentDoc } from "../../docs-model";

export const panelDoc: ComponentDoc = {
  id: "panel",
  title: "Panel",
  description:
    "A titled block of a console page: a Section Header band over a body that runs edge to edge. An empty panel stays on screen and says so, because 'nothing is waiting' is an answer.",
  imports: ["UiPanel", "UiButton", "UiSelect"],
  api: [
    { name: "title", type: "string", default: "—", description: "Panel name, rendered as a heading. Also names the region." },
    { name: "count", type: "string | number | null", default: "null", description: "Beside the title: a number or prose." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "2", description: "Heading level of the title." },
    { name: "quiet", type: "boolean", default: "false", description: "Dims the title." },
    { name: "empty", type: "boolean", default: "false", description: "Replaces the body with emptyText and dims the title." },
    { name: "emptyText", type: "string", default: "'Nothing here.'", description: "What an empty panel says." },
    { name: "padded", type: "boolean", default: "false", description: "Pads the body, for prose instead of a table." },
    { name: "#actions", type: "slot", default: "—", description: "Buttons beside the count." },
    { name: "#controls", type: "slot", default: "—", description: "Controls pushed to the far end." },
    { name: "#footer", type: "slot", default: "—", description: "A band under the body." },
  ],
  demos: [
    {
      title: "With actions and a body",
      code: `<UiPanel title="runs" count="12 · hoy">
  <template #actions><UiButton size="sm" variant="text">recargar</UiButton></template>
  <p style="margin: 0; padding: 12px 16px">the table goes here</p>
</UiPanel>`,
    },
    {
      title: "Empty",
      code: `<UiPanel title="cola pendiente" :count="0" empty empty-text="nada esperando: la cola esta al dia" />`,
    },
    {
      title: "Padded, with a footer",
      code: `<UiPanel title="notas" padded>
  Prose sits inset from the rules.
  <template #footer>actualizado 10:04</template>
</UiPanel>`,
    },
  ],
};
