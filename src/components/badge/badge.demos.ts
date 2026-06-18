/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot: string;
}

export const badgeDemos: Demo[] = [
  { title: "Neutral", props: { variant: "neutral" }, slot: "Neutral" },
  { title: "Info", props: { variant: "info" }, slot: "Info" },
  { title: "Success", props: { variant: "success" }, slot: "Success" },
  { title: "Warning", props: { variant: "warning" }, slot: "Warning" },
  { title: "Danger", props: { variant: "danger" }, slot: "Danger" },
];
