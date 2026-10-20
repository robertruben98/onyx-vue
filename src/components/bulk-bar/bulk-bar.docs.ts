import type { ComponentDoc } from "../../docs-model";

export const bulkBarDoc: ComponentDoc = {
  id: "bulk-bar",
  title: "Bulk Bar",
  description:
    "What is selected and what can be done to it, in two phases. Passing a `question` swaps the actions for confirm and cancel and moves the bar onto the warning surface — the phase that acts on N rows at once should not look like the phase that only offers to. At zero selected the bar does not render.",
  imports: ["UiBulkBar", "UiButton"],
  api: [
    {
      name: "count",
      type: "number",
      default: "—",
      description: "How many rows are selected. At zero the bar does not render.",
    },
    {
      name: "noun",
      type: "[string, string]",
      default: "['selected', 'selected']",
      description: "What is being counted, singular and plural.",
    },
    {
      name: "question",
      type: "string",
      default: "''",
      description:
        "Turns the bar into its confirm phase. Absent, the bar offers its actions.",
    },
    {
      name: "confirmLabel",
      type: "string",
      default: "'confirm'",
      description: "Label of the confirm control.",
    },
    {
      name: "cancelLabel",
      type: "string",
      default: "'cancel'",
      description: "Label of the cancel control.",
    },
    {
      name: "#actions",
      type: "slot",
      default: "—",
      description:
        "The action controls, shown only outside the confirm phase. The consumer owns them: it is the one that knows how many of the selected rows each action can actually touch.",
    },
    {
      name: "@confirmed",
      type: "() => void",
      default: "—",
      description: "The confirm control was activated.",
    },
    {
      name: "@cancelled",
      type: "() => void",
      default: "—",
      description: "The confirm phase was abandoned.",
    },
  ],
  demos: [
    {
      title: "Offering actions",
      code: `<UiBulkBar :count="4" :noun="['marcada', 'marcadas']">
  <template #actions>
    <UiButton size="sm" variant="secondary">approve (3)</UiButton>
    <UiButton size="sm" variant="secondary">rerun ci</UiButton>
    <UiButton size="sm" variant="danger">desmarcar</UiButton>
  </template>
</UiBulkBar>`,
    },
    {
      title: "Asking first",
      description:
        "The count stays on screen next to the question: what you need before confirming is how many rows this lands on.",
      code: `<UiBulkBar
  :count="4"
  :noun="['marcada', 'marcadas']"
  question="¿approve en 3 de 4?"
  confirm-label="confirmar"
  cancel-label="cancelar"
/>`,
    },
  ],
};
