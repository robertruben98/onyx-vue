import type { ComponentDoc } from "../../docs-model";

export const weekBlocksDoc: ComponentDoc = {
  id: "week-blocks",
  category: "Data display",
  title: "Week Blocks",
  description:
    "A work week of time blocks: one column per day with blocks positioned by time over an hour grid, or, in a narrow container, one list per day with rows \"09:00–10:30 · title · detail\". A day without blocks shows its `note`. Fills are the `--ui-week-block-*` tokens; the label comes from the locale catalog.",
  imports: ["UiWeekBlocks"],
  api: [
    { name: "days", type: "{ key: string; label: string; blocks: { start: number; end: number; title: string; detail?: string; tone?: 'success' | 'neutral' }[]; note?: string }[]", default: "—", description: "One entry per column. Block times are minutes of the day; `tone` defaults to success; `note` shows when the day has no blocks." },
    { name: "start", type: "number", default: "480", description: "First minute shown (08:00)." },
    { name: "end", type: "number", default: "1200", description: "Last minute shown (20:00)." },
    { name: "today", type: "string", default: "—", description: "Key of today's column: highlighted and aria-current=\"date\"." },
    { name: "layout", type: "'auto' | 'columns' | 'list'", default: "'auto'", description: "`auto` shows the list when the container is narrower than 640 px (ResizeObserver; columns when it cannot measure)." },
  ],
  demos: [
    {
      title: "Focus blocks, Monday to Friday",
      code: `<UiWeekBlocks
  today="tue"
  :days="[
    { key: 'mon', label: 'Lun', blocks: [], note: 'Sin huecos fiables' },
    { key: 'tue', label: 'Mar', blocks: [{ start: 540, end: 630, title: 'Foco', detail: 'libre ≥ 82 % · 21 días' }] },
    { key: 'wed', label: 'Mié', blocks: [{ start: 600, end: 720, title: 'Foco', detail: 'libre ≥ 85 % · 18 días' }] },
    { key: 'thu', label: 'Jue', blocks: [{ start: 1080, end: 1200, title: 'Foco', detail: 'libre ≥ 80 % · 21 días', tone: 'neutral' }] },
    { key: 'fri', label: 'Vie', blocks: [], note: 'Sin datos' },
  ]"
/>`,
    },
  ],
};
