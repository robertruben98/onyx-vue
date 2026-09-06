import type { ComponentDoc } from "../../docs-model";

export const dialogDoc: ComponentDoc = {
  id: "dialog",
  title: "Dialog",
  description:
    "Modal panel over a backdrop, teleported to `body`, with focus trapped inside and returned to whatever opened it. It is labelled by its heading, or by `ariaLabel` when there is no visible heading.",
  imports: ["UiDialog"],
  api: [
    {
      name: "v-model:open",
      type: "boolean",
      default: "false",
      description: "Open state.",
    },
    {
      name: "heading",
      type: "string",
      default: "''",
      description: "Heading text; labels the dialog via `aria-labelledby`.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name used when there is no heading.",
    },
    {
      name: "closeLabel",
      type: "string",
      default: "'Close'",
      description: "Accessible name for the close button.",
    },
    { name: "closeOnEsc", type: "boolean", default: "true", description: "Esc closes the dialog." },
    {
      name: "closeOnBackdrop",
      type: "boolean",
      default: "true",
      description: "A click on the backdrop closes the dialog.",
    },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Panel width." },
    { name: "@opened / @closed", type: "() => void", default: "—", description: "Attach and detach." },
    { name: "#default", type: "slot", default: "—", description: "Body." },
    { name: "#footer", type: "slot", default: "—", description: "Footer, usually the actions." },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiButton @clicked="open = true">Open dialog</UiButton>
<UiDialog v-model:open="open" heading="Confirm action">
  This action cannot be undone. Do you want to continue?
  <template #footer>
    <UiButton variant="secondary" @clicked="open = false">Cancel</UiButton>
    <UiButton variant="danger" @clicked="open = false">Delete</UiButton>
  </template>
</UiDialog>`,
      setup: () => ({ open: false }),
    },
    {
      title: "Sizes",
      code: `<UiButton variant="secondary" @clicked="size = 'sm'; open = true">sm</UiButton>
<UiButton variant="secondary" @clicked="size = 'md'; open = true">md</UiButton>
<UiButton variant="secondary" @clicked="size = 'lg'; open = true">lg</UiButton>
<UiDialog v-model:open="open" :size="size" heading="Terms">
  A {{ size }} panel. Width is token-driven.
</UiDialog>`,
      setup: () => ({ open: false, size: "md" }),
    },
    {
      title: "Labelled by aria-label",
      description: "No visible heading, still a named dialog.",
      code: `<UiButton @clicked="open = true">Open settings</UiButton>
<UiDialog v-model:open="open" aria-label="Settings">
  A dialog labelled by aria-label instead of a visible heading.
</UiDialog>`,
      setup: () => ({ open: false }),
    },
  ],
};
