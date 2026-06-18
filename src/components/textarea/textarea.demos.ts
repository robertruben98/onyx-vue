/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot?: string;
}

export const textareaDemos: Demo[] = [
  {
    title: "Basic",
    props: { label: "Bio", placeholder: "Tell us about yourself…", rows: 3 },
  },
  {
    title: "Invalid",
    props: { label: "Bio", invalid: true, placeholder: "Required" },
  },
  {
    title: "Disabled",
    props: { label: "Bio", disabled: true, modelValue: "Read only" },
  },
];
