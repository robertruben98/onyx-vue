import type { ComponentDoc } from "../../docs-model";

export const dayTimelineDoc: ComponentDoc = {
  id: "day-timeline",
  title: "Day Timeline",
  description:
    "A horizontal bar for one day, cut into probability bands (free, likely, busy, past, no data) with a \"now\" marker, hour labels and a legend of the bands present. The bar is role=\"img\" and a visually hidden list reads every segment. Colours are the `--ui-band-*` tokens; texts come from the locale catalog.",
  imports: ["UiDayTimeline"],
  api: [
    { name: "start", type: "number", default: "—", description: "First minute shown, e.g. 360 for 06:00." },
    { name: "end", type: "number", default: "—", description: "Last minute shown, e.g. 1440 for 24:00." },
    { name: "segments", type: "{ start: number; end: number; band: 'free' | 'likely' | 'busy' | 'past' | 'nodata'; label?: string }[]", default: "—", description: "Spans of the day, in minutes. Width is proportional to the length. `label` is the text read for the segment (default: range and band name)." },
    { name: "now", type: "number | null", default: "null", description: "Current minute. Outside start..end (or null) shows no marker." },
    { name: "ticks", type: "number[]", default: "every 3 h from start", description: "Minutes that get an HH label." },
    { name: "legend", type: "boolean", default: "true", description: "Legend of the bands present in `segments`." },
  ],
  demos: [
    {
      title: "Baby, Tuesday",
      code: `<UiDayTimeline
  :start="360"
  :end="1440"
  :now="900"
  :segments="[
    { start: 360, end: 720, band: 'past', label: '06:00–12:00 ya pasado' },
    { start: 720, end: 900, band: 'nodata', label: '12:00–15:00 sin datos' },
    { start: 900, end: 1050, band: 'busy', label: '15:00–17:30 suele escribir 38 %' },
    { start: 1050, end: 1200, band: 'likely', label: '17:30–20:00 probablemente libre 78 %' },
    { start: 1200, end: 1440, band: 'free', label: '20:00–24:00 libre 94 %' },
  ]"
/>`,
    },
  ],
};
