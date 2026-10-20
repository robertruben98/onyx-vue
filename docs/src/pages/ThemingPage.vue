<script setup lang="ts">
// Theming guide page.
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
