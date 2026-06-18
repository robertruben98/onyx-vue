import type { SelectOption } from "./Select.vue";

/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
}

const options: SelectOption[] = [
  { value: "vue", label: "Vue" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary" },
  { value: "vt", label: "Vitest", disabled: true },
];

export const selectDemos: Demo[] = [
  { title: "Basic", props: { options } },
  {
    title: "With placeholder",
    props: { options, placeholder: "Pick a tool…" },
  },
  {
    title: "Preselected",
    props: { options, modelValue: "rx" },
  },
  {
    title: "Disabled",
    props: { options, disabled: true },
  },
];
