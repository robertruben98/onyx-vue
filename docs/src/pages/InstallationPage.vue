<script setup lang="ts">
import { DEPRECATED_EVENTS } from "../../../src/deprecations";
import { LEGACY_TONES } from "../../../src/internal/tone";
// Installation guide page.
const install = `npm install @onyx/vue`;

const register = `// main.ts — register the components plugin or import directly.
import { createApp } from 'vue';
import App from './App.vue';
import '@onyx/vue/styles.css'; // token stylesheet (CSS variables)

createApp(App).mount('#app');`;

const usage = `<script setup lang="ts">
import { DEPRECATED_EVENTS } from "../../../src/deprecations";
import { LEGACY_TONES } from "../../../src/internal/tone";
import { UiButton, UiInput } from '@onyx/vue';
<\/script>

<template>
  <UiInput placeholder="Email" />
  <UiButton @click="submit">Sign in</UiButton>
</template>`;

const localization = `// main.ts
import { createApp } from 'vue';
import { provideOnyxLocale, ES_MESSAGES } from 'onyx-vue';
import App from './App.vue';

const app = createApp(App);
provideOnyxLocale(ES_MESSAGES, app);
app.mount('#app');`;

const localeSetup = `// App.vue — inside setup
import { provideOnyxLocale, DEFAULT_MESSAGES, type OnyxMessages } from 'onyx-vue';

const messages: OnyxMessages = {
  ...DEFAULT_MESSAGES,
  selectPlaceholder: 'Choose an option…',
  dialogCloseLabel: 'Close dialog',
};
provideOnyxLocale(messages);`;

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

    <h2 id="localization">Localization</h2>
    <p>
      Set the library's default texts once with <code>provideOnyxLocale</code>.
      Pass <code>ES_MESSAGES</code> for Spanish, or build a typed
      <code>OnyxMessages</code> catalog by spreading <code>DEFAULT_MESSAGES</code>
      (English). This covers visible defaults and accessible names, including
      teleported dialogs, table controls, state announcements and time units.
    </p>
    <pre class="code"><code>{{ localization }}</code></pre>
    <p>
      Alternatively, call it synchronously in a root or ancestor component's setup.
      It applies to descendants; the nearest provider wins. Explicit component
      text props and slots take precedence; existing empty-string fallbacks are unchanged.
    </p>
    <pre class="code"><code>{{ localeSetup }}</code></pre>
    <p>
      Configure the locale before mounting consumers. Prop defaults are resolved
      when a component is created; changing the catalog is not a live language
      switch. Nested catalogs, such as <code>relativeTimeUnits</code>,
      <code>metricChipDeltaLabels</code> and <code>countdownUnitLabels</code>,
      must retain all their fields. Keep placeholder tokens such as
      <code>{n}</code> and <code>{label}</code> in translated messages.
    </p>
    <p>
      Without a provider, existing English defaults are used. UiStateBar now
      defaults to “Run progress” and announces “of” and “pending” in English.
      Supplied content and date/number formatting are unchanged. Exported pure
      formatters and their default constants remain English; pass translated
      units explicitly when calling them outside components.
      <code>speakCountdown(parts, labels, conjunction)</code> also accepts a
      translated conjunction (English: “and”).
    </p>

    <h2 id="deprecations">Deprecations and 1.0</h2>
    <p>
      Legacy tones and event names remain supported until 1.0. In development,
      each deprecated tone or event name warns once per page load. Event warnings
      only appear when you listen to the old name, including a once listener.
      Production builds do not run these warnings. Replace old names now to
      prepare for their removal in 1.0.
    </p>
    <p>Renamed events still emit the new name first, then the old name.</p>
    <table aria-label="Deprecated tones">
      <thead><tr><th>Old tone</th><th>Use instead</th></tr></thead>
      <tbody>
        <tr v-for="(replacement, name) in LEGACY_TONES" :key="name">
          <td><code>{{ name }}</code></td><td><code>{{ replacement }}</code></td>
        </tr>
      </tbody>
    </table>
    <table aria-label="Deprecated events">
      <thead><tr><th>Old event</th><th>Use instead</th></tr></thead>
      <tbody>
        <tr v-for="(replacement, name) in DEPRECATED_EVENTS" :key="name">
          <td><code>{{ name }}</code></td><td><code>{{ replacement }}</code></td>
        </tr>
      </tbody>
    </table>

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
