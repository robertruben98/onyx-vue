import type { ComponentDoc } from "../../docs-model";

export const skeletonDoc: ComponentDoc = {
  id: "skeleton",
  title: "Skeleton",
  description:
    "A placeholder in the shape of the content that is loading, so the page does not jump when it arrives. Announced once as a status; still for anyone who prefers reduced motion.",
  imports: ["UiSkeleton"],
  api: [
    { name: "variant", type: "'text' | 'block' | 'circle'", default: "'text'", description: "Lines of text, a block (image, chart) or a circle (avatar)." },
    { name: "lines", type: "number", default: "1", description: "Text lines; the last one is shorter." },
    { name: "width", type: "string", default: "''", description: "Width (CSS length); full width by default, 2.5rem for a circle." },
    { name: "height", type: "string", default: "''", description: "Height (CSS length); one line, 8rem for a block, the width for a circle." },
    { name: "label", type: "string", default: "'Loading…'", description: "What screen readers hear. Empty makes it decorative, for when a parent already announces the loading." },
  ],
  demos: [
    { title: "Text", code: `<UiSkeleton :lines="3" label="Loading the description" />` },
    {
      title: "Card",
      code: `<div style="display:flex; gap:12px; align-items:center; width:100%">
  <UiSkeleton variant="circle" label="" />
  <div style="flex:1"><UiSkeleton :lines="2" label="Loading the profile" /></div>
</div>
<UiSkeleton variant="block" height="6rem" label="" />`,
    },
  ],
};
