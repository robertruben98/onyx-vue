<script setup lang="ts">
// La pagina de un componente. UNA para los 22.
//
// Recibe el id por la ruta, busca sus metadatos en el registro y pinta lo
// mismo que pintaban las paginas escritas a mano: titulo, entradilla, indice,
// snippet de import, demos vivas con "show code" y tabla de API.
//
// La demo se compila desde su propio `code`: lo que se ve y lo que se ensena
// son el mismo texto, asi que no pueden separarse. Es lo que hace la libreria
// de Angular, donde el `code` de la demo es literalmente el template del
// componente que se renderiza.
import { computed, ref } from "vue";
import { docPorId } from "../registry";
import { demoComponent } from "../demo";
import CodeBlock from "../CodeBlock.vue";
import InlineText from "../InlineText.vue";

const props = defineProps<{ id: string }>();

const doc = computed(() => docPorId(props.id));

const importSnippet = computed(() =>
  doc.value ? `import { ${doc.value.imports.join(", ")} } from '@onyx/vue';` : "",
);

const demos = computed(() =>
  (doc.value?.demos ?? []).map((d) => ({ ...d, comp: demoComponent(d) })),
);

const open = ref<Record<string, boolean>>({});
function toggle(key: string) {
  open.value[key] = !open.value[key];
}
</script>

<template>
  <article v-if="doc" class="docs-page">
    <h1>{{ doc.title }}</h1>
    <p class="docs-lead"><InlineText :text="doc.description" /></p>

    <nav class="toc" aria-label="On this page">
      <a class="toc__link" href="#import">Import</a>
      <a class="toc__link" href="#examples">Examples</a>
      <a class="toc__link" href="#api">API</a>
    </nav>

    <h2 id="import">Import</h2>
    <CodeBlock :code="importSnippet" />

    <h2 id="examples">Examples</h2>
    <section
      v-for="demo in demos"
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
      <p v-if="demo.description" class="demo__desc"><InlineText :text="demo.description" /></p>

      <component :is="demo.comp" />

      <CodeBlock v-if="open[demo.title]" class="demo__code" :code="demo.code" />
    </section>

    <h2 id="api">API</h2>
    <!-- Con scroll propio: una tabla con tipos en <code> no encoge por debajo
         de su contenido, y sin esto ensanchaba la pagina entera en el movil. -->
    <div class="api-wrap" tabindex="0" role="region" aria-label="API">
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
        <tr v-for="row in doc.api" :key="row.name">
          <td><code>{{ row.name }}</code></td>
          <td><code>{{ row.type }}</code></td>
          <td><code>{{ row.default }}</code></td>
          <td><InlineText :text="row.description" /></td>
        </tr>
      </tbody>
    </table>
    </div>
  </article>

  <article v-else class="docs-page">
    <h1>Not documented</h1>
    <p class="docs-lead">There is no <code>{{ id }}.docs.ts</code> in the library.</p>
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
.demo__code {
  margin: 0;
  padding: 0 0.9rem 0.9rem;
}
.api-wrap {
  overflow-x: auto;
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
