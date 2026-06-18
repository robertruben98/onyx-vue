/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot?: string;
}

export const dividerDemos: Demo[] = [
  { title: "Basic", props: {} },
  { title: "Vertical", props: { orientation: "vertical" } },
  { title: "With label", props: { label: "OR" } },
];
