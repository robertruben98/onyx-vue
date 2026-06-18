/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot: string;
}

export const buttonDemos: Demo[] = [
  { title: "Primary", slot: "Primary" },
  { title: "Secondary", props: { variant: "secondary" }, slot: "Secondary" },
  { title: "Text", props: { variant: "text" }, slot: "Text" },
  { title: "Small", props: { size: "sm" }, slot: "Small" },
  { title: "Large", props: { size: "lg" }, slot: "Large" },
  { title: "Disabled", props: { disabled: true }, slot: "Disabled" },
  { title: "Loading", props: { loading: true }, slot: "Loading" },
];
