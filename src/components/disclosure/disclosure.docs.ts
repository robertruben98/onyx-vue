import type { ComponentDoc } from "../../docs-model";

export const disclosureDoc: ComponentDoc = {
  id: "disclosure",
  title: "Disclosure",
  description:
    "A native <details> fold with its open state as a model, so a page that repaints does not close what the reader opened. For long explanations, raw prompts, the table twin of a chart, one item among many.",
  imports: ["UiDisclosure", "UiTag"],
  api: [
    { name: "v-model:open", type: "boolean", default: "false", description: "Open state." },
    { name: "summary", type: "string", default: "''", description: "Summary text." },
    { name: "bordered", type: "boolean", default: "true", description: "Border and surface around the fold." },
    { name: "#summary", type: "slot", default: "—", description: "Rich summary line." },
    { name: "#default", type: "slot", default: "—", description: "What opens." },
  ],
  demos: [
    {
      title: "Bordered, with a rich summary",
      setup: () => ({ open: true }),
      code: `<UiDisclosure v-model:open="open">
  <template #summary><b>#128</b> fix(login): refresh token <UiTag variant="success">3 hilos</UiTag></template>
  The PR's threads go here.
</UiDisclosure>`,
    },
    {
      title: "Plain",
      code: `<UiDisclosure summary="por que cuenta asi" :bordered="false">
  Una carpeta sin marcar deja fuera tambien lo que se clone dentro manana.
</UiDisclosure>`,
    },
  ],
};
