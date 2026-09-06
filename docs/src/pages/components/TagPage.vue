<script setup lang="ts">
// Tag documentation page.
//
// Self-contained, additive page module (no shared registry/nav is edited).
// It mirrors the Angular Tag doc page anatomy: title + lead, an import
// snippet, live demos each with a collapsible "show code" panel, and an API
// table. Demos are rendered directly from the library's `tagDemos`, so the
// examples can never drift from the component's real props.
//
// The exported page id (route segment) is `tag`.
import { ref } from "vue";
import { UiTag, tagDemos } from "@onyx/vue";


const title = "Tag";
const description =
  "Compact label / chip in semantic variants, optionally removable via a close button.";

const importSnippet = `import { UiTag } from '@onyx/vue';`;

/** API table rows, ported from the Angular tag.docs.ts metadata. */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}
const api: ApiRow[] = [
  {
    name: "variant",
    type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
    default: "'neutral'",
    description: "Visual variant (semantic role).",
  },
  {
    name: "removable",
    type: "boolean",
    default: "false",
    description: "Shows a remove button.",
  },
  {
    name: "removeLabel",
    type: "string",
    default: "'Remove'",
    description: "Accessible name for the remove button.",
  },
  {
    name: "@removed",
    type: "() => void",
    default: "—",
    description: "Emitted when removed.",
  },
  {
    name: "default slot",
    type: "slot",
    default: "—",
    description: "Tag content (label text).",
  },
];

/** Whether a demo renders a removable tag.
 *
 * Vive aqui y no en la plantilla a proposito: `(demo.props as {...})` dentro de
 * un `v-if` no lo parsea vue-tsc con este tsconfig y rompe el build entero. */
function isRemovable(demo: (typeof tagDemos)[number]): boolean {
  return Boolean((demo.props as { removable?: boolean } | undefined)?.removable);
}

/** Build a concise, correct Vue usage snippet for a demo. */
function demoCode(demo: (typeof tagDemos)[number]): string {
  const attrs = Object.entries(demo.props ?? {})
    .map(([k, v]) =>
      typeof v === "string" ? `${k}="${v}"` : `:${k}="${JSON.stringify(v)}"`,
    )
    .join(" ");
  const removed = isRemovable(demo)
    ? ` @removed="onRemoved"`
    : "";
  const open = attrs ? `<UiTag ${attrs}${removed}>` : `<UiTag${removed}>`;
  return `${open}${demo.slot}</UiTag>`;
}

// Per-demo "show code" toggles, keyed by demo title.
const open = ref<Record<string, boolean>>({});
function toggle(key: string) {
  open.value[key] = !open.value[key];
}

// Live state for the interactive (removable) demo: tracks which removable
// tags are still visible, keyed by demo title.
const visible = ref<Record<string, boolean>>({});
function isVisible(title: string): boolean {
  return visible.value[title] !== false;
}
function onRemoved(title: string) {
  visible.value[title] = false;
}
function restore(title: string) {
  visible.value[title] = true;
}
</script>

<template>
  <article class="docs-page">
    <h1>{{ title }}</h1>
    <p class="docs-lead">{{ description }}</p>

    <nav class="toc" aria-label="On this page">
      <a class="toc__link" href="#import">Import</a>
      <a class="toc__link" href="#examples">Examples</a>
      <a class="toc__link" href="#api">API</a>
    </nav>

    <h2 id="import">Import</h2>
    <pre class="code"><code>{{ importSnippet }}</code></pre>

    <h2 id="examples">Examples</h2>
    <section
      v-for="demo in tagDemos"
      :key="demo.title"
      class="demo"
      :aria-label="demo.title"
    >
      <header class="demo__head">
        <h3 class="demo__title">{{ demo.title }}</h3>
        <button
          type="button"
          class="demo__toggle"
          :aria-expanded="!!open[demo.title]"
          @click="toggle(demo.title)"
        >
          {{ open[demo.title] ? "Hide code" : "Show code" }}
        </button>
      </header>
      <p v-if="demo.description" class="demo__desc">{{ demo.description }}</p>

      <div class="demo__preview">
        <template v-if="isRemovable(demo)">
          <UiTag
            v-if="isVisible(demo.title)"
            v-bind="demo.props"
            @removed="onRemoved(demo.title)"
            >{{ demo.slot }}</UiTag
          >
          <button
            v-else
            type="button"
            class="demo__toggle"
            @click="restore(demo.title)"
          >
            Restore
          </button>
        </template>
        <UiTag v-else v-bind="demo.props">{{ demo.slot }}</UiTag>
      </div>

      <pre v-if="open[demo.title]" class="code"><code>{{ demoCode(demo) }}</code></pre>
    </section>

    <h2 id="api">API</h2>
    <table class="api">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Default</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in api" :key="row.name">
          <td><code>{{ row.name }}</code></td>
          <td><code>{{ row.type }}</code></td>
          <td><code>{{ row.default }}</code></td>
          <td>{{ row.description }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<style scoped>
.docs-page {
  display: block;
  scroll-behavior: smooth;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}
.docs-lead {
  margin: 0 0 1.25rem;
  max-width: 60ch;
  font-size: 1.05rem;
  color: var(--ui-color-text-muted);
}
.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 2rem;
}
.toc__link {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--ui-color-border);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--ui-color-text-muted);
  background: var(--ui-color-surface);
}
.toc__link:hover {
  color: var(--ui-color-primary);
  border-color: var(--ui-color-primary);
}
.toc__link:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: 2px;
}
h2 {
  position: relative;
  margin: 2.5rem 0 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ui-color-border);
  font-size: 1.35rem;
  font-weight: 700;
  scroll-margin-top: 5rem;
}
.demo {
  margin: 0 0 1.5rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
}
.demo__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--ui-color-border);
  background: var(--ui-color-surface);
}
.demo__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}
.demo__toggle {
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--ui-color-text);
  background: transparent;
}
.demo__toggle:hover {
  border-color: var(--ui-color-primary);
  color: var(--ui-color-primary);
}
.demo__toggle:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: 2px;
}
.demo__desc {
  margin: 0.75rem 0.9rem 0;
  color: var(--ui-color-text-muted);
  font-size: 0.9rem;
}
.demo__preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 1.25rem 0.9rem;
}
.code {
  margin: 0;
  padding: 0.9rem;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border-top: 1px solid var(--ui-color-border);
}
h2 + .code {
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.api {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.api th,
.api td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--ui-color-border);
  vertical-align: top;
}
.api th {
  color: var(--ui-color-text-muted);
  font-weight: 600;
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
}
@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1.1rem;
    margin-top: 1.75rem;
  }
}
</style>
