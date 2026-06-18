/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content (unused by Switch; kept for shape parity). */
  slot?: string;
}

export const switchDemos: Demo[] = [
  { title: "Basic", props: { label: "Enable notifications" } },
  { title: "Disabled", props: { label: "Disabled", disabled: true } },
];
