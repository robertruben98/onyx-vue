import type { ComponentDoc } from "../../docs-model";

export const fabDoc: ComponentDoc = {
  id: "fab",
  category: "Actions",
  title: "Fab",
  description:
    "Floating action button: the one action that must stay at hand on a long page. Fixed to a bottom corner. Extended it shows the glyph and the label; with collapse-on-scroll it shrinks to a round glyph while the page scrolls down, so it stops covering the buttons on the right edge of the content, and grows back at the top or when scrolling up. The label is the accessible name in both shapes. Offset it above a bottom bar with --ui-fab-bottom.",
  imports: ["UiFab"],
  api: [
    { name: "label", type: "string", default: "—", description: "Visible label (extended) and accessible name." },
    { name: "icon", type: "string", default: "''", description: "`d` of a 24×24 stroke icon." },
    { name: "extended", type: "boolean", default: "true", description: "Shows the label; false is always the round button." },
    { name: "collapseOnScroll", type: "boolean", default: "false", description: "Round while scrolling down, extended at the top or scrolling up." },
    { name: "hideOnScroll", type: "boolean", default: "false", description: "Slides out while scrolling down; back scrolling up, at the top or at the end of the page, and on focus." },
    { name: "placement", type: "'end' | 'start'", default: "'end'", description: "Bottom corner it sits in." },
    { name: "contained", type: "boolean", default: "false", description: "Anchors to the nearest positioned ancestor instead of the viewport, for a demo or a framed preview." },
    { name: "#icon", type: "slot", default: "—", description: "Glyph used instead of the icon path." },
    { name: "@clicked", type: "(event: MouseEvent) => void", default: "—", description: "Activation." },
  ],
  demos: [
    {
      title: "Ask, collapsing on scroll",
      description: "The demos use `contained` so the button stays inside its box; in an app it is fixed to the viewport.",
      code: `<div style="position: relative; width: 100%; height: 6rem"><UiFab contained label="Ask" collapse-on-scroll icon="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2zM18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></div>`,
    },
    {
      title: "Round",
      code: `<div style="position: relative; width: 100%; height: 6rem"><UiFab contained label="New note" :extended="false" icon="M12 5v14M5 12h14" /></div>`,
    },
  ],
};
