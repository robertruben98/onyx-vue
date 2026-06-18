import type { RadioOption } from "./RadioGroup.vue";

/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
}

const sizeOptions: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

export const radioGroupDemos: Demo[] = [
  { title: "Basic", props: { label: "Size", options: sizeOptions } },
  {
    title: "Disabled option",
    props: {
      label: "Size",
      options: [...sizeOptions, { label: "X-Large", value: "xl", disabled: true }],
    },
  },
  {
    title: "Disabled group",
    props: { label: "Size", options: sizeOptions, disabled: true },
  },
  {
    title: "Invalid",
    props: { label: "Size", options: sizeOptions, invalid: true },
  },
];
