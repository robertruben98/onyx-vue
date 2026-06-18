/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content (the trigger the tooltip is attached to). */
  slot: string;
}

export const tooltipDemos: Demo[] = [
  {
    title: "Basic",
    props: { text: "Saves your changes" },
    slot: `<button type="button">Save</button>`,
  },
  {
    title: "Placement: bottom",
    props: { text: "Discards the draft", placement: "bottom" },
    slot: `<button type="button">Cancel</button>`,
  },
];
