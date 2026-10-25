import type { ComponentDoc } from "../../docs-model";

export const progressRingDoc: ComponentDoc = {
  id: "progress-ring",
  title: "Progress Ring",
  description:
    "Circular progress for a level, a daily goal or exam readiness. A progressbar with aria-valuenow/min/max (role=img when indeterminate), sizes from 40 to 128px or any px, five tones or the brand gradient, and a centre for the percentage or your own content. The arc animates to its value, and stands still under reduced motion.",
  imports: ["UiProgressRing"],
  api: [
    { name: "value", type: "number", default: "0", description: "Current value, clamped to 0…max." },
    { name: "max", type: "number", default: "100", description: "Value of a full ring." },
    { name: "size", type: "'sm' | 'md' | 'lg' | 'xl' | number", default: "'md'", description: "40, 64, 96 or 128px (tokens --ui-progress-ring-size-*), or a number of px." },
    { name: "thickness", type: "number", default: "12 (sm) / 10", description: "Stroke width as a percentage of the diameter." },
    { name: "tone", type: "'primary' | 'success' | 'warning' | 'danger' | 'neutral'", default: "'primary'", description: "Colour of the arc. Every tone reaches 3:1 against the surface and the track." },
    { name: "gradient", type: "boolean", default: "false", description: "Paints the arc from --ui-progress-ring-gradient-from to -to (pocket: indigo to violet). Overrides tone." },
    { name: "label", type: "string", default: "''", description: "Accessible name." },
    { name: "valueText", type: "string", default: "undefined", description: "aria-valuetext, when the number alone says too little (\"56 of 100 XP\")." },
    { name: "indeterminate", type: "boolean", default: "false", description: "Unknown progress: role=img named by label, a spinning quarter arc (still under reduced motion)." },
    { name: "showValue", type: "boolean", default: "false", description: "Shows the rounded percentage in the centre." },
    { name: "#default", type: "slot", default: "—", description: "Custom centre content (a level number, an icon). Drawn, not read: put what matters in label/valueText." },
  ],
  demos: [
    {
      title: "Sizes",
      code: `<UiProgressRing size="sm" :value="30" label="Daily goal" />
<UiProgressRing :value="55" label="Daily goal" show-value />
<UiProgressRing size="lg" :value="72" label="Readiness" show-value />
<UiProgressRing size="xl" :value="90" label="Readiness" show-value />`,
    },
    {
      title: "Tones and gradient",
      code: `<UiProgressRing :value="80" tone="success" label="Reading" show-value />
<UiProgressRing :value="45" tone="warning" label="Writing" show-value />
<UiProgressRing :value="20" tone="danger" label="Speaking" show-value />
<UiProgressRing :value="64" gradient label="Level" show-value />`,
    },
    {
      title: "Custom centre",
      description: "A level number with its unit, as the English trainer's home card shows it.",
      code: `<UiProgressRing size="lg" :value="34" :max="50" gradient label="Level 7" value-text="34 of 50 XP to level 8">
  <strong style="font-size: 1.4em">7</strong>
</UiProgressRing>`,
    },
    { title: "Indeterminate", code: `<UiProgressRing indeterminate label="Loading your progress" />` },
  ],
};
