/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot?: string;
}

export const spinnerDemos: Demo[] = [
  { title: "Small", props: { size: "sm" } },
  { title: "Medium", props: { size: "md" } },
  { title: "Large", props: { size: "lg" } },
];
