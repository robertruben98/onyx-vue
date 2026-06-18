/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** `trigger` slot content (the activator). */
  trigger: string;
  /** `content` slot content (rendered inside the floating dialog). */
  content: string;
}

export const popoverDemos: Demo[] = [
  {
    title: "Basic",
    props: { label: "Quick actions" },
    trigger: `<button type="button">Actions</button>`,
    content: `<p>Choose an action for this item.</p>
<button type="button">Rename</button>
<button type="button">Delete</button>`,
  },
  {
    title: "Placement: top",
    props: { placement: "top", label: "Details" },
    trigger: `<button type="button">Show above</button>`,
    content: `<p>Anchored to the top of the trigger.</p>`,
  },
];
