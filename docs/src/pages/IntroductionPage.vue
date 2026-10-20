<script setup lang="ts">
// Introduction / home guide page.
const features = [
  {
    title: "Token-driven theming",
    body: "A client is a preset. Re-skin the whole library by re-mapping semantic tokens — never by editing a component.",
  },
  {
    title: "Accessible by default",
    body: "Keyboard operable, visible focus, correct ARIA roles and zero axe violations in every component.",
  },
  {
    title: "Vue 3, styled mode",
    body: "Standalone SFCs with the Composition API, scoped styles and CSS-variable theming.",
  },
];
</script>

<template>
  <article class="guide">
    <h1>Onyx UI for Vue</h1>
    <p class="docs-lead">
      Accessible, token-themed Vue components in styled mode. The core feature is
      not the component count — it is the theming engine: one client equals one
      preset.
    </p>

    <h2>Why Onyx</h2>
    <ul class="guide__cards">
      <li v-for="f in features" :key="f.title" class="guide__card">
        <h3>{{ f.title }}</h3>
        <p>{{ f.body }}</p>
      </li>
    </ul>

    <div class="guide__next">
      <RouterLink class="guide__link" to="/installation"
        >Continue to Installation →</RouterLink
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
  margin: 2.5rem 0 1rem;
  font-size: 1.35rem;
  font-weight: 700;
}
.guide__cards {
  display: grid;
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.guide__card {
  padding: 1.1rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  background: var(--ui-color-surface);
}
.guide__card h3 {
  margin: 0 0 0.4rem;
  font-size: 1rem;
}
.guide__card p {
  margin: 0;
  color: var(--ui-color-text-muted);
  font-size: 0.9rem;
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
