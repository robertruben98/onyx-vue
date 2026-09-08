<script setup lang="ts">
// Installation guide page.
const install = `npm install @onyx/vue`;

const register = `// main.ts — register the components plugin or import directly.
import { createApp } from 'vue';
import App from './App.vue';
import '@onyx/vue/styles.css'; // token stylesheet (CSS variables)

createApp(App).mount('#app');`;

const usage = `<script setup lang="ts">
import { UiButton, UiInput } from '@onyx/vue';
<\/script>

<template>
  <UiInput placeholder="Email" />
  <UiButton @click="submit">Sign in</UiButton>
</template>`;

const dark = `// Toggle dark mode from anywhere
document.documentElement.classList.toggle('app-dark');`;
</script>

<template>
  <article class="guide">
    <h1>Installation</h1>
    <p class="docs-lead">
      Onyx UI ships standalone Vue components and a token-based theme. Add the
      package, register the CSS once, then import components where you use them.
    </p>

    <h2>1. Install</h2>
    <pre class="code"><code>{{ install }}</code></pre>

    <h2>2. Register the styles</h2>
    <p>Import the token stylesheet once at your application entry.</p>
    <pre class="code"><code>{{ register }}</code></pre>

    <h2>3. Use a component</h2>
    <p>Import components directly into any SFC — no global registration needed.</p>
    <pre class="code"><code>{{ usage }}</code></pre>

    <h2>4. Enable dark mode</h2>
    <p>
      Dark mode is a class on the document root that re-maps semantic tokens —
      components never branch on theme.
    </p>
    <pre class="code"><code>{{ dark }}</code></pre>

    <div class="guide__next">
      <RouterLink class="guide__link" to="/theming"
        >Continue to Theming →</RouterLink
      >
    </div>
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
.guide__next {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ui-color-border);
}
.guide__link {
  font-weight: 600;
  color: var(--ui-color-primary);
  text-decoration: none;
}
</style>
