/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot (body) content. */
  slot: string;
  /** Named `footer` slot content. */
  footer?: string;
}

export const dialogDemos: Demo[] = [
  {
    title: "Basic",
    description: "Heading, body and a footer with actions.",
    props: { open: true, heading: "Confirm action" },
    slot: "This action cannot be undone. Do you want to continue?",
    footer: "Cancel / Confirm",
  },
  {
    title: "Sizes",
    description: "Panel width is token-driven via the size prop.",
    props: { open: true, heading: "Terms", size: "lg" },
    slot: "A wider panel for long-form content.",
  },
  {
    title: "Aria label only",
    description: "No heading; named via ariaLabel.",
    props: { open: true, ariaLabel: "Settings" },
    slot: "A dialog labelled by aria-label instead of a visible heading.",
  },
];
