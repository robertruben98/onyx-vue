# Changelog

onyx-vue follows [semantic versioning](https://semver.org/). Until 1.0.0 a
minor bump (0.x.0) may change a component's API; a patch bump (0.x.y) never
does. Every release is a git tag `vX.Y.Z` on the commit whose `package.json`
carries that version.

Consumers that build from source (the control-panel dashboard aliases
`@onyx/vue` to `onyx-vue/src`) pin a version and check out its tag; see
"Consuming a tagged version" below.

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
