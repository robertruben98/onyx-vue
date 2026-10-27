# Replay timeline — design

**Date:** 2026-09-08
**Repo:** `onyx-vue` (this repo only — no React or Angular parity in this effort)
**Consumer:** `robertdev/control-panel/web`
**Status:** approved, pending implementation plan

## Problem

`control-panel/web/src/articles/SimulationChart.vue` is 424 lines that answer one question:
what changes if we apply this Cloudflare rule? It replays 8 824 863 real requests as two
lanes on a shared time axis — today's untouched traffic above, the same traffic with the rule
applied below — with transport controls and a figures table that accumulates as the playhead
moves.

Nothing about that shape is specific to Cloudflare. The next before/after — a cache rule, an
nginx change, two uwsgi configurations — needs the same component and would copy those 424
lines. The library already carries the small end of this vocabulary (`spark-bars`,
`heat-strip`, `block-meter`, `metric-chip`); it has no component that plays a series back.

This design promotes the reusable half into `replay-timeline` and leaves the domain half in
the app.

## Non-goals

- **React and Angular parity.** `onyx-ng` has 34 components and `onyx-react` has 22, and
  neither carries a visualization primitive at all — no `spark-bars`, no `heat-strip`. Neither
  has a consumer asking for this. Divergence is accepted, exactly as in the
  2026-09-06 console-components design.
- **A charting library.** No axes-and-legends abstraction, no pluggable scales, no zoom, no
  tooltips-on-hover. Three mark kinds cover the two known cases; a fourth is added when a
  third case needs it, not before.
- **Generating the data.** `simulate.py` and its 8-minute replay stay in the consumer. The
  component receives arrays.
- **Owning the figures table.** The accumulated numbers are domain prose ("peticiones
  legítimas denegadas"). The component exposes the cursor and the maths; the consumer renders
  the table.

## Constraints discovered in the ground

Each verified against the working tree, not assumed.

**Every one of the 43 components is tested in jsdom with `@testing-library/vue` plus
`jest-axe`.** `SparkBars.test.ts` asserts on `.ui-spark-bars__fill` style heights and runs an
axe audit. In jsdom `HTMLCanvasElement.getContext("2d")` returns `null`, so a canvas component
could neither be asserted nor audited there. **This is the constraint that decides the
rendering, and it is why the component is SVG.** The existing chart is canvas and its painting
is only ever verified by a Playwright pixel count in the consumer.

**The tone vocabulary is `neutral | info | success | warning | danger`.** Measured across
`alert` and `severity-badge`. There is no `accent` tone — the first draft of this API proposed
one.

**Component tokens live in `src/styles/tokens.css`**, one `--ui-<component>-*` block per
component (`--ui-spark-bars-gap`, `--ui-spark-bars-height`, …), and the `.scss` references
only semantic or component tokens. `spark-bars.scss` says so in its header.

**The viz primitives and the styles are commented in English**, while `docs-model.ts` and the
commit subjects are in Spanish. This component follows its neighbours — `spark-bars` and
`heat-strip` — so its prop docs, `.scss` header and `.docs.ts` are English. `.docs.ts` renders
the public documentation page, which is English throughout.

**`feat/console-lists` is 71 commits ahead of `origin/master` and unpushed.** The work branches
off it, not off master.

**The only consumer is `control-panel/web`**, which aliases `@onyx/vue` straight to
`src/index.ts`. There is no published package, so the API can be shaped without a deprecation
path — and there is no second consumer to validate it against, which is an argument for the
narrow surface in the Non-goals.

## The boundary

| In `onyx-vue` | In `control-panel` |
|---|---|
| Lanes sharing an X axis and a vertical scale | Fetching `simulation.json` |
| Playhead, transport, scrubber, speed | Mapping variant → lane |
| Legend built from the mark definitions | Spanish labels and domain wording |
| Downsampling, prefix sums, scales (pure functions) | The figures table |
| Accessible name and table fallback | Which rows the table shows |

`SimulationChart.vue` goes from 424 lines to roughly 90. That reduction is the test of whether
the boundary is in the right place.

## API

```ts
/** One scenario, aligned to the shared time axis. */
export interface ReplayLane {
  /** Stable identity, used for keying and for the accessible summary. */
  key: string;
  /** Shown above the lane. */
  label: string;
  /**
   * One array per mark key.
   *
   * Every array in every lane should be the same length. When they are not,
   * the component renders the shortest length across all of them and warns
   * once in dev — a lane silently drawn shorter than its neighbour is a false
   * comparison, and throwing would take down a page over a data problem.
   */
  series: Record<string, number[]>;
}

export type ReplayMarkKind = "area" | "stack" | "tick";

/** How one series is drawn, in every lane. */
export interface ReplayMark {
  /** Key inside `ReplayLane.series`. */
  key: string;
  kind: ReplayMarkKind;
  /** Legend text and accessible name. */
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  /**
   * `"own"` scales the mark to its own peak — for context series whose
   * magnitude dwarfs everything else. `"shared"` (default) puts the mark on
   * the scale shared by every other `shared` mark, which is what makes two
   * lanes comparable.
   */
  scale?: "own" | "shared";
}
```

Props:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lanes` | `ReplayLane[]` | — | Two or more. One lane is allowed and degrades to a single strip. |
| `marks` | `ReplayMark[]` | — | Applied to every lane. |
| `bucketSeconds` | `number` | — | Real seconds per point, for the clock and the axis. |
| `start` | `string` | — | ISO timestamp of point 0. |
| `cursor` | `number` | `0` | `v-model:cursor`. Index, not time. |
| `playing` | `boolean` | `false` | `v-model:playing`. |
| `speed` | `number` | `12` | Points advanced per frame. |
| `laneHeight` | `number` | `104` | Pixels. |
| `transport` | `boolean` | `true` | Hides the controls when the consumer drives the cursor. |
| `label` | `string` | `""` | What the series measures, for the accessible name. |

Emits: `update:cursor`, `update:playing`, `finished`.

`finished` fires once when the cursor reaches the last point, and the component sets
`playing` to `false` at the same time — a transport that says "playing" at the end of the
tape is lying. Pressing play at the end restarts from 0.

Slot: `#figures` with `{ cursor }` — where the consumer's table goes.

Exported pure functions (the reusable maths, importable without the component):

```ts
/** Prefix sums per series, so an accumulated total is an array read. */
export function accumulate(series: Record<string, number[]>): Record<string, number[]>;
/** Accumulated value of one series up to and including `cursor`. */
export function totalAt(prefix: number[], cursor: number): number;
/**
 * Reduce a series to at most `width` points, keeping peaks.
 *
 * `width` is in output points (pixels, in practice). A series already shorter
 * than `width` comes back untouched — never padded, never interpolated.
 */
export function downsample(series: number[], width: number): number[];
/** Shared vertical scale: the tallest STACKED point across the given lanes. */
export function stackedPeak(lanes: ReplayLane[], marks: ReplayMark[]): number;
```

## Rendering

The SVG is built **once** from the downsampled series. Playback moves the `width` of a
`clipPath` rectangle — one attribute per frame, no node churn:

```html
<svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="summary">
  <defs><clipPath :id="clipId"><rect :width="revealX" :height="height" /></clipPath></defs>
  <g :clip-path="`url(#${clipId})`"> … lanes … </g>
  <line class="ui-replay-timeline__playhead" :x1="revealX" :x2="revealX" />
</svg>
```

`clipId` is generated per instance: two timelines on one page with the same id would reveal
each other.

**Downsampling is to the rendered width, with `max()` per output bucket.** Today's data is
4 201 points into roughly 1 100 pixels — four points per pixel, none of them separately
visible. `max()` and not `mean()` because peaks are the thing being looked at; a mean hides
the burst that motivates the whole chart.

**The figures never come from the downsampled series.** `accumulate` runs on the
full-resolution arrays, so the numbers in the table are exact regardless of how coarse the
picture is. That separation is what makes downsampling free rather than a compromise.

Mark kinds:

- `area` — filled path from the baseline. Context.
- `stack` — bars stacked from the baseline, in `marks` order.
- `tick` — a bar at the top of the lane, `--ui-replay-timeline-tick-height` tall.
  Events, not magnitudes.

## Tokens

A new block in `src/styles/tokens.css`:

```
--ui-replay-timeline-lane-gap
--ui-replay-timeline-label-size
--ui-replay-timeline-tick-height     /* default 4px */
--ui-replay-timeline-playhead
--ui-replay-timeline-area-fill
```

There is deliberately **no** `--ui-replay-timeline-lane-height`: SVG geometry needs a number
the script can compute with, so lane height is the `laneHeight` prop and nothing else. A token
that CSS could override would silently disagree with the `viewBox` the script built.

Mark colours resolve from the existing semantic tone tokens, not from new ones: a `danger`
mark reads the same red as a danger badge.

## Accessibility

`role="img"` with a generated `aria-label`: lane count, point count, bucket size, the window
covered, and each lane's accumulated total at the current cursor. Inside the `<svg>`, a
`<title>` and `<desc>`. The transport controls are real `<button>`s and the scrubber a real
`<input type="range">` with `aria-valuetext` carrying the clock, so the chart is operable and
readable without seeing it.

## Files

```
src/components/replay-timeline/
  index.ts
  ReplayTimeline.vue
  replay-timeline.scss
  ReplayTimeline.test.ts
  replay-timeline.docs.ts
  replay.ts                 # the pure functions above
  replay.test.ts
```

Plus one line in `src/index.ts` and the token block in `src/styles/tokens.css`.

## Testing

**In `onyx-vue`, jsdom, like the other 43:**

- one `<rect>` per output bucket per `stack` mark, one `<path>` per `area` mark
- lane labels rendered, legend built from `marks`
- the clip rectangle's `width` tracks `cursor`, and `cursor` at 0 reveals nothing
- `playing` toggles, `finished` fires at the last point
- two instances on one page do not share a `clipPath` id
- `axe` clean
- `replay.test.ts` for the pure functions: `downsample` keeps the peak and never returns more
  points than the width; `accumulate`/`totalAt` at `-1`, `0`, and past the end; `stackedPeak`
  is per-point and not the sum of separate peaks

**In `control-panel`:** `tests/articles_ui.py` keeps guarding the real render. Its canvas
pixel count is replaced by node assertions, which is a strictly better check — a pixel count
cannot tell a correct chart from a wrong one.

## Migration

1. Land the component in `onyx-vue` with its tests and docs page.
2. In the consumer, rewrite `SimulationChart.vue` as fetch + lane mapping + mark definitions +
   the figures table in the slot.
3. Keep `reachesOrigin`, `formatCount` and `formatDelta` in the app: they are domain and
   locale, not layout.
4. Delete the canvas drawing, the prefix-sum helpers now imported from the library, and the
   scale helpers.

## Accepted trade-offs

**`max()` downsampling overstates a bucket's average.** A single spike inside a five-minute
bucket paints as though the whole bucket were that high. The figures stay exact, so no number
is affected — but the picture is a peak envelope, not a mean. Stated in the `.docs.ts` so a
consumer is not surprised.

**One vertical scale for every `shared` mark across every lane.** It is what makes lanes
comparable and it means a lane whose values are an order of magnitude smaller reads as flat.
The `scale: "own"` escape hatch exists for the context series only.

**No hover, no tooltips.** The clock plus the figures table carry the reading. Adding hover
means hit-testing the SVG, which is the first step toward the charting library this is not.
