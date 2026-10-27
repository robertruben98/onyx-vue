# Changelog

onyx-vue follows [semantic versioning](https://semver.org/). Until 1.0.0 a
minor bump (0.x.0) may change a component's API; a patch bump (0.x.y) never
does. Every release is a git tag `vX.Y.Z` on the commit whose `package.json`
carries that version.

Consumers that build from source (the control-panel dashboard aliases
`@onyx/vue` to `onyx-vue/src`) pin a version and check out its tag; see
"Consuming a tagged version" below.

## 0.9.0 — 2026-10-27

Two components the anime-dl panel (download.local.com) was drawing by hand, found while moving it
onto onyx. Nothing existing changes.

### Added

- `UiTabBar`: the bottom navigation of a phone. The first `visible` destinations (4) sit in a bar
  fixed to the bottom edge, above the safe-area inset, and the rest go behind "More", a sheet that
  opens upwards and closes with Escape (focus back on the button), a tap outside or choosing an
  entry. When only one destination would be left over it goes in the bar instead. Entries are real
  `<a href>` links with `aria-current="page"`; `itemClicked` fires on a plain left click so a
  single-page app can `preventDefault()` and route it (a click with a modifier key is left to the
  browser). `count` shows a badge (hidden at 0), `live` a dot named by `liveLabel`. Under
  `hideAbove` (640px) only: on a wider screen it is not rendered, spacer included. A spacer keeps
  the end of the page out from under the bar. Tokens `--ui-tab-bar-*`, layer `--ui-tab-bar-z`
  (900, below the teleported surfaces).
- `UiSequenceGrid`: a numbered run, each number there or not — the episodes of a season on disk.
  `max`, `missing`, `start` (1), `label`, `itemLabel`, `presentLabel`, `missingLabel`. Every number
  is printed; a gap differs in fill, text and a dashed outline, so it does not rely on telling red
  from green. The list's accessible name gives the count and the gaps as ranges ("8 of 12 present,
  missing 4, 10-12"), and each cell says its state in words. Exports `formatRanges`. Tokens
  `--ui-sequence-grid-*`, built on the success/danger surfaces.

### Changed (opt-in; defaults unchanged)

- `UiDataTable` `stackBelow`: under that viewport width every row is drawn as a card, one line per
  column with its header beside its value (`data-label` on each cell); a column with an empty
  header, such as row actions, takes the whole line. `0` (the default) never stacks; virtual mode
  never stacks, since its rows have one fixed height.

### Fixed

- `UiDataTable`: columns that do not fit scroll sideways inside the table. The grid was
  `overflow: hidden`, so every column past the right edge was cut off with nothing to say it was
  there — on a phone, most of the table.
- `UiDataTable`: a long word with nowhere to break (a path, an id, a URL) wraps inside its cell.
  It used to run past the column and the table's `overflow: hidden` cut it off silently.

## 0.8.0 — 2026-10-25

Components for a learner's profile page (phone first, 360px): a progress ring, a live
countdown, a stat card and a profile header, plus opt-in variants of the avatar, KPI strip,
description list, panel and progress bar. Every new prop defaults to the old behaviour.

### Added

- `UiProgressRing`: circular progress. `value`, `max` (100), `size` (`sm|md|lg|xl` = 40/64/96/128px,
  or a number of px), `thickness` (percent of the diameter; 12 for `sm`, 10 otherwise), `tone`
  (`primary|success|warning|danger|neutral`), `gradient` (from `--ui-progress-ring-gradient-from`
  to `-to`; pocket paints indigo to violet), `label`, `valueText` (`aria-valuetext`),
  `indeterminate` (`role="img"`, a spinning quarter arc), `showValue` (the percentage in the
  centre) and a default slot for custom centre content. It is a `progressbar` with
  `aria-valuenow/min/max`. The arc animates to its value (700ms) and does not move under
  `prefers-reduced-motion`; under forced colours it uses system colours. It covers what the
  English trainer's own `ProgressRing.vue` does (gradient, slot centre, 10/100 stroke, round cap).
  Tokens `--ui-progress-ring-*`.
- `UiCountdown`: a live countdown to `to` (Date, ISO string or epoch ms). `units` (`auto` = days,
  hours and minutes without the leading zero units, or an explicit list), `format` (`long`
  "13 h 18 min" / `short` "13:18"), `size` (`sm|md|lg`), `label` (after the figure and at the end of
  the spoken sentence), `tick` (30s, 1s when seconds show), `now` (injectable clock),
  `announce`, `unitLabels`. The smallest unit rounds up, so the display reaches 0 with the time.
  It is a `role="timer"` with `aria-live="off"`: the visible figure is `aria-hidden` inside a
  `<time datetime="PT13H18M">`, and a visually hidden sentence ("13 hours and 18 minutes to the
  written exam") is what a screen reader reads. `announce` makes it `polite` and the sentence then
  changes only per day, hour, ten minutes and, in the last ten, minute. Emits `ended` once at zero
  (also on mount when the moment has passed; a later `to` re-arms it), stops its timer then and on
  unmount; slot `#ended`. Exports `splitCountdown`, `formatCountdown`, `speakCountdown`.
- `UiStatCard`: one prominent figure. `value`, `label`, `hint`, `tone`
  (`neutral|primary|success|warning|danger`), `size` (`sm|md|lg`), `variant` (`card|plain`),
  `trend` (`up|down|flat`) with `trendLabel` and `trendText`, `as` (`div|button|a`) with `href`
  and `disabled`, `loading` (a skeleton and `aria-busy`), `emptyValue`, slots `#icon`
  (decorative) and `#value`. The label is read first and the value is shown first and largest
  (at least 1.5x the label). The trend direction is said in words ("Up", "Down", "No change"),
  never only by the arrow or the colour. As a button or link: at least 44px, outline focus ring,
  pressed state (none under reduced motion). Tokens `--ui-stat-card-*`.
- `UiProfileHeader`: the identity hero. `name` (the heading, `headingLevel`, default 2),
  `subtitle` or `#subtitle`, `#actions`, `#stats` (a `role="group"` named by `statsLabel`, made
  for 2 to 4 `UiStatCard size="sm"`), `#avatar`, `avatarSrc`, `avatarSize` (`xl`),
  `avatarGradient` (`true`), the ring pass-through (`ringValue`, `ringMax`, `ringTone`,
  `ringGradient`, `ringLabel`) and `variant` (`plain|card`). It lays out by its own width (a
  container query): under 26rem it stacks and centres and the stats go two by two. The avatar is
  decorative there, because the name is the heading beside it. Tokens `--ui-profile-header-*`.

### Changed (opt-in; defaults unchanged)

- `UiAvatar`: size `xl` (72px), `alt` (defaults to `name`; an empty name or alt makes the
  initials decorative instead of an unnamed `role="img"`), `gradient` (white initials on one of
  eight gradients, always the same one for a name, every stop at 4.5:1 or more; exported
  `avatarGradientIndex`), and a progress ring around it: `ringValue` (`null` = none), `ringMax`,
  `ringTone`, `ringGradient`, `ringLabel` (set, the ring is a `progressbar` beside the avatar;
  unset, it is decorative). The ring reuses the UiProgressRing drawing. A new `src` after a broken
  one is tried again.
- `UiKpiStrip`: `size="lg"` (big values), `variant="plain"` (spaced cards without the shared
  table rules, the label in normal case at a readable size), an `#icon-<index>` slot per item
  (decorative), and `hint` per item (the line under the label, the name UiStatCard uses; `sub`
  still works, `hint` wins).
- `UiDescriptionList`: `variant="emphasis"` (the value larger, medium weight, in the main text
  colour; the term in normal case, muted) and `layout="inline"` ("term: value" on one line,
  wrapping on a phone).
- `UiPanel`: `variant="plain"` (no separator, more space after it) and `variant="card"` (a
  surface with a border and radius). In both, the heading, body, empty line and footer share one
  inset, and a `UiDescriptionList` inside drops its own side padding so it starts under the
  heading too. The default panel is unchanged: its body is unpadded on purpose (a table runs edge
  to edge, and a description list's own padding matches the header); use `padded` for prose.
- `UiProgressBar`: `startLabel` / `endLabel` at the ends of the bar (e.g. "18" and "19"; visual
  only, the aria values do not change) and `size` (`sm|md|lg` = 4px, `--ui-progress-height`,
  12px).
- Presets: pocket sets the ring gradient and gives the stat card, plain KPI cells, card panel and
  card profile header the card shadow; console and matrix set all of these shadows to `none`.

## 0.7.0 — 2026-10-25

A course switcher for learning apps: the flag of the current course with a score in the top
bar, and a panel under the bar to change course. Nothing existing changes.

### Added

- `UiCourseSwitcher`: a trigger button (icon of the current course plus a `badge`, at least
  44px, outline focus ring, `aria-expanded`/`aria-controls`/`aria-haspopup="dialog"`) that opens
  a `role="dialog"` panel anchored under the app bar that holds it. The panel has a scrolling row
  of course tiles (built on `UiChipRow`, so the first and last tile and the focus ring are never
  clipped) and a `#detail` slot under it for a score card.
  - Under `sheetBelow` (600px) the panel is a full-width sheet with the page dimmed, `aria-modal`
    and a focus trap; a tap on the dimmed page or on the flag closes it. Wider it is a popover:
    a click outside closes it, and Tab past its end closes it and continues after the trigger.
  - Opening focuses the selected tile. Escape closes and returns focus to the trigger.
  - Tiles are one roving Tab stop: arrows, Home and End move between enabled tiles. The selected
    tile is `aria-pressed="true"` and `aria-current="true"`, with a primary-colour border ring
    and a tint (`Highlight` under forced colours).
  - `v-model` emits only for an enabled course other than the current one, and the selected
    tile always follows the model: a parent that refuses the change keeps the old course
    selected. Tapping the current course closes the panel.
  - Props `options`, `label`, `badge`, `panelLabel`, `tilesLabel`, `sheetBelow`,
    `closeOnSelect` (default `true`), `busy` (tiles `aria-disabled`, panel `aria-busy`),
    `disabled`; `v-model:open`; events `changed`, `opened`, `closed`; slots
    `#icon="{ option, selected, place }"`, `#detail="{ option, close }"`, `#trigger-extra`.
  - The panel slides in, except under `prefers-reduced-motion`.
  - Tokens `--ui-course-switcher-*` (trigger, badge, panel, tiles, selected ring, backdrop, z).
    Console and matrix set `--ui-course-switcher-panel-shadow: none`.

## 0.6.1 — 2026-10-25

Three fixes found while testing the English trainer on a phone. No API changes.

### Fixed

- `UiSegmented` and `UiRadioGroup` follow the model when the parent refuses a change (a leave
  guard that keeps its value). Vue did not repaint `checked`, because the bound value had not
  changed, so the native radio stayed on the tapped option: `UiSegmented` highlighted the old
  value while tapping the new one again fired no `change`, and `UiRadioGroup` showed the
  refused option as selected. After emitting, both now put every radio's `checked` back in line
  with the model on the next tick. `UiTabs` has no native state and was not affected.
- 44px hit areas under a coarse pointer for the `UiDrawer` and `UiDialog` close buttons (24×24
  and about 12×20 before), which also reach 24px with any pointer (WCAG 2.5.8). In a scrolling
  `UiChipRow` the 32px chips' 44px hit area was clipped by the scroll box; under a coarse pointer
  the row now has enough vertical padding for it. The toast action and dismiss buttons and
  `UiChip` already had the hit area and are now covered by `touch-targets.test.ts`.
- The `UiTabs` scroll arrows no longer sit on half a word. The strip is fully transparent under
  each arrow and fades in after it, reaching full opacity at `max(--ui-tabs-fade, arrow + 1rem)`;
  `scroll-padding-inline` is that same distance, so a focused tab clears the arrow and the fade.
  A selected tab too wide to be centred clear of them is aligned just after them instead.

## 0.6.0 — 2026-10-25

What the English trainer still built by hand, now in the library: full-width buttons with
icons, tappable cards, suggestion chips, a toast with Undo and the microphone button with its
level meter. Every new prop defaults to the old behaviour.

### Added

- `UiButton block` (default `false`): full width of the container. `UiButton wrap` (default
  `false`): a long label may take two lines; the height becomes a `min-height`, so the text no
  longer spills out of a fixed-height button. Slots `#leading` and `#trailing` for decorative
  icons (`aria-hidden`, sized by `--ui-button-icon-size`); a loading button shows its spinner
  in place of the leading icon.
- `UiCard as` (`'div'` default, `'button'`, `'a'`), `href` and `disabled`: the whole card is one
  native control, with hover, an outline focus ring, a pressed state (none under reduced
  motion), keyboard activation and a 44px minimum height. Its header, body and footer render as
  spans so a button holds valid content. Tokens `--ui-card-interactive-min-height`,
  `--ui-card-bg-hover`, `--ui-card-bg-active`, `--ui-card-border-hover`,
  `--ui-card-shadow-hover`, `--ui-card-active-scale`.
- `UiChip`: a suggestion chip, a one-shot action with no pressed state and no count (that is
  `UiFilterChip`). `#leading` icon slot, `disabled`, `@clicked`, a 44px hit area under a coarse
  pointer.
- `UiChipRow`: lays chips out, `overflow="wrap"` (default) or `"scroll"` (one line). In scroll
  mode an inset as wide as the focus ring keeps the first and last chip and the focus ring from
  being clipped. `label` makes it a named group.
- Toast action: `useToast().show(message, { action: { label, onAction } })` adds a button such as
  Undo. It is in the Tab order, and `F8` jumps to the newest toast from anywhere on the page
  (`UiToastHost hotkey`, `null` turns it off); activating it runs `onAction`, closes the toast
  and returns focus to where it came from. With an action the default duration is 6000ms. New `pause`,
  `resume` and `act` on `useToast()`, type `ToastAction`, token `--ui-toast-action-text`.
- `UiRecordButton`: the microphone toggle. Idle, recording (`aria-pressed`, danger colour, a
  pulse that becomes a static halo under reduced motion) and busy (spinner, `aria-busy`) states;
  `label`, `recordingLabel`, `busyLabel`, `size` (`'lg'` 56px default, `'md'`), `block`;
  slots `#icon`, `#detail` (a timer) and `#meter` (shown while recording), the last two
  `aria-hidden`; emits `toggled` with the next state. Pocket paints it in the FAB gradient.
- `UiLevelMeter` (onyx-vue#71, first part): `level` 0–1, `bars` (5), `label`. Smoothed bars in
  `currentColor`, without the transition under reduced motion.

### Changed

- A toast holds still while focus or the pointer is inside it and then resumes with the time it
  had left, so its action can be reached before it times out (WCAG 2.2.1).

### Fixed

- Focus rings are outlines on the rest of the controls: `UiTabs` tabs and scroll arrows, the
  `UiSelect` trigger, `UiInput`, `UiTextarea`, `UiCheckbox`, `UiRadioGroup`, `UiSwitch`, the
  `UiAppBar` menu button, the `UiMenu` trigger and items, `UiFilterChip`, the toast, dialog and
  drawer close buttons. A box-shadow ring can be replaced by a preset shadow and disappears in
  forced-colors mode. Tabs and menu items draw the ring inset (a scrolling tab strip clipped an
  outer ring); invalid inputs recolour the outline. `UiSegmented` and `UiFab` already used
  outlines and are now covered by `focus-ring.test.ts` too.
- `--ui-space-6` was used by `--ui-fab-bottom` and `--ui-check-tree-indent` but never declared,
  so both were invalid. It is now 1.5rem.
- The toast dismiss button reaches 24px, and both toast buttons get a 44px hit area under a
  coarse pointer.

## 0.5.0 — 2026-10-25

Accessibility and touch, found by an end-to-end audit of the English trainer on phones and
with the keyboard. Every new prop defaults to the old behaviour.

### Added

- `UiTextarea fluid` and `UiInput fluid`: block and full width. Inline, a transcript box sat at
  230px in a 334px column. `UiSelect` was already full width.
- `UiTextarea readonly` and `UiInput readonly`: the value can be read and copied but not edited,
  in the normal text colour. A learner's answer shown after a check used `disabled`, at 3.05:1.
- `UiSeverityBadge`: `very-high` and `very-low`, which with `high`, `medium` and `low` make a
  five-level scale. `very-high` looks and ranks like `critical`; `very-low` is green and ranks
  after `low`. Every level reaches 4.5:1 in light, dark and pocket day and night
  (`severity-contrast.test.ts`). New tokens `--ui-severity-badge-very-high-*` and
  `--ui-severity-badge-very-low-*`.
- `UiPanel landmark` (default `true`): `false` renders a plain `<div>`, for a page with so many
  panels that the landmark list turns into noise.
- `UiAlert live`: `polite` (role=status), `assertive` (role=alert) or `off` (a static role=note,
  for hints present at mount). Unset, it follows the variant as before.
- `UiSectionHeader headingId`.
- `UiDrawer side="bottom"`: a phone bottom sheet, full width and as tall as its content up to
  `--ui-drawer-bottom-max-height` (85dvh), with rounded top corners
  (`--ui-drawer-bottom-radius`). Same dialog semantics as the side sheets: focus moves in, Tab
  is trapped, Esc and the backdrop close it, and focus goes back to the trigger.

### Changed

- `UiPanel` names its region with `aria-labelledby` on its heading instead of copying the title
  into `aria-label`.
- `UiSegmented fluid`: between the `short` labels and wrapping there is a compact step (small
  text, minimal padding). A label that still has to wrap breaks only at spaces, not after a
  hyphen ("Role-" / "play") or inside a word.

### Fixed

- Focus rings on `UiButton`, `UiIconButton`, the `UiDisclosure` summary, the `UiAlert` close and
  the `UiTag` remove buttons are outlines. They were box-shadows, and pocket's primary button
  shadow replaced the ring: a focused primary button looked unfocused. An outline also survives
  forced-colors mode. `focus-ring.test.ts` checks every preset.
- `UiSegmented fluid` is border-box: its border and inset made it 8px wider than its column.
- Touch targets under `(pointer: coarse)`: `UiIconButton` (40px), the `UiTabs` scroll arrows
  (32px), the `UiAlert` close and the `UiTag` remove buttons get an invisible 44px hit area, like
  `UiCheckbox` and `UiSwitch`. The close and remove buttons reach 24px with any pointer (WCAG
  2.5.8; they were 12×20 and 10×17). The `UiDisclosure` summary is at least a control tall (it
  was 42px).
- `pocket`: disabled text goes from 2.48:1 to 3.4:1 (day) and from 3.05:1 to 3.7:1 (night).

## 0.4.0 — 2026-10-24

### Added

- `UiFab`: a floating action button for the one action that must stay at hand on a long page.
  - Extended (glyph and label) or round (`:extended="false"`).
  - With `collapse-on-scroll` it shrinks to a 48px round glyph while the page scrolls down, and
    grows back at the top of the page or when scrolling up. On the English trainer the hand-made
    "Ask" pill covered the listen buttons on the right edge of every card it passed.
  - With `hide-on-scroll` it slides out while scrolling down. It comes back when scrolling up, at
    the top or the end of the page, and on focus. Even round, a fixed button covers whatever
    passes under it.
  - The label is the accessible name in both shapes. Tokens `--ui-fab-*`, and `--ui-fab-bottom`
    lifts it above a bottom bar. `pocket` paints it in the brand gradient.
- `UiTabs overflow="scroll"`: a fade and an arrow button on each edge that hides tabs, and the
  selected tab is centred instead of left at the edge. On a phone, nine tabs read "Today Writing
  Speaking AI exa", and the other five were invisible. The arrows are for mouse and touch: they
  stay out of the tab order, because the keyboard already moves with the arrow keys.
- `UiSegmented`: options take a `short` label.

### Changed

- `UiSegmented fluid` keeps labels on one line. When they do not fit, it uses the options'
  `short` labels, with less side padding. Only if those do not fit either does a label wrap, which used to happen at once
  ("1 ·" / "Interview").
- `pocket`: segmented controls are a soft track with the chosen option as a pill inside, with no
  dark border and no lines between options. New tokens: `--ui-segmented-divider`,
  `--ui-segmented-inset` and `--ui-segmented-item-radius`.

## 0.3.1 — 2026-10-20

### Fixed

- `pocket`: the right, wrong and careful colours reach 4.5:1 on every light background. They were
  3.7–4.4:1, which Lighthouse flagged on the English trainer. `pocket.test.ts` now computes the
  WCAG ratio of every text colour against every background, in both modes.

## 0.3.0 — 2026-10-20

### Added

- Preset `pocket` (`.ui-theme-pocket`, with its own night variant under `.app-dark`) for web apps
  used as phone apps:
  - clean white cards on a cool grey floor, with a vivid indigo accent;
  - system fonts (SF, Roboto, Segoe UI Variable) with bold, tight titles;
  - 48px controls, pill buttons and switches, 14–28px corners, and soft layered shadows;
  - a translucent app bar with backdrop blur, a press effect on buttons (off under
    `prefers-reduced-motion`), and progress bars in the brand gradient.

  Like `classroom`, it covers every semantic token in both modes (`pocket.test.ts`). The docs
  preset selector offers it.

## 0.2.0 — 2026-10-20

Phones. Found on the English trainer, used mostly from a phone: a sticky bar that took half the
screen, five tabs in two rows, a four-option switch that made the page 515px wide on a 360px
screen, and 20px checkboxes.

### Added

- `UiAppBar` `collapseBelow` (and `menuLabel`): under that viewport width, status and actions fold
  behind a menu button and eyebrow and title truncate to one line. The menu closes with Escape, a
  tap outside, or choosing a button or link in it.
- `UiTabs` `overflow="scroll"`: one row that scrolls sideways, keeping the selected tab in view.
  The default stays `wrap`.
- `UiSegmented` `fluid`: full width, equal segments, labels wrap instead of widening the page.

### Changed

- `UiCheckbox` and `UiSwitch` get an invisible 44px touch target on touch screens
  (`pointer: coarse`); the layout does not move.

### Fixed

- `UiMenu` stays inside the window: near the right edge it opens to the left of its trigger, and
  upwards when there is no room below. Opening it no longer scrolls the page: the first item used
  to take focus before the panel was positioned, still at the end of the body.
- `UiTabs` never widens its grid or flex container (`min-width: 0`), which a one-row scrolling tab
  list did.

## 0.1.2 — 2026-10-20

### Added

- Preset `classroom` (`.ui-theme-classroom`) for learning pages: light by default with its own
  night variant under `.app-dark`, system sans body and textbook serif titles, 17px body text,
  44px controls, rounded corners, soft shadows, and `mark` styled as a highlighter. Like every
  preset it only remaps tokens; `classroom.test.ts` checks both modes cover every semantic token.
  The docs preset selector offers it. The control-panel dashboard pins this version for its
  English trainer pages.

## 0.1.1 — 2026-10-09

Everything merged on `feat/console-lists` since 0.1.0. The control-panel dashboard pins it
for `UiDigitalRain`'s `pauseWhenUnfocused`.

### Added

- Type declarations ship in `dist/types` and are exported (`types`).
- Token and preset stylesheets ship in `dist/styles` and are exported as
  `onyx-vue/styles/*`, so a page can load the base layer and one preset.
- `ToastApi`: the typed return of `useToast()`.
- Components: `UiStack`, `UiGrid` and `UiSkeleton` (layout); `UiSegmented`,
  `UiSlider`, `UiDateInput` and `UiFormField` (forms); `UiPagination`.
- `UiInput` accepts `date`, `time` and `datetime-local`.
- `npm run score` and `SCORECARD.md`: the library measured on eight aspects.

### Fixed

- Colour contrast passes WCAG AA (axe) in all five themes. The default
  primary is emerald-700 and danger red-700; dimmed states (quiet action
  cluster, empty filter chip, stale metric) no longer fade text with opacity.
- `UiDialog` had no backdrop colour: `--ui-dialog-backdrop` was used but
  never defined.
- `UiDataTable`: the empty and loading messages sit in a row and a cell
  (valid ARIA), and the virtual viewport is focusable.
- `UiDataTable` keyboard and layout: a keyboard jump in virtual mode no
  longer loses focus, a clicked cell becomes the active one (Enter used to
  act on the header), the grid keeps its tab stop while loading, and the
  virtual viewport re-measures its height when resized.
- `UiBarList`: a row with no value reads 0, not "undefined".
- At 360 px nothing spills: `UiBulkBar`, `UiSectionHeader` and `UiCheckRow`
  wrap, `UiSparkBars` scrolls inside its box, and the docs site no longer
  scrolls sideways.
- `UiButton`, `UiConfirmButton`, `UiInput`, `UiTextarea`, `UiCheckbox`,
  `UiSwitch` and `UiSelect` forward attributes (`aria-*`, `autocomplete`,
  `name`, `id`…) to their native element instead of the wrapper; `class` and
  `style` stay on the wrapper.

### Changed

- One tone vocabulary: `UiBlockMeter`, `UiFilterChip`, `UiMetricChip`,
  `UiTriStateCount`, `UiCodeBlock` and `UiReadout` take
  `neutral | info | success | warning | danger | muted`. `UiCodeBlock` and
  `UiReadout` default to `neutral`.
- Past-tense event names: `checkedChanged`, `valueChanged`, `changed`
  (`UiSelect`), `toggled` (`UiPopover`, `UiTooltip`), `itemSelected`,
  `loadMoreRequested`, `primaryClicked`, `secondaryClicked`.

### Deprecated

- Tone spellings `ok`, `warn` and `default` (still accepted).
- The old event names (`checkedChange`, `valueChange`, `change`, `toggle`,
  `itemSelect`, `loadMore`, `primaryAction`, `secondaryAction`): each is still
  emitted right after its new name. All of them go in 1.0; the list is
  exported as `DEPRECATED_EVENTS`.
- `UiDigitalRain`: `pauseWhenUnfocused` (default `true`). The rain stops painting while its
  window has no focus, not only while the tab is hidden, and moves again on focus; the last
  frame stays on the canvas. A dashboard left open on a second monitor painted it all day
  (~5 % of a core on the control-panel agents graph, 2026-10-09).

## 0.1.0 — 2026-09-25

First versioned release: everything on `feat/console-lists` (68 components,
the `console`, `acme` and `matrix` presets, the docs site) plus the pieces
extracted from the control-panel dashboard during its migration to onyx-vue.

### Added

- Layout: `UiAppShell`, `UiBrandMark`, `UiAppBar`, `UiPanel`, `UiFieldset` /
  `UiFieldRow` (#35).
- Overlays: `UiDrawer`, `UiToastHost` + `useToast` (#36).
- Actions: `UiConfirmButton` (two-click confirmation), `UiIconButton` (#37).
- Data: `UiFilterBar`, `UiDescriptionList`, `UiDisclosure`, `UiKpiStrip`,
  `UiStepper`, `UiBreadcrumb`, `UiCodeBlock` (#38).
- Console: `UiAnsiTerminal` and its SGR parser (`createAnsiParser`,
  `ansiClasses`, `stripAnsi`) (#39).
- Charts: `UiBarChart`, `UiBarList`, shared chart kit and `--ui-chart-*`
  tokens (#40).
- `UiDataTable`: `activatable` rows and the `rowActivated` event (#42);
  `DataTableColumn.hideBelow` (#38).
- API additions: `UiSelect` `ariaLabelledby`, `UiFilterChip` `dashed`, `UiTag`
  `appearance="outline"`, `UiStatusDot` `offStyle="ring"` (#38).

### Fixed

- `UiLogLines`: long results wrap instead of overflowing (#41).
- `UiNavRailItem`: a link entry (`href`) is never wider than the rail (#43).
- `Tabs.test.ts` typechecks (`expect` with two arguments).

## Consuming a tagged version

```bash
cd ~/Workspaces/robertdev/onyx/onyx-vue
git fetch --tags && git checkout v0.1.1
```

A source consumer should refuse to build against any other version; the
dashboard does it by comparing its pinned version with this `package.json`
(`web/package.json` → `onyxVue`).

To release: bump `version` in `package.json`, add a section here, merge, then
tag the merge commit: `git tag -a vX.Y.Z -m "onyx-vue X.Y.Z" <sha> && git push
origin vX.Y.Z`.
