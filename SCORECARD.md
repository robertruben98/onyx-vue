# Onyx Vue scorecard

Measured 2026-11-03 by `npm run score`. Every aspect must score above 90. How each one is measured: [scorecard/README.md](scorecard/README.md).

| Aspect | Score | Measured |
|---|---|---|
| Accessibility | ✅ 99.4 | 469/495 component×theme runs with no axe violation |
| Test coverage | ✅ 95.3 | statements 96.55%, branches 91.52%, functions 97.8% |
| Documentation | ✅ 100 | 775/775 props, events and slots documented; 104/104 exports on a docs page |
| Theming & tokens | ✅ 97.1 | 198/204 token checks pass |
| Responsive | ✅ 100 | 309/309 page×width runs with nothing spilling |
| API consistency | ✅ 94.3 | 115/122 API convention checks pass |
| Component catalogue | ✅ 94 | 47/50 catalogue entries present, tested and documented |
| Packaging & DX | ✅ 91.7 | 11/12 packaging checks pass |

## Accessibility — what costs points

- app-shell@default: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- avatar@default: color-contrast (serious, 2 nodes) .ui-avatar--tint-gray > .ui-avatar__initials[aria-hidden="true"]
- chat-list-item@default: color-contrast (serious, 2 nodes) .ui-avatar--tint-green > .ui-avatar__initials[aria-hidden="true"]
- message-bubble@default: color-contrast (serious, 6 nodes) .ui-message-bubble--in.ui-message-bubble--message[data-direction="in"] > .ui-message-bubble__bottom > .ui-message-bubble__time
- diff-view@default: landmark-unique (moderate, 2 nodes) section[aria-label="Diff of the batch"] > .ui-diff-view__file[aria-label="agents/ideas.py"]
- tab-bar@default: landmark-unique (moderate, 1 nodes) .ui-tab-bar--chat
- app-shell@dark: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- diff-view@dark: landmark-unique (moderate, 2 nodes) section[aria-label="Diff of the batch"] > .ui-diff-view__file[aria-label="agents/ideas.py"]
- tab-bar@dark: landmark-unique (moderate, 1 nodes) .ui-tab-bar--chat
- app-shell@acme: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- avatar@acme: color-contrast (serious, 2 nodes) .ui-avatar--tint-gray > .ui-avatar__initials[aria-hidden="true"]
- chat-list-item@acme: color-contrast (serious, 2 nodes) .ui-avatar--tint-green > .ui-avatar__initials[aria-hidden="true"]
- message-bubble@acme: color-contrast (serious, 6 nodes) .ui-message-bubble--in.ui-message-bubble--message[data-direction="in"] > .ui-message-bubble__bottom > .ui-message-bubble__time
- diff-view@acme: landmark-unique (moderate, 2 nodes) section[aria-label="Diff of the batch"] > .ui-diff-view__file[aria-label="agents/ideas.py"]
- tab-bar@acme: landmark-unique (moderate, 1 nodes) .ui-tab-bar--chat
- app-shell@console: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- avatar@console: color-contrast (serious, 2 nodes) .ui-avatar--tint-gray > .ui-avatar__initials[aria-hidden="true"]
- chat-list-item@console: color-contrast (serious, 2 nodes) .ui-avatar--tint-green > .ui-avatar__initials[aria-hidden="true"]
- diff-view@console: landmark-unique (moderate, 2 nodes) section[aria-label="Diff of the batch"] > .ui-diff-view__file[aria-label="agents/ideas.py"]
- tab-bar@console: landmark-unique (moderate, 1 nodes) .ui-tab-bar--chat
- app-shell@matrix: landmark-complementary-is-top-level (moderate, 1 nodes) .ui-app-shell__rail
- avatar@matrix: color-contrast (serious, 2 nodes) .ui-avatar--tint-gray > .ui-avatar__initials[aria-hidden="true"]
- chat-list-item@matrix: color-contrast (serious, 2 nodes) .ui-avatar--tint-green > .ui-avatar__initials[aria-hidden="true"]
- message-bubble@matrix: color-contrast (serious, 1 nodes) .ui-message-bubble--context > .ui-message-bubble__text > .ui-message-bubble__time--inline.ui-message-bubble__time
- diff-view@matrix: landmark-unique (moderate, 2 nodes) section[aria-label="Diff of the batch"] > .ui-diff-view__file[aria-label="agents/ideas.py"]
- tab-bar@matrix: landmark-unique (moderate, 1 nodes) .ui-tab-bar--chat

## Test coverage — what costs points

- components/crt-overlay/CrtOverlay.vue: statements 0%, branches 100%, functions 100%
- internal/useOverlay.ts: statements 83.78%, branches 80%, functions 62.5%
- components/tooltip/Tooltip.vue: statements 91.89%, branches 66.66%, functions 100%
- internal/dev.ts: statements 66.66%, branches 100%, functions 100%
- internal/deprecated-events.ts: statements 94.11%, branches 71.42%, functions 100%
- components/panel-header/PanelHeader.vue: statements 100%, branches 75%, functions 100%
- components/tabs/Tab.vue: statements 100%, branches 75%, functions 100%
- components/textarea/Textarea.vue: statements 95.23%, branches 94.11%, functions 75%
- internal/deprecation-warning.ts: statements 87.5%, branches 75%, functions 100%
- components/ansi-terminal/AnsiTerminal.vue: statements 92.45%, branches 75.75%, functions 92.3%
- components/conversation-header/ConversationHeader.vue: statements 100%, branches 80%, functions 100%
- components/popover/Popover.vue: statements 93.18%, branches 80%, functions 90%
- components/readout/Readout.vue: statements 100%, branches 80%, functions 100%
- components/drawer/Drawer.vue: statements 93.44%, branches 80.43%, functions 100%
- components/dialog/Dialog.vue: statements 91.8%, branches 82.22%, functions 100%
- components/digital-rain/DigitalRain.vue: statements 94.44%, branches 82.5%, functions 100%
- components/toast/toast-store.ts: statements 94.23%, branches 82.6%, functions 100%
- components/tab-bar/TabBar.vue: statements 93.84%, branches 82.75%, functions 91.3%
- components/confirm-button/ConfirmButton.vue: statements 88.63%, branches 82.85%, functions 90%
- components/level-meter/LevelMeter.vue: statements 100%, branches 83.33%, functions 100%
- components/task-row/TaskRow.vue: statements 100%, branches 83.33%, functions 100%
- components/timeline/Timeline.vue: statements 95.83%, branches 83.33%, functions 100%
- components/tabs/Tabs.vue: statements 92.3%, branches 84.81%, functions 95.45%
- components/app-bar/AppBar.vue: statements 97.87%, branches 85.71%, functions 100%
- components/block-meter/BlockMeter.vue: statements 100%, branches 85.71%, functions 100%
- components/load-more-row/LoadMoreRow.vue: statements 100%, branches 85.71%, functions 100%
- components/segmented/Segmented.vue: statements 87.5%, branches 86.27%, functions 89.47%
- components/course-switcher/CourseSwitcher.vue: statements 95.05%, branches 87.94%, functions 97.36%
- components/toast/ToastHost.vue: statements 96.66%, branches 88%, functions 100%
- components/checkbox/Checkbox.vue: statements 100%, branches 88.23%, functions 100%
- components/progress-ring/ProgressRing.vue: statements 93.75%, branches 88.46%, functions 100%
- components/metric-chip/MetricChip.vue: statements 100%, branches 88.67%, functions 100%
- components/heat-strip/HeatStrip.vue: statements 95.23%, branches 88.88%, functions 100%
- components/menu/Menu.vue: statements 96.07%, branches 88.88%, functions 90.9%
- components/avatar/Avatar.vue: statements 96.07%, branches 89.83%, functions 100%

## Theming & tokens — what costs points

- avatar/avatar.scss: raw colour `#1b8755`
- avatar/avatar.scss: undefined token(s) --ui-avatar-gradient-
- conversation/conversation.scss: raw colour `rgba(0`
- media-card/media-card.scss: undefined token(s) --ui-avatar-gradient-
- message-bubble/message-bubble.scss: raw colour `rgba(1`
- tabs/tabs.scss: raw colour `#000`

## API consistency — what costs points

- UiAvatar: size accepts sm | md | lg | xl; expected sm | md | lg
- UiAvatar: tone uses default | tinted (default "default"); expected neutral | info | success | warning | danger | muted
- UiChatListItem: event `select` is not past tense (selected, toggled…) nor update:*
- UiTaskRow: event `toggle` is not past tense (selected, toggled…) nor update:*
- UiConversation: event `load-older` is not past tense (selected, toggled…) nor update:*
- UiProgressRing: size accepts sm | md | lg | xl; expected sm | md | lg
- UiProgressRing: tone uses primary | success | warning | danger | neutral (default "primary"); expected neutral | info | success | warning | danger | muted

## Component catalogue — what costs points

- Combobox / autocomplete: missing (UiCombobox / UiAutocomplete)
- File input: missing (UiFileInput / UiFileUpload)
- Calendar: missing (UiCalendar / UiCalendarMonth)

## Packaging & DX — what costs points

- The docs site builds
