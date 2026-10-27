import type { ComponentDoc } from "../../docs-model";

export const sliderDoc: ComponentDoc = {
  id: "slider",
  title: "Slider",
  description:
    "A value picked along a range: a playback speed, a threshold, a number of replicas. A native range input underneath, so keys, touch and screen readers work as the browser does them.",
  imports: ["UiSlider"],
  api: [
    { name: "v-model", type: "number", default: "0", description: "The value." },
    { name: "min", type: "number", default: "0", description: "Lowest value." },
    { name: "max", type: "number", default: "100", description: "Highest value." },
    { name: "step", type: "number", default: "1", description: "Distance between values." },
    { name: "label", type: "string", default: "''", description: "Visible label." },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name when there is no visible label." },
    { name: "showValue", type: "boolean", default: "false", description: "Shows the current value next to the label." },
    { name: "valueText", type: "(value: number) => string", default: "—", description: "Turns the value into words, shown with `showValue` and read as `aria-valuetext`." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state." },
    { name: "@valueChanged", type: "(value: number) => void", default: "—", description: "Emitted while dragging and on every key press, in addition to `v-model`." },
  ],
  demos: [
    {
      title: "With its value",
      code: `<UiSlider v-model="volume" label="Volume" show-value :value-text="(v) => v + ' %'" />`,
      setup: () => ({ volume: 40 }),
    },
    {
      title: "Steps",
      code: `<UiSlider v-model="speed" :min="0.5" :max="4" :step="0.5" label="Playback speed" show-value :value-text="(v) => v + '×'" />`,
      setup: () => ({ speed: 1 }),
    },
    { title: "Disabled", code: `<UiSlider :model-value="30" aria-label="Locked" disabled />` },
  ],
};
