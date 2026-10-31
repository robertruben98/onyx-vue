import type { ComponentDoc } from "../../docs-model";

export const panelDoc: ComponentDoc = {
  id: "panel",
  title: "Panel",
  description:
    "A titled block of a console page: a Section Header band over a body that runs edge to edge. An empty panel stays on screen and says so, because 'nothing is waiting' is an answer. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiPanel", "UiButton", "UiSelect"],
  api: [
    { name: "title", type: "string", default: "—", description: "Panel name, rendered as a heading. The region is named by that heading (`aria-labelledby`)." },
    { name: "count", type: "string | number | null", default: "null", description: "Beside the title: a number or prose." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "2", description: "Heading level of the title." },
    { name: "quiet", type: "boolean", default: "false", description: "Dims the title." },
    { name: "empty", type: "boolean", default: "false", description: "Replaces the body with emptyText and dims the title." },
    { name: "emptyText", type: "string", default: "'Nothing here.'", description: "What an empty panel says." },
    { name: "padded", type: "boolean", default: "false", description: "Pads the body, for prose instead of a table." },
    { name: "variant", type: "'default' | 'plain' | 'card'", default: "'default'", description: "`default`: a header band with a rule and an unpadded body (tables run edge to edge; `padded` for prose). `plain`: no rule, more space, header and body on the same inset. `card`: a surface with radius, header and body on the same inset." },
    { name: "landmark", type: "boolean", default: "true", description: "A `<section>` region landmark named by the heading. `false` renders a plain `<div>`: use it when a page has many panels, so the landmark list stays short." },
    { name: "#actions", type: "slot", default: "—", description: "Buttons beside the count." },
    { name: "#controls", type: "slot", default: "—", description: "Controls pushed to the far end." },
    { name: "#footer", type: "slot", default: "—", description: "A band under the body." },
    { name: "#default", type: "slot", default: "—", description: "The panel's body." },
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
    {
      title: "Plain and card",
      description: "The heading and the body start on the same line in both.",
      code: `<UiPanel title="Your exam" variant="plain" :landmark="false">
  <p style="margin: 0">LanguageCert B1 Achiever, Monday 26 October.</p>
</UiPanel>
<UiPanel title="Activity" variant="card" :landmark="false">
  <p style="margin: 0">128 answers, 42 marked by the AI.</p>
</UiPanel>`,
    },
  ],
};
