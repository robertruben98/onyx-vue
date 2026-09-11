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
      name: "columnGap",
      type: "number",
      default: "16",
      description:
        "Distance between columns in px, and also the glyph size. Larger is sparser and cheaper to paint.",
    },
  ],
  demos: [
    {
      title: "Behind a view",
      code: `<UiDigitalRain />
<UiCrtOverlay />
<main>…</main>`,
    },
    {
      title: "Barely there",
      code: `<UiDigitalRain :opacity="0.1" :column-gap="22" />`,
    },
  ],
};
