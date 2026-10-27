import type { ComponentDoc } from "../../docs-model";

export const digitalRainDoc: ComponentDoc = {
  id: "digital-rain",
  title: "Digital Rain",
  description:
    "The falling-glyph backdrop of the matrix preset, on a canvas. Decoration only: fixed, behind the page, aria-hidden, and inert to the pointer. It reads its colours from the live theme tokens, so it follows whatever preset is on the root instead of hard-coding a green, and it renders nothing at all when the viewer asks for reduced motion.",
  imports: ["UiDigitalRain"],
  api: [
    {
      name: "opacity",
      type: "number",
      default: "0.22",
      description:
        "How visible the rain is. Keep it low — above ~0.3 it starts competing with the text it sits behind.",
    },
    {
      name: "pauseWhenUnfocused",
      type: "boolean",
      default: "true",
      description:
        "Stop painting while the window has no focus, not only while the tab is hidden. The last frame stays on the canvas and the rain moves again on focus. A backdrop left open on a second monitor otherwise paints all day.",
    },
    {
      name: "columnGap",
      type: "number",
      default: "16",
      description:
        "Distance between columns in px, and also the glyph size. Larger is sparser and cheaper to paint.",
    },
    { name: "label", type: "string", default: "''", description: "Accessible name. Empty by default: the rain is decoration and stays out of the accessibility tree." },
  ],
  demos: [
    {
      title: "Behind a view",
      description:
        "The rain and the glass sit behind and in front of the page; the view itself is whatever you render (here a stand-in, since this page already has its own main landmark).",
      code: `<UiDigitalRain />
<UiCrtOverlay />
<div>…</div>`,
    },
    {
      title: "Barely there",
      code: `<UiDigitalRain :opacity="0.1" :column-gap="22" />`,
    },
  ],
};
