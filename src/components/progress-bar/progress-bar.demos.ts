/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot: string;
}

export const progressBarDemos: Demo[] = [
  { title: "Determinate (25%)", props: { value: 25, label: "Step 1 of 4" }, slot: "" },
  { title: "Determinate (70%)", props: { value: 70, label: "Upload" }, slot: "" },
  {
    title: "Indeterminate",
    props: { indeterminate: true, label: "Loading" },
    slot: "",
  },
];
