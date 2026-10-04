# Changelog

onyx-vue follows [semantic versioning](https://semver.org/). Until 1.0.0 a
minor bump (0.x.0) may change a component's API; a patch bump (0.x.y) never
does. Every release is a git tag `vX.Y.Z` on the commit whose `package.json`
carries that version.

Consumers that build from source (the control-panel dashboard aliases
`@onyx/vue` to `onyx-vue/src`) pin a version and check out its tag; see
"Consuming a tagged version" below.

## Unreleased

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
git fetch --tags && git checkout v0.1.0
```

A source consumer should refuse to build against any other version; the
dashboard does it by comparing its pinned version with this `package.json`
(`web/package.json` → `onyxVue`).

To release: bump `version` in `package.json`, add a section here, merge, then
tag the merge commit: `git tag -a vX.Y.Z -m "onyx-vue X.Y.Z" <sha> && git push
origin vX.Y.Z`.
