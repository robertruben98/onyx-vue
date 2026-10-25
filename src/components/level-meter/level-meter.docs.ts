import type { ComponentDoc } from "../../docs-model";

export const levelMeterDoc: ComponentDoc = {
  id: "level-meter",
  title: "Level Meter",
  description:
    "A live input level (a microphone while recording) as a row of bars that rise with the voice and stay at a low floor in silence. Smoothed with a short transition, without it under reduced motion. Drawn in currentColor, so it fits inside UiRecordButton's #meter slot.",
  imports: ["UiLevelMeter", "UiRecordButton"],
  api: [
    { name: "level", type: "number", default: "0", description: "Input level from 0 (silence) to 1 (loudest); clamped. Update it as often as you like (e.g. every animation frame)." },
    { name: "bars", type: "number", default: "5", description: "Number of bars, at least 3. The middle ones weigh more, like a wave." },
    { name: "label", type: "string", default: "undefined", description: "Accessible name (role=img). Unset, the meter is aria-hidden. The value is never announced: it changes too often." },
  ],
  demos: [
    {
      title: "Levels",
      code: `<UiLevelMeter :level="0" />
<UiLevelMeter :level="0.35" />
<UiLevelMeter :level="0.8" :bars="7" />`,
    },
    {
      title: "Inside the record button",
      code: `<UiRecordButton label="Record my answer" recording-label="Stop" recording>
  <template #meter><UiLevelMeter :level="0.6" /></template>
</UiRecordButton>`,
    },
  ],
};
