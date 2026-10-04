# Onyx Vue scorecard

Measured 2026-10-04 by `npm run score`. Every aspect must score above 90. How each one is measured: [scorecard/README.md](scorecard/README.md).

| Aspect | Score | Measured |
|---|---|---|
| Accessibility | ✅ 99.9 | 375/380 component×theme runs with no axe violation |
| Test coverage | ✅ 98 | statements 99.44%, branches 95.41%, functions 99.08% |
| Documentation | ✅ 100 | 504/504 props, events and slots documented; 81/81 exports on a docs page |
| Theming & tokens | ✅ 100 | 156/156 token checks pass |
| Responsive | ✅ 100 | 240/240 page×width runs with nothing spilling |
| API consistency | ✅ 100 | 98/98 API convention checks pass |
| Component catalogue | ✅ 94 | 47/50 catalogue entries present, tested and documented |
| Packaging & DX | ✅ 100 | 12/12 packaging checks pass |

## Accessibility — what costs points

- app-shell@default: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- app-shell@dark: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- app-shell@acme: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- app-shell@console: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- app-shell@matrix: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail

## Test coverage — what costs points

- components/toast/ToastHost.vue: statements 100%, branches 100%, functions 50%
- components/textarea/Textarea.vue: statements 93.61%, branches 100%, functions 66.66%
- components/tabs/Tab.vue: statements 100%, branches 80%, functions 100%
- components/dialog/Dialog.vue: statements 94.65%, branches 80.55%, functions 100%
- components/ansi-terminal/AnsiTerminal.vue: statements 97.22%, branches 82.35%, functions 100%
- components/drawer/Drawer.vue: statements 92.38%, branches 84.21%, functions 100%
- components/popover/Popover.vue: statements 100%, branches 84.84%, functions 100%
- components/tabs/Tabs.vue: statements 100%, branches 85%, functions 100%
- components/avatar/Avatar.vue: statements 100%, branches 86.66%, functions 100%
- components/progress-bar/ProgressBar.vue: statements 100%, branches 87.5%, functions 100%
- components/confirm-button/ConfirmButton.vue: statements 97.46%, branches 88%, functions 100%
- components/metric-chip/MetricChip.vue: statements 100%, branches 88.23%, functions 100%
- components/filter-chip/FilterChip.vue: statements 100%, branches 89.47%, functions 100%

## Component catalogue — what costs points

- Combobox / autocomplete: missing (UiCombobox / UiAutocomplete)
- File input: missing (UiFileInput / UiFileUpload)
- Calendar: missing (UiCalendar / UiCalendarMonth)
