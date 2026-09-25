import type { ComponentDoc } from "../../docs-model";

export const drawerDoc: ComponentDoc = {
  id: "drawer",
  title: "Drawer",
  description:
    "A modal side sheet for the detail of something picked from a list. It behaves as a dialog: focus moves into it, is trapped while open and returns to the trigger on close; Esc and the backdrop close it. Only the body scrolls, so the heading, the toolbar and the footer stay in reach.",
  imports: ["UiDrawer", "UiButton", "UiTabs", "UiTab"],
  api: [
    { name: "v-model:open", type: "boolean", default: "false", description: "Open state." },
    { name: "heading", type: "string", default: "''", description: "Title; names the dialog." },
    { name: "subheading", type: "string", default: "''", description: "Line under the title." },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name when there is no heading." },
    { name: "closeLabel", type: "string", default: "'Close'", description: "Accessible name of the close button." },
    { name: "closeOnEsc", type: "boolean", default: "true", description: "Whether Esc closes it." },
    { name: "closeOnBackdrop", type: "boolean", default: "true", description: "Whether a backdrop click closes it." },
    { name: "side", type: "'right' | 'left'", default: "'right'", description: "Edge it slides in from." },
    { name: "width", type: "string", default: "token", description: "Sheet width (capped at the viewport)." },
    { name: "#heading", type: "slot", default: "—", description: "Rich content next to the title, e.g. a badge." },
    { name: "#toolbar", type: "slot", default: "—", description: "Fixed row under the header, usually tabs." },
    { name: "#footer", type: "slot", default: "—", description: "Fixed row at the bottom." },
    { name: "@opened / @closed", type: "() => void", default: "—", description: "After opening / closing." },
  ],
  demos: [
    {
      title: "Run detail",
      setup: () => ({ open: false }),
      code: `<UiButton @clicked="open = true">open run</UiButton>
<UiDrawer v-model:open="open" heading="2026-09-25T10:04" subheading="pr-fix · 4 PRs · 12 min" close-label="cerrar">
  <p>The body scrolls on its own; the header and footer stay put.</p>
  <template #footer>
    <span>updated 10:16:02</span>
    <UiButton size="sm" variant="secondary" @clicked="open = false">close</UiButton>
  </template>
</UiDrawer>`,
    },
  ],
};
