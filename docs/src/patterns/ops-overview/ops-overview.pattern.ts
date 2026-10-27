import type { PatternDoc } from "../types";

export const opsOverviewPattern: PatternDoc = {
  id: "ops-overview",
  title: "Operations overview",
  summary:
    "The on-call view of one production environment: what is on fire, how the whole thing is doing, which service, and what changed today.",
  order: 10,
  frameHeight: 1780,
  page: () => import("./OpsOverviewPage.vue"),
  notes: {
    builtBy: "Claude Code (an AI agent: the time is its wall clock, not a person's)",
    minutes: 16,
    builtOn: "2026-10-04",
    gaps: [
      {
        summary:
          "UiBarChart: with 24 \"HH:00\" category labels in a ~360 px column the axis labels overlapped. Two-digit labels fit (the full hour moved to the tooltip), but the last label is always printed and still collides with the one before it (\"1213\").",
        natives: 0,
      },
      {
        summary:
          "UiDataTable: hideBelow reads the viewport (window.innerWidth), not the table. With the table in a two-column layout it was 449 px wide on a 1000 px viewport and still kept every column, so the services table now takes the full width.",
        natives: 0,
      },
      {
        summary:
          "UiDataTable cells do not clip. When fixed column widths leave no room, a minmax(0, 1fr) track drops to 0 px and its text is painted over the next column instead of being truncated.",
        natives: 0,
      },
      {
        summary:
          "No guidance on UiSparkBars vs UiBarChart. Spark bars have a fixed bar width and print raw values, so 24 hourly points overflowed the column sideways; the docs do not say the component is for short series.",
        natives: 0,
      },
    ],
    takeaway:
      "The only hand-written CSS is page layout: a flex stack, an auto-fit grid and gaps. Onyx has no layout primitive (stack, grid), so every page will repeat these lines. The first check ran at 1440 px only and missed the table collapsing between 960 and 1150 px; the 16 minutes include that fix and a sweep from 640 to 1440 px.",
  },
};
