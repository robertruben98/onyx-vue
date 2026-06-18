/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot: string;
  /** Named-slot content (e.g. header / footer). */
  slots?: Record<string, string>;
}

export const cardDemos: Demo[] = [
  {
    title: "Basic",
    slot: "A concise summary of the card body content goes here.",
    slots: {
      header: "Project Atlas",
      footer: "Updated 2 hours ago",
    },
  },
  {
    title: "Elevated",
    props: { variant: "elevated" },
    slot: "Elevated surface",
  },
  {
    title: "Outlined",
    props: { variant: "outlined" },
    slot: "Outlined surface",
  },
];
