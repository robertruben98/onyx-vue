/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content (unused for checkbox; label is a prop). */
  slot?: string;
}

export const checkboxDemos: Demo[] = [
  { title: "Basic", props: { label: "Accept terms" } },
  {
    title: "Indeterminate",
    props: { label: "Indeterminate", indeterminate: true },
  },
  { title: "Disabled", props: { label: "Disabled", disabled: true } },
  { title: "Invalid", props: { label: "Invalid", invalid: true } },
  { title: "Small", props: { label: "Small", size: "sm" } },
  { title: "Large", props: { label: "Large", size: "lg" } },
];
