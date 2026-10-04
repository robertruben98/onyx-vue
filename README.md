# Onyx Vue

Vue 3 port of [Onyx UI](https://onyx.a-robertdev.com) — accessible, token-themed
components in **styled mode**. Same design-token engine as the Angular library:
one CSS layer drives every component, so re-skinning a whole app is a token swap,
never a component edit.

## Install

```bash
npm install onyx-vue vue
```

## Usage

```vue
<script setup lang="ts">
import { UiButton } from "onyx-vue";
import "onyx-vue/style.css"; // token layer + component styles

function save() {
  /* ... */
}
</script>

<template>
  <UiButton @clicked="save">Save</UiButton>
  <UiButton variant="secondary">Cancel</UiButton>
  <UiButton :loading="true">Saving…</UiButton>
</template>
```

Every component, its props, events and slots, with live demos:
**[vue.a-robertdev.com](https://vue.a-robertdev.com)**. Full pages built from the
components live under *Patterns* there.

Types ship with the package (`dist/types`), so props, events and the exported
unions (`ButtonVariant`, `ToastTone`…) are checked in your editor.

## Theming

Theming lives entirely in the token layer — components never branch on theme.

- **Dark mode:** add the class `app-dark` to a root element (e.g. `<html>`).
- **Client preset:** add `ui-theme-acme` (or your own preset class) to the root.

Both are pure CSS variable re-mappings; no component changes required. Put the
class on the root element, not an inner container: Dialog, Select, Tooltip,
Popover and Menu teleport into `body` and would fall outside its scope.

## Presets

`onyx-vue/style.css` carries the token layer, every preset and the component
styles. To load only what a page uses, import the base layer and one preset:

```ts
import "onyx-vue/styles/base.css"; // tokens
import "onyx-vue/styles/matrix.css"; // and the preset you use
```

| Preset | Root class | Look |
|---|---|---|
| default | none | Neutral light theme |
| dark | `app-dark` | Dark variant of the default theme |
| acme | `ui-theme-acme` | Client branding example |
| console | `ui-theme-console` | Monospace console |
| matrix | `ui-theme-matrix` | Phosphor-green run views; pair it with `UiDigitalRain` and `UiCrtOverlay` |

## Accessibility

- Every component is tested with axe in its own suite, and the scorecard runs
  axe in Chromium over every docs demo in all five themes, colour contrast
  included.
- Controls forward the attributes you put on them (`aria-*`, `autocomplete`,
  `name`…) to the native element they render, not to a wrapper.
- Dialog and Drawer trap focus and close on Escape.

## Develop

```bash
npm install
npm test        # vitest + @testing-library/vue + jest-axe
npm run build   # vite library build
npm run typecheck
npm run score   # the quality scorecard: writes SCORECARD.md
```

[`SCORECARD.md`](SCORECARD.md) scores the library on eight aspects
(accessibility, coverage, documentation, theming, responsive, API consistency,
catalogue, packaging); [`scorecard/README.md`](scorecard/README.md) says how
each is measured.

## License

MIT
