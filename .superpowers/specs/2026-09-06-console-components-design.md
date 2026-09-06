# Console components — design

**Date:** 2026-09-06
**Repo:** `onyx-vue` (this repo only — no React or Angular parity in this effort)
**Status:** approved, pending implementation plan

## Problem

Two applications already render the console look, and neither can reuse it.

`dashboard.local.com/prs/` is 84 KB of hand-written `prs.js` plus 17 KB of `prs.css` that
build every row, chip, drawer and panel as template strings. `control-panel/web/` is the Vue
rewrite of the sibling services dashboard; it imports nine symbols from `@onyx/vue` and
hand-rolls the rest — roughly 700 lines across `FilterBar.vue`, `SettingsPanel.vue`,
`RowActions.vue`, `LogDrawer.vue`, `useSettings.ts` and `useRuta.ts`.

The library gained a `console` preset so the look would stop being one page's CSS. The preset
landed; the components it dresses did not. Every consumer still reinvents them, and the second
consumer reinvented them differently from the first.

This design promotes that vocabulary into the library: 31 new components and 6 extensions to
existing ones, taking `onyx-vue` from 22 components to 53.

## Non-goals

- **React and Angular parity.** `onyx-ng` has 26 components and `onyx-react` has 22. Neither
  has a consumer asking for these. Divergence is accepted and deliberate.
- **Routing.** `useRuta.ts` works and hash routing is not a UI concern. It stays in the app.
- **Rewriting `/prs/`.** The page is the reference implementation, not a migration target in
  this effort. Its rewrite is separate work that these components make possible.
- **Regenerating the token pipeline.** See *Tokens* below.

## Constraints discovered in the ground

Each of these was verified against the working tree, not assumed.

**`feat/console-preset` is 19 commits ahead of `origin/master` and has never been pushed.**
It carries the `console` preset, the whole documentation site, and the `docs-model` mechanism.
Every component below depends on that substrate. If each batch branches off it, every pull
request drags 19 unrelated commits and the base moves underneath the work.

**The `tokens.css` header lies.** It says *"Do not edit directly, this file was
auto-generated"*, but the generator (style-dictionary, in `onyx-ng/libs/ui/tokens`) last wrote
its `dist/` on 2026-06-20, while `onyx-vue/src/styles/tokens.css` was edited on 2026-09-06.
The two files diverge by 243 lines in both directions: this repo's copy carries badge, alert,
divider and card tokens the generator's output lacks, and lacks the `empty-state`, `grid`,
`stack` and `skeleton` tokens it has. In practice the file is maintained by hand here.

**`empty-state` already exists in `onyx-ng`.** It is a port, not an invention.

**Four proposed extensions were already implemented.** `UiButton` already has
`size: 'sm' | 'md' | 'lg'` and `variant: 'text' | 'danger'`; `UiInput` already has `size`;
`UiDivider` already has `orientation: 'vertical'`. Only the gaps listed under *Extensions*
remain.

**The block meter should not be a component.** `UiProgressBar` already carries
`role="progressbar"` with correct `aria-valuenow`/`aria-valuemax`. A separate `BlockMeter`
drawing `▰▱` glyphs would duplicate that and announce punctuation to a screen reader. It
becomes a `segments` prop instead.

## Architecture

### The five-file contract

Every component ships the shape `src/components/badge/` already established:

```
src/components/<kebab-name>/
  Xxx.vue          <script setup lang="ts">, import "./xxx.scss"
  xxx.scss         var(--ui-*) only; BEM .ui-xxx / .ui-xxx__el / .ui-xxx--modifier
  Xxx.test.ts      @testing-library/vue + jest-axe
  xxx.docs.ts      ComponentDoc — id, title, description, imports, api, demos
  index.ts         export { default as UiXxx }; export type ...; export { xxxDoc }
```

plus one line in `src/index.ts`.

`xxx.docs.ts` is not optional. `docs/src/registry.ts` globs
`../../src/components/*/*.docs.ts` eagerly, so **adding a component adds its gallery page**.
Omitting the file produces a component that exists, is exported, and is invisible — precisely
the failure the metadata migration just fixed, when the gallery had 7 pages for 22 components.

Styles reference semantic and component tokens only. No raw colors, sizes or radii: that
constraint is what lets `console.css` restyle the library without touching a component.

### Tokens

New component tokens are written by hand into `src/styles/tokens.css`, in the shape the file
already uses (`--ui-<component>-<role>` resolving to a semantic or primitive token), with
remappings added to `console.css` and `dark.css` wherever the console look diverges.

`src/styles/console.test.ts` asserts that the console preset assigns every semantic token the
dark preset remaps. A preset that covers a token only partially does not fail loudly — it
inherits one value from the default theme and renders a light grey element in the middle of a
black console. That test stays green or the batch does not land.

### Naming and API conventions

Taken from the existing components, not invented here:

- Component export is `UiXxx`; the SFC file is `Xxx.vue`.
- Variant unions are exported types (`export type TagVariant = ...`).
- Props use `withDefaults(defineProps<{...}>(), {...})` with a doc comment per prop.
- Events are past-tense (`clicked`, `removed`, `dismissed`) via `defineEmits<{ name: [args] }>`.
- Two-way state uses `defineModel`.
- Root element carries `.ui-xxx` plus one modifier class per active variant, mirroring the
  Angular host bindings.
- Semantic variants reuse the family vocabulary — `neutral | info | success | warning | danger`
  — rather than the console page's private one (`ok | warn | down | off`). The mapping is the
  consumer's job.

### Domain vocabulary is stripped on the way in

The app components know about services, repos and pull requests. The library components must
not. `FilterBar.vue` hardcodes the chips `vivos / raros / apagados / fueraDeBase`;
`UiFilterChip` takes `label`, `count`, `state` and `tone`. The generalization is the work — a
component that still knows what a repo is has not been extracted, only moved.

## Components

### Batch 1 — state atoms

The vocabulary the rest of the batches depend on. No dependencies of its own.

| Component | Props | Notes |
|---|---|---|
| `UiStatusDot` | `state?: 'live' \| 'dead' \| 'warn' \| 'off' \| 'unknown'` (default `unknown`), `label?: string` | `role="img"` with `aria-label`; the color is never the only carrier of meaning |
| `UiSeverityBadge` | `severity: 'critical' \| 'high' \| 'moderate' \| 'medium' \| 'low' \| 'unknown'` | also exports `severityRank(severity): number` so consumers sort on the same scale instead of copying the `RANK` map that lives inline in `prs.js` |
| `UiTriStateCount` | `state: TriState`, `value?: number`, `tone?: 'neutral' \| 'ok' \| 'warn' \| 'danger'` | exports `type TriState = 'known' \| 'pending' \| 'unrequested'`, reused by `UiFilterChip`; see below |
| `UiRelativeTime` | `date: string \| Date`, `staleAfterDays?: number` (default `3`), `now?: Date` | renders `<time :datetime>`; `title` carries the absolute date; exports `formatRelative(date, now)` |
| `UiTruncate` | `text: string`, `lines?: number` (default `1`) | sets `title` to the full text automatically; one line ellipsizes, more clamp |

`UiTriStateCount` is the component this whole effort exists to produce. The console pages
distinguish three things that a plain number cannot: `5` is a fact, `·` means the data is in
flight, and `—` means nobody asked for it. Today that distinction is re-implemented by hand in
`renderChips`, `renderSidebar` and the row cells, and the app rewrite dropped it. The glyphs
are props (`pendingGlyph`, `unrequestedGlyph`) with those defaults, and the accessible name
states the meaning rather than the punctuation — "unknown, not requested", never "em dash".

A pure helper `resolveTriState({ value, loading, requested }): TriState` ships alongside it.
Not a composable: it holds no reactive state, and a function is easier to test.

`UiRelativeTime` takes `now` as an injectable prop because a component that reads the clock
internally cannot be tested deterministically. It does not tick — the consuming pages refresh
wholesale.

**Extension in this batch:** `UiTag` gains a `muted` variant. The console pages need the `draft`
tag, which states what a row *is* rather than warning about it; `neutral` is already spoken for.

### Batch 2 — lists

| Component | Props / slots | Notes |
|---|---|---|
| `UiSectionHeader` | `title: string`, `count?: string \| number`; slots `#actions`, `#controls` | the `/prs/` list header carries a title, a count, a toggle button and an inline sort select |
| `UiGroupHeader` | `name: string`, `full?: string`; slots `#marks` | the per-repo band inside a grouped list |
| `UiEmptyState` | ported from `onyx-ng/libs/ui/components/empty-state` | port the Angular API rather than design a new one |
| `UiLoadMoreRow` | `remaining: number`, `label?: string`; emits `loadMore` | "show the remaining N" |
| `UiActionCluster` | `revealOn?: 'hover' \| 'focus' \| 'always'`; slot `#default` | row-level cluster of text buttons; must stay keyboard reachable when `hover` |

`UiActionCluster` with `revealOn: 'hover'` is an accessibility trap in the source page: actions
that appear on hover and vanish for keyboard users. The library version reveals on focus-within
as well as hover, always.

**Extension in this batch:** `UiAlert` gains `appearance?: 'boxed' | 'band'` (default `boxed`),
an `#icon` slot and an `#action` slot. The console notices are full-bleed bands with an icon
that is sometimes a spinner and a button on the right. `appearance` is orthogonal to `variant`:
the variant stays semantic, the appearance is layout.

### Batch 3 — filters and meters

| Component | Props / slots | Notes |
|---|---|---|
| `UiFilterChip` | `label: string`, `count?: number`, `state?: TriState`, `tone?`, `active?: boolean`, `negative?: boolean`; emits `toggled` | a toggle button, not a `UiTag`; `negative` renders the `−N` veto form |
| `UiChipBar` | `groups?: boolean`; slots `#default`, `#actions` | wraps, inserts separators between groups, hosts the clear button |
| `UiQuotaMeter` | `value: number`, `max: number`, `label?: string`, `resetIn?: number`, `warnAt?: number` (default `0.2`), `dangerAt?: number` (default `0.05`) | composes `UiProgressBar`; tone thresholds are props, not hardcoded |
| `UiHealthChip` | `state?: 'live' \| 'dead' \| 'warn' \| 'unknown'`, `label: string` | composes `UiStatusDot` |

**Extensions in this batch:**
`UiProgressBar` gains `segments?: number` — when set, the bar renders that many discrete cells
and fills `round(value / max * segments)` of them, keeping its existing `role="progressbar"`
and ARIA values. This absorbs the proposed `BlockMeter`.
`UiInput` gains a `#prefix` slot for the leading `/` glyph of the search field.

### Batch 4 — settings panel

| Component | Props / slots | Notes |
|---|---|---|
| `UiSheet` | `open: boolean` (v-model), `side?: 'right' \| 'left'`, `title?: string`; slots `#default`, `#actions` | teleports to `body`; focus trap and Escape like `UiDialog` |
| `UiOptionRow` | `label: string`, `hint?: string`; slot `#default` | label left, control right |
| `UiOptionGrid` | `wide?: boolean`; slot `#default` | two or three per line as they fit |
| `UiToggleTile` | `label: string`, `modelValue: boolean`, `hint?: string`; slot `#note` | a checkbox as a tile, dimmed when off |
| `UiFieldNote` | slot `#default` | the explanatory paragraph under a settings section |

`UiSheet` teleports, which is the failure mode `console.css` documents at length: the preset
class must sit on the root element, because a teleported panel rendered from an inner container
escapes the class scope and paints with the default light theme. Its tests assert the teleport
target; its gallery demo and the `/next/` check are what actually prove it.

**Extension in this batch:** `UiSelect` gains `size?: 'sm' | 'md' | 'lg'`, matching the scale
`UiButton` and `UiInput` already expose. The console pages' inline `.mini-sel` is `sm`.

### Batch 5 — process and shell

| Component | Props / slots | Notes |
|---|---|---|
| `UiChecklist` / `UiCheckItem` | item: `state: 'done' \| 'failed' \| 'running' \| 'pending'`, `name: string`, `detail?: string`; slot `#actions` | `running` renders `UiSpinner` |
| `UiJobStream` | `steps: JobStep[]`, `done?: boolean`; emits `stopped` | live step list with a stop control |
| `UiLogList` | `entries: LogEntry[]` (`{ ts, action, result, details? }`) | result tone: `ok` / `err` / `wait` |
| `UiDrawer` | `open: boolean` (v-model), `title?: string`; slots `#default`, `#actions` | expands **in flow**, inside a row — not an overlay, which is what separates it from `UiSheet` and `UiDialog` |
| `UiBulkBar` | `count: number`, `actions: BulkAction[]` (each with an `eligible` count), `confirming?: BulkAction`; emits `run`, `cancel`, `clear` | see below |
| `UiAppShell` | slots `#sidebar`, `#topbar`, `#default`, `#footer` | the sticky-footer flex column |
| `UiTopBar` | `title: string`, `subtitle?: string`; slots `#brand`, `#actions` | |
| `UiSideNav` / `UiSideNavItem` | item: `label: string`, `active?: boolean`; slots `#marks` | `#marks` hosts `UiTriStateCount` and risk counters |
| `UiKeyBar` | `keys: { keys: string, label: string }[]`; slot `#status` | the shortcut footer |
| `UiKbd` | slot `#default` | one key cap; renders `<kbd>` |

`UiBulkBar` carries the pattern worth extracting most after `UiTriStateCount`: each action
reports how many of the marked rows it can actually act on, so the button reads `approve (3)`
when two of the five are your own pull requests and GitHub will refuse them. Confirmation
happens **in place**, by swapping the bar's content, not by opening a dialog. An action with
zero eligible targets is not rendered at all.

`UiKeyBar` and the key handling belong together: the footer that advertises the shortcuts and
the code that implements them drift apart the moment they are separate. `useKeyboardNav` (batch
6) accepts the same descriptor list `UiKeyBar` renders.

### Batch 6 — data table

Extending `UiDataTable`, today 23 KB of component and 22 KB of tests, 47 cases green. Every
addition is additive with a default that preserves current behavior, because
`control-panel/web/src/ServicesSection.vue` already imports it.

- `columns[].hidden` plus a `columnVisibility` model — hiding a column stops it being painted
  and must not remove the underlying datum from filters, counters or sorting. The source page
  is explicit about this and rewrites a `<style>` block to do it; the component does it in the
  grid template.
- `dense?: boolean` — the compact row height.
- `cursor` model plus `j`/`k` roving focus, with `aria-activedescendant`.
- `marked` model — multi-select for bulk actions, feeding `UiBulkBar`.
- `groupBy?: string` — grouped rows rendered with `UiGroupHeader`.
- `stickyHeader?: boolean`.
- `useDensity()` and `useKeyboardNav()` composables, extracted from
  `control-panel/web/src/composables/useSettings.ts`.

## Delivery

Step zero: **open a pull request for `feat/console-preset` into `master`** and merge it. Every
batch then branches off `master`.

One pull request per batch, in the order above — batch 1 first because batches 2 to 5 compose
its atoms. Each batch is independently green and independently useful.

A batch is not finished when its tests pass. It is finished when the hand-written file
**disappears** from `control-panel/web/src/` and the app imports from `@onyx/vue`:

1. Pull request in `onyx-vue` — `npx vitest run` and `npm run typecheck` green
2. Commit in `control-panel` — swap the import, delete the local `.vue`, its own tests stay green
3. Open `dashboard.local.com/next/` and exercise the flow

Step 3 is not ceremony. Teleporting components render with the default light theme if the
preset class is not on the root element, and no jsdom test sees it.

Mapping from batch to the files it retires:

| Batch | Retires from `control-panel/web/src/` |
|---|---|
| 2 | `RowActions.vue`'s reveal CSS (the file stays — see below) |
| 3 | `FilterBar.vue` |
| 4 | `SettingsPanel.vue` |
| 5 | `LogDrawer.vue` |
| 6 | `composables/useSettings.ts` |

Batch 1 retires nothing: it is the vocabulary the app never had.

`RowActions.vue` is the one entry that does not disappear outright. It is
domain-coupled — it takes a `Service`, hardcodes four SVG icons and emits
`abrir`/`reiniciar`/`logs`/`power` — so what the library can own is its reveal
behaviour and layout, not its buttons. After the swap the file keeps its icons
and wraps them in `<UiActionCluster>`, losing its own opacity rules and its
`:global(.ui-dt__tr:hover)` coupling to `UiDataTable`'s internal class.

That coupling is only half-fixed by batch 2. CSS cannot express "reveal when my
ancestor row is hovered" without a hook on the ancestor, so the consumer still
writes one line for the hover case while the library owns focus-within. Batch 6
owns the rest, when `UiDataTable` gains real row state.

## Testing

Test-driven, per component: the test file is written before the SFC.

- **Behavior** — `@testing-library/vue`, queried by role and accessible name rather than by
  class, except where a test asserts the modifier class contract explicitly (as `Badge.test.ts`
  does).
- **Accessibility** — `jest-axe` over every variant, the pattern
  `it.each(variants)("has no axe violations (%s)")` already used across the library.
- **Determinism** — anything time-dependent takes its clock as a prop.
- **Token discipline** — extend `src/styles/console.test.ts` so a new `--ui-*` component token
  that the dark preset remaps must also be remapped by console.

Baseline to hold: 24 files, 379 tests green as of `eda0468`.

## Verification

Per batch, before it is called done: `npx vitest run` green, `npm run typecheck` clean, the new
pages visible in the gallery at `onyx.local.com`, and `/next/` exercised in a browser.

**Open risk:** the Chrome extension does not connect from this session, so the two browser
checks cannot be performed here. They are either done by hand or the extension is fixed before
implementation starts. Anything not actually verified is reported as "not verified" — never
softened to "should work".

## Consequences

`onyx-vue` goes from 22 components to 53, against `onyx-ng`'s 26 and `onyx-react`'s 22. The
divergence is accepted: this port has the consumer.

`/prs/` is not rewritten here, but afterwards it can be — its 84 KB of template strings map
almost one to one onto this list, which is where the list came from.
