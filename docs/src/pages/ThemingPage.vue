<script setup lang="ts">
// Theming guide page.
import { UiButton, UiDataTable, UiPanel, UiTag } from "@onyx/vue";
import type { DataTableColumn } from "@onyx/vue";
import CodeBlock from "../CodeBlock.vue";
import { DARK_SNIPPET, PRESET_SNIPPET, SEMANTIC_SNIPPET, semanticTokens } from "../tokens";

const groups = semanticTokens();

// One entry per preset stylesheet in src/styles. The test compares this list
// with the `.ui-theme-*` classes those files define.
const PRESETS = [
  { id: "acme", note: "Violet brand, pill radius. The example client preset: it changes colour and shape only." },
  { id: "console", note: "Monospace console look; opt in to sans body with data-typography=\"mixed\"." },
  { id: "matrix", note: "Phosphor green on black, for run views." },
  { id: "classroom", note: "Light learning pages on paper, with a night variant." },
  { id: "pocket", note: "Web apps used as phone apps; system fonts, night variant." },
  { id: "chat", note: "Messaging apps; light by default, night variant, Roboto Variable." },
];

interface Run {
  id: string;
  label: string;
  ms: number;
}
const runs: Run[] = [
  { id: "a1b2c3d", label: "Deploy finished", ms: 1280 },
  { id: "e4f5a6b", label: "Tests passed", ms: 342 },
];
const columns: DataTableColumn<Run>[] = [
  { id: "label", header: "Run", field: "label" },
  { id: "id", header: "Commit", field: "id", mono: true },
  { id: "ms", header: "ms", field: "ms", mono: true, align: "end" },
];
const typography = `/* Role tokens, defined by every preset */
--ui-font-family-body   /* reading text: paragraphs, titles, labels */
--ui-font-family-data   /* identifiers, hashes, numbers, code */
--ui-font-family        /* alias of body, kept for compatibility */

<html class="ui-theme-console" data-typography="mixed">`;

</script>

<template>
  <article class="guide">
    <h1>Theming</h1>
    <p class="docs-lead">
      Onyx is driven by three token levels — primitive, semantic and component.
      Components read only semantic/component tokens, so re-skinning a client
      means editing tokens, never components.
    </p>

    <h2>Semantic tokens</h2>
    <p>The semantic layer is what a preset overrides.</p>
    <CodeBlock :code="SEMANTIC_SNIPPET" />
    <p>
      Every token below is generated from <code>src/styles/tokens.css</code>; the
      values are the base theme's, and a preset or dark mode re-maps them.
    </p>
    <details v-for="group in groups" :key="group.title" class="tokens">
      <summary>{{ group.title }} ({{ group.tokens.length }})</summary>
      <div class="tokens__wrap" tabindex="0" role="region" :aria-label="`${group.title} tokens`">
        <table class="tokens__table" :aria-label="`${group.title} token values`">
          <thead>
            <tr><th scope="col">Token</th><th scope="col">Base value</th></tr>
          </thead>
          <tbody>
            <tr v-for="[name, value] in group.tokens" :key="name">
              <td><code>{{ name }}</code></td>
              <td><code>{{ value }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <h2>Client presets</h2>
    <p>A preset re-maps semantic tokens under a theme class. One client = one preset.</p>
    <CodeBlock :code="PRESET_SNIPPET" />
    <p>The six presets that ship in <code>src/styles</code>. Pick one in the sidebar to see the whole site in it.</p>
    <div class="presets">
      <section
        v-for="p in PRESETS"
        :key="p.id"
        :class="['ui-theme-' + p.id, 'presets__card']"
        :data-preset="p.id"
        :aria-label="p.id + ' preset'"
      >
        <h3 class="presets__name">{{ p.id }}</h3>
        <p class="presets__note">{{ p.note }}</p>
        <div class="presets__row">
          <UiButton>Primary</UiButton>
          <UiTag>tag</UiTag>
        </div>
        <code class="presets__use">class="ui-theme-{{ p.id }}"</code>
      </section>
    </div>

    <h2>Body and data typography</h2>
    <p>
      A preset sets two font families: body for reading text and data for
      identifiers, hashes, numbers and code. The console preset keeps its
      all-monospace look by default; add <code>data-typography="mixed"</code>
      to get a sans body with monospace data (use <code>mono</code> on a
      <code>UiDataTable</code> column or a <code>UiTag</code>).
    </p>
    <CodeBlock :code="typography" />
    <div class="typo">
      <div class="ui-theme-console typo__box">
        <UiPanel title="Console (default)">
          <p class="typo__p">Everything is monospace, as before.</p>
          <UiDataTable caption="Runs, default" :columns="columns" :rows="runs" row-key="id" />
        </UiPanel>
      </div>
      <div class="ui-theme-console typo__box" data-typography="mixed">
        <UiPanel title="Console (mixed)">
          <p class="typo__p">Sans body, monospace commit and numbers.</p>
          <UiDataTable caption="Runs, mixed" :columns="columns" :rows="runs" row-key="id" />
        </UiPanel>
      </div>
    </div>

    <h2>Dark mode</h2>
    <p>Dark mode is a class that re-maps semantic tokens — no component branches.</p>
    <CodeBlock :code="DARK_SNIPPET" />
  </article>
</template>

<style scoped>
.guide h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}
.docs-lead {
  margin: 0 0 2rem;
  max-width: 62ch;
  font-size: 1.05rem;
  color: var(--ui-color-text-muted);
}
.guide h2 {
  margin: 2.5rem 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
}
.guide p {
  max-width: 64ch;
}
.typo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  gap: 1rem;
  margin: 0.75rem 0;
}
.typo__box {
  padding: 0.75rem;
  background: var(--ui-color-bg, #000);
  color: var(--ui-color-text);
  border: 1px solid var(--ui-color-border);
}
.typo__p {
  margin: 0 0 0.5rem;
}
.tokens {
  margin: 0.5rem 0;
}
.tokens summary {
  cursor: pointer;
  font-weight: 600;
}
.tokens summary:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: 2px;
}
.tokens__wrap {
  overflow-x: auto;
  margin-top: 0.5rem;
}
.tokens__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.tokens__table th,
.tokens__table td {
  text-align: left;
  padding: 0.35rem 0.6rem;
  border-bottom: 1px solid var(--ui-color-border);
  overflow-wrap: anywhere;
}
.tokens__table th {
  color: var(--ui-color-text-muted);
}
.presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
  margin: 0.75rem 0;
}
.presets__card {
  padding: 1rem;
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.presets__name {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  text-transform: capitalize;
}
.presets__note {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: var(--ui-color-text-muted);
}
.presets__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.presets__use {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--ui-color-text-muted);
}
</style>
