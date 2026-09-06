<script setup lang="ts">
// Button documentation page.
//
// Mismo molde que las demas paginas de componente: titulo + entradilla,
// snippet de import, demos vivas con "show code" y tabla de API. Las demos
// salen de `buttonDemos`, de modo que los ejemplos no pueden separarse de lo
// que el componente hace de verdad.
//
// El id de pagina (segmento de ruta) es `button`.
import { ref } from "vue";
import { UiButton, buttonDemos } from "@onyx/vue";

const title = "Button";
const description =
  "Action control with primary, secondary, danger and text variants, three sizes, and disabled and loading states.";

const importSnippet = `import { UiButton } from '@onyx/vue';`;

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}
const api: ApiRow[] = [
  {
    name: "variant",
    type: "'primary' | 'secondary' | 'danger' | 'text'",
    default: "'primary'",
    description:
      "Visual variant. `danger` is for destructive actions: flat ink with a border at rest, filling with colour only on hover.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Control height, taken from the size tokens.",
  },
  {
    name: "type",
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: "Native button type.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "A disabled button never emits `clicked`.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Shows a spinner, sets `aria-busy` and suppresses interaction — a loading button does not emit `clicked` either.",
  },
  {
    name: "clicked",
    type: "event: (event: MouseEvent) => void",
    default: "—",
    description: "Emitted on activation, only while interactive.",
  },
  {
    name: "default slot",
    type: "slot",
    default: "—",
    description: "Button label.",
  },
];

/** Snippet de uso conciso y correcto para una demo. */
function demoCode(demo: (typeof buttonDemos)[number]): string {
  const attrs = Object.entries(demo.props ?? {})
    .map(([k, v]) =>
      typeof v === "string" ? `${k}="${v}"` : `:${k}="${JSON.stringify(v)}"`,
    )
    .join(" ");
  const open = attrs ? `<UiButton ${attrs}>` : `<UiButton>`;
  return `${open}${demo.slot}</UiButton>`;
}

const open = ref<Record<string, boolean>>({});
function toggle(key: string) {
  open.value[key] = !open.value[key];
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
      v-for="demo in buttonDemos"
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
        <UiButton v-bind="demo.props">{{ demo.slot }}</UiButton>
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
