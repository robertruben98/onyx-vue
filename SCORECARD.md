# Onyx Vue scorecard

Measured 2026-10-04 by `npm run score`. Every aspect must score above 90. How each one is measured: [scorecard/README.md](scorecard/README.md).

| Aspect | Score | Measured |
|---|---|---|
| Accessibility | ✅ 94.5 | 248/340 component×theme runs with no axe violation |
| Test coverage | ✅ 90.4 | statements 95.78%, branches 87.95%, functions 87.43% |
| Documentation | ✅ 97.7 | 423/435 props, events and slots documented; 73/73 exports on a docs page |
| Theming & tokens | ✅ 98.6 | 138/140 token checks pass |
| Responsive | ❌ 62.4 | 131/210 page×width runs with nothing spilling |
| API consistency | ❌ 66.2 | 49/74 API convention checks pass |
| Component catalogue | ❌ 78 | 39/50 catalogue entries present, tested and documented |
| Packaging & DX | ❌ 58.3 | 7/12 packaging checks pass |

## Accessibility — what costs points

- action-cluster@default: color-contrast (serious, 5 nodes) .ui-action-cluster--quiet > .ui-button.ui-button--text.ui-button--sm:nth-child(1) > .ui-button__el > .ui-button__label
- alert@default: color-contrast (serious, 2 nodes) div[role="alert"] > .ui-alert__body > .ui-alert__title
- ansi-terminal@default: color-contrast (serious, 3 nodes) .ui-ansi-fg-34
- app-bar@default: color-contrast (serious, 3 nodes) .ui-button--secondary > .ui-button__el > .ui-button__label
- app-shell@default: color-contrast (serious, 2 nodes) .ui-brand-mark__tile
- app-shell@default: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- badge@default: color-contrast (serious, 1 nodes) .ui-badge--danger > .ui-badge__el
- brand-mark@default: color-contrast (serious, 1 nodes) .ui-brand-mark:nth-child(1) > .ui-brand-mark__tile[aria-hidden="true"]
- breadcrumb@default: color-contrast (serious, 1 nodes) .ui-breadcrumb__link
- bulk-bar@default: color-contrast (serious, 5 nodes) .ui-button--secondary.ui-button.ui-button--sm:nth-child(3) > .ui-button__el > .ui-button__label
- button@default: color-contrast (serious, 7 nodes) section[aria-label="Primary"] > .demo__preview > .ui-button--primary.ui-button > .ui-button__el > .ui-button__label
- check-row@default: color-contrast (serious, 1 nodes) .ui-button__label
- confirm-button@default: color-contrast (serious, 2 nodes) .ui-confirm-button:nth-child(1) > .ui-button.ui-button--secondary.ui-button--sm > .ui-button__el > .ui-button__label
- data-table@default: aria-required-children (critical, 3 nodes) .ui-data-table:nth-child(1) > div[aria-rowcount="1"][aria-label="Team"][aria-colcount="3"] > .ui-dt__body[role="rowgroup"]
- data-table@default: scrollable-region-focusable (serious, 1 nodes) .ui-dt__viewport
- dialog@default: color-contrast (serious, 5 nodes) section[aria-label="Basic"] > .demo__preview > .ui-button--primary.ui-button > .ui-button__el > .ui-button__label
- digital-rain@default: landmark-main-is-top-level (moderate, 1 nodes) .demo__preview > main
- digital-rain@default: landmark-no-duplicate-main (moderate, 1 nodes) .demo__preview > main
- drawer@default: color-contrast (serious, 1 nodes) .ui-button__label
- empty-state@default: color-contrast (serious, 2 nodes) .ui-button--primary > .ui-button__el > .ui-button__label
- filter-bar@default: color-contrast (serious, 1 nodes) span[aria-label="42 todos"] > span[aria-hidden="true"]
- filter-chip@default: color-contrast (serious, 2 nodes) .ui-filter-chip--muted > .ui-filter-chip__label
- input@default: color-contrast (serious, 1 nodes) .ui-button__label
- load-more-row@default: color-contrast (serious, 2 nodes) .ui-load-more-row:nth-child(1) > .ui-button.ui-button--secondary.ui-button--sm > .ui-button__el > .ui-button__label
- log-lines@default: color-contrast (serious, 3 nodes) .ui-log-lines__line:nth-child(1) > .ui-log-lines__action
- metric-chip@default: color-contrast (serious, 1 nodes) .ui-metric-chip--stale > .ui-tri-state-count--ok.ui-tri-state-count[aria-label="23 commits hoy"] > span[aria-hidden="true"]
- nav-rail@default: color-contrast (serious, 1 nodes) span[aria-label="57 Todos"] > span[aria-hidden="true"]
- panel@default: color-contrast (serious, 1 nodes) .ui-button__label
- popover@default: color-contrast (serious, 2 nodes) section[aria-label="Basic"] > .demo__preview > .ui-popover > .ui-popover__trigger > .ui-button.ui-button--secondary > .ui-button__el > .ui-button__label
- progress-bar@default: color-contrast (serious, 1 nodes) .ui-button__label
- run-state@default: color-contrast (serious, 3 nodes) section[aria-label="Scale"] > .demo__preview > .ui-run-state--defecto.ui-run-state
- section-header@default: color-contrast (serious, 1 nodes) .ui-button__label
- severity-badge@default: color-contrast (serious, 2 nodes) section[aria-label="Scale"] > .demo__preview > .ui-severity-badge--high.ui-severity-badge
- state-bar@default: color-contrast (serious, 1 nodes) .ui-run-state--defecto
- tabs@default: color-contrast (serious, 1 nodes) .ui-button__label
- tag@default: color-contrast (serious, 2 nodes) section[aria-label="Variants"] > .demo__preview > .ui-tag--danger.ui-tag > .ui-tag__label
- toast@default: color-contrast (serious, 4 nodes) .ui-button--secondary.ui-button.ui-button--sm:nth-child(1) > .ui-button__el > .ui-button__label
- tooltip@default: color-contrast (serious, 5 nodes) .ui-button--primary > .ui-button__el > .ui-button__label
- action-cluster@dark: color-contrast (serious, 3 nodes) .ui-action-cluster--quiet > .ui-button.ui-button--text.ui-button--sm:nth-child(1) > .ui-button__el > .ui-button__label
- alert@dark: color-contrast (serious, 1 nodes) .ui-alert--info.ui-alert--boxed.ui-alert > .ui-alert__el[role="status"] > .ui-alert__body > .ui-alert__title
- app-shell@dark: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- badge@dark: color-contrast (serious, 1 nodes) .ui-badge--info > .ui-badge__el
- bulk-bar@dark: color-contrast (serious, 1 nodes) section[aria-label="Offering actions"] > .demo__preview > .ui-bulk-bar[role="group"][aria-label="4 marcadas"] > .ui-bulk-bar__count
- data-table@dark: aria-required-children (critical, 3 nodes) .ui-data-table:nth-child(1) > div[aria-rowcount="1"][aria-label="Team"][aria-colcount="3"] > .ui-dt__body[role="rowgroup"]
- data-table@dark: scrollable-region-focusable (serious, 1 nodes) .ui-dt__viewport
- digital-rain@dark: landmark-main-is-top-level (moderate, 1 nodes) .demo__preview > main
- digital-rain@dark: landmark-no-duplicate-main (moderate, 1 nodes) .demo__preview > main
- filter-chip@dark: color-contrast (serious, 2 nodes) .ui-filter-chip--muted > .ui-filter-chip__label
- metric-chip@dark: color-contrast (serious, 1 nodes) .ui-metric-chip--stale > .ui-tri-state-count--ok.ui-tri-state-count[aria-label="23 commits hoy"] > span[aria-hidden="true"]
- severity-badge@dark: color-contrast (serious, 1 nodes) .ui-severity-badge--low
- tag@dark: color-contrast (serious, 5 nodes) section[aria-label="Variants"] > .demo__preview > .ui-tag--info.ui-tag > .ui-tag__label
- action-cluster@acme: color-contrast (serious, 3 nodes) .ui-action-cluster--quiet > .ui-button.ui-button--text.ui-button--sm:nth-child(1) > .ui-button__el > .ui-button__label
- alert@acme: color-contrast (serious, 1 nodes) div[role="alert"] > .ui-alert__body > .ui-alert__title
- ansi-terminal@acme: color-contrast (serious, 2 nodes) .ui-ansi-fg-35
- app-shell@acme: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- badge@acme: color-contrast (serious, 1 nodes) .ui-badge--danger > .ui-badge__el
- bulk-bar@acme: color-contrast (serious, 1 nodes) .ui-button--danger > .ui-button__el > .ui-button__label
- button@acme: color-contrast (serious, 1 nodes) .ui-button--danger > .ui-button__el > .ui-button__label
- data-table@acme: aria-required-children (critical, 3 nodes) .ui-data-table:nth-child(1) > div[aria-rowcount="1"][aria-label="Team"][aria-colcount="3"] > .ui-dt__body[role="rowgroup"]
- data-table@acme: scrollable-region-focusable (serious, 1 nodes) .ui-dt__viewport
- … and 44 more

## Test coverage — what costs points

- components/bar-chart/ChartParts.vue: statements 100%, branches 90.9%, functions 0%
- components/bar-list/BarList.vue: statements 100%, branches 82.5%, functions 28.57%
- components/textarea/Textarea.vue: statements 92.85%, branches 100%, functions 50%
- components/toast/ToastHost.vue: statements 100%, branches 100%, functions 50%
- components/popover/Popover.vue: statements 80.76%, branches 59.09%, functions 100%
- components/bar-chart/BarChart.vue: statements 100%, branches 80%, functions 60%
- components/tabs/Tabs.vue: statements 94.54%, branches 66.66%, functions 100%
- components/tooltip/Tooltip.vue: statements 90.62%, branches 68.42%, functions 100%
- components/menu/Menu.vue: statements 85.71%, branches 72.41%, functions 80%
- components/code-block/CodeBlock.vue: statements 93.18%, branches 89.47%, functions 75%
- components/bar-chart/chart-kit.ts: statements 94.44%, branches 77.77%, functions 100%
- components/select/Select.vue: statements 89.78%, branches 79.36%, functions 83.33%
- components/dialog/Dialog.vue: statements 79.38%, branches 81.48%, functions 85.71%
- components/tabs/Tab.vue: statements 100%, branches 80%, functions 100%
- components/filter-chip/FilterChip.vue: statements 100%, branches 81.25%, functions 100%
- components/data-table/DataTable.vue: statements 93.56%, branches 83.97%, functions 81.81%
- components/ansi-terminal/AnsiTerminal.vue: statements 97.22%, branches 84.37%, functions 83.33%
- components/drawer/Drawer.vue: statements 92.38%, branches 84.21%, functions 100%
- components/ansi-terminal/ansi.ts: statements 93.22%, branches 84.37%, functions 85.71%
- components/avatar/Avatar.vue: statements 100%, branches 86.66%, functions 100%
- components/confirm-button/ConfirmButton.vue: statements 97.33%, branches 86.95%, functions 100%
- components/metric-chip/MetricChip.vue: statements 100%, branches 87.5%, functions 100%
- components/progress-bar/ProgressBar.vue: statements 100%, branches 87.5%, functions 100%

## Documentation — what costs points

- UiAppShell: slot `default` missing from the API table
- UiCodeBlock: slot `default` missing from the API table
- UiDataTable: emit `rowActivated` missing from the API table
- UiDataTable: emit `update:expanded` missing from the API table
- UiDigitalRain: prop `label` missing from the API table
- UiDrawer: slot `default` missing from the API table
- UiNavRail: slot `default` missing from the API table
- UiNavRailGroup: slot `default` missing from the API table
- UiNavRailItem: prop `title` missing from the API table
- UiPanel: slot `default` missing from the API table
- UiStateBar: prop `label` missing from the API table
- UiTab: prop `index` missing from the API table

## Theming & tokens — what costs points

- crt-overlay/crt-overlay.scss: raw colour `rgba(0`
- dialog/dialog.scss: undefined token(s) --ui-dialog-backdrop

## Responsive — what costs points

- component:accordion@360px: page scrolls sideways
- component:action-cluster@360px: page scrolls sideways
- component:alert@360px: page scrolls sideways
- component:ansi-terminal@360px: page scrolls sideways
- component:app-bar@360px: page scrolls sideways
- component:app-shell@360px: page scrolls sideways
- component:avatar@360px: page scrolls sideways
- component:badge@360px: page scrolls sideways
- component:bar-chart@360px: page scrolls sideways
- component:bar-list@360px: page scrolls sideways
- component:block-meter@360px: page scrolls sideways
- component:breadcrumb@360px: page scrolls sideways
- component:bulk-bar@360px: page scrolls sideways
- component:button@360px: page scrolls sideways
- component:card@360px: page scrolls sideways
- component:check-row@360px: page scrolls sideways
- component:check-tree@360px: page scrolls sideways
- component:checkbox@360px: page scrolls sideways
- component:code-block@360px: page scrolls sideways
- component:confirm-button@360px: page scrolls sideways
- component:data-table@360px: page scrolls sideways
- component:description-list@360px: page scrolls sideways
- component:crt-overlay@360px: page scrolls sideways
- component:dialog@360px: page scrolls sideways
- component:digital-rain@360px: page scrolls sideways
- component:disclosure@360px: page scrolls sideways
- component:divider@360px: page scrolls sideways
- component:drawer@360px: page scrolls sideways
- component:empty-state@360px: page scrolls sideways
- component:fieldset@360px: page scrolls sideways
- component:filter-bar@360px: page scrolls sideways
- component:filter-chip@360px: page scrolls sideways
- component:group-header@360px: page scrolls sideways
- component:heat-strip@360px: page scrolls sideways
- component:hud-frame@360px: page scrolls sideways
- component:icon-button@360px: page scrolls sideways
- component:input@360px: page scrolls sideways
- component:key-hints@360px: page scrolls sideways
- component:kpi-strip@360px: page scrolls sideways
- component:load-more-row@360px: page scrolls sideways
- component:log-lines@360px: page scrolls sideways
- component:menu@360px: page scrolls sideways
- component:metric-chip@360px: page scrolls sideways
- component:nav-rail@360px: page scrolls sideways
- component:panel@360px: page scrolls sideways
- component:popover@360px: page scrolls sideways
- component:progress-bar@360px: page scrolls sideways
- component:radio-group@360px: page scrolls sideways
- component:readout@360px: page scrolls sideways
- component:run-state@360px: page scrolls sideways
- component:relative-time@360px: page scrolls sideways
- component:section-header@360px: page scrolls sideways
- component:select@360px: page scrolls sideways
- component:severity-badge@360px: page scrolls sideways
- component:spark-bars@360px: page scrolls sideways
- component:spinner@360px: page scrolls sideways
- component:state-bar@360px: page scrolls sideways
- component:stepper@360px: page scrolls sideways
- component:status-dot@360px: page scrolls sideways
- component:switch@360px: page scrolls sideways
- … and 19 more

## API consistency — what costs points

- UiButton: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiConfirmButton: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiInput: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiTextarea: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiCheckbox: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiSwitch: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiSelect: attributes land on the wrapper, not the control (aria-describedby, data-probe, autocomplete)
- UiBlockMeter: tone uses neutral | ok | warn | danger | info (default "neutral"); expected neutral | info | success | warning | danger | muted
- UiCheckbox: event `checkedChange` is not past tense (selected, toggled…) nor update:*
- UiCodeBlock: tone uses default | muted | danger (default "default"); expected neutral | info | success | warning | danger | muted
- UiEmptyState: event `primaryAction` is not past tense (selected, toggled…) nor update:*
- UiEmptyState: event `secondaryAction` is not past tense (selected, toggled…) nor update:*
- UiFilterChip: tone uses neutral | ok | warn | danger | info | muted (default "neutral"); expected neutral | info | success | warning | danger | muted
- UiInput: event `valueChange` is not past tense (selected, toggled…) nor update:*
- UiLoadMoreRow: event `loadMore` is not past tense (selected, toggled…) nor update:*
- UiMenu: event `itemSelect` is not past tense (selected, toggled…) nor update:*
- UiMetricChip: tone uses neutral | ok | warn | danger | info (default "neutral"); expected neutral | info | success | warning | danger | muted
- UiPopover: event `toggle` is not past tense (selected, toggled…) nor update:*
- UiRadioGroup: event `valueChange` is not past tense (selected, toggled…) nor update:*
- UiReadout: tone uses default | success | warning | danger | muted (default "default"); expected neutral | info | success | warning | danger | muted
- UiSelect: event `change` is not past tense (selected, toggled…) nor update:*
- UiSwitch: event `checkedChange` is not past tense (selected, toggled…) nor update:*
- UiTextarea: event `valueChange` is not past tense (selected, toggled…) nor update:*
- UiTooltip: event `toggle` is not past tense (selected, toggled…) nor update:*
- UiTriStateCount: tone uses neutral | ok | warn | danger (default "neutral"); expected neutral | info | success | warning | danger | muted

## Component catalogue — what costs points

- Toggle / segmented control: missing (UiSegmented / UiToggleGroup)
- Combobox / autocomplete: missing (UiCombobox / UiAutocomplete)
- Slider: missing (UiSlider)
- Date input: missing (UiDateInput / UiDatePicker)
- File input: missing (UiFileInput / UiFileUpload)
- Form field (label, help, error): missing (UiFormField / UiField)
- Pagination: missing (UiPagination)
- Skeleton: missing (UiSkeleton)
- Stack layout: missing (UiStack)
- Grid layout: missing (UiGrid)
- Calendar: missing (UiCalendar / UiCalendarMonth)

## Packaging & DX — what costs points

- Type declarations are built and exported (`types` in package.json)
- Every preset stylesheet is exported (`./styles/*`)
- README covers install, usage, theming, presets and accessibility
- CHANGELOG has an entry for the next version
- package.json has repository, keywords and engines
