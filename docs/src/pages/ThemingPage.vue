<script setup lang="ts">
// Theming guide page.
import { UiDataTable, UiPanel } from "@onyx/vue";
import type { DataTableColumn } from "@onyx/vue";

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
const semantic = `:root {
  --ui-color-primary: var(--ui-blue-600);
  --ui-color-surface:  var(--ui-gray-50);
  --ui-color-text:     var(--ui-gray-900);
  --ui-radius:         var(--ui-radius-md);
}`;

const preset = `/* themes/acme.css — one client = one preset */
.ui-theme-acme {
  --ui-color-primary: var(--ui-violet-600);
  --ui-radius:        var(--ui-radius-lg);
}`;

const typography = `/* Role tokens, defined by every preset */
--ui-font-family-body   /* reading text: paragraphs, titles, labels */
--ui-font-family-data   /* identifiers, hashes, numbers, code */
--ui-font-family        /* alias of body, kept for compatibility */

<html class="ui-theme-console" data-typography="mixed">`;

const darkCss = `.app-dark {
  --ui-color-surface: var(--ui-gray-900);
  --ui-color-text:    var(--ui-gray-50);
}`;
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
    <pre class="code"><code>{{ semantic }}</code></pre>

    <h2>Client presets</h2>
    <p>A preset re-maps semantic tokens under a theme class. One client = one preset.</p>
    <pre class="code"><code>{{ preset }}</code></pre>

    <h2>Body and data typography</h2>
    <p>
      A preset sets two font families: body for reading text and data for
      identifiers, hashes, numbers and code. The console preset keeps its
      all-monospace look by default; add <code>data-typography="mixed"</code>
      to get a sans body with monospace data (use <code>mono</code> on a
      <code>UiDataTable</code> column or a <code>UiTag</code>).
    </p>
    <pre class="code"><code>{{ typography }}</code></pre>
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
    <pre class="code"><code>{{ darkCss }}</code></pre>
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
.code {
  margin: 0.75rem 0;
  padding: 0.9rem;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
</style>
