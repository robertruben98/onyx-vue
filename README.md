# Onyx Vue

[![Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://robertruben98.github.io/onyx-vue/)

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

## Theming

Theming lives entirely in the token layer — components never branch on theme.

- **Dark mode:** add the class `app-dark` to a root element (e.g. `<html>`).
- **Client preset:** add `ui-theme-acme` (or your own preset class) to the root.

Both are pure CSS variable re-mappings; no component changes required.

## Develop

```bash
npm install
npm test        # vitest + @testing-library/vue + jest-axe
npm run build   # vite library build
npm run typecheck
```

## License

MIT
