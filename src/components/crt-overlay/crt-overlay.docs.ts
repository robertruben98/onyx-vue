import type { ComponentDoc } from "../../docs-model";

export const crtOverlayDoc: ComponentDoc = {
  id: "crt-overlay",
  title: "CRT Overlay",
  description:
    "Scanlines and a vignette over the page: what makes a dark view read as a screen being looked at rather than a dark theme. Pure CSS, fixed, aria-hidden and inert to the pointer. The lines multiply instead of painting, so they modulate bright text rather than washing it out.",
  imports: ["UiCrtOverlay"],
  api: [
    {
      name: "scanlines",
      type: "number",
      default: "0.22",
      description:
        "Strength of the lines. 0 turns them off and leaves the vignette.",
    },
    {
      name: "vignette",
      type: "number",
      default: "0.65",
      description:
        "Strength of the vignette. 0 turns it off and leaves the lines.",
    },
  ],
  demos: [
    { title: "Default", code: `<UiCrtOverlay />` },
    { title: "Lines only", code: `<UiCrtOverlay :vignette="0" />` },
  ],
};
