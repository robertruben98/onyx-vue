<script setup lang="ts">
import { ref } from "vue";
import { NAV } from "./nav";

// Dark-mode toggle, persisted (the pre-paint script in index.html reads this).
const dark = ref(
  typeof localStorage !== "undefined" &&
    localStorage.getItem("onyx-dark") === "true",
);

function toggleDark() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle("app-dark", dark.value);
  try {
    localStorage.setItem("onyx-dark", String(dark.value));
  } catch {
    /* ignore */
  }
}

// Presets de cliente. La clase va en <html>, no en un contenedor de aqui
// dentro: Dialog, Select, Tooltip, Popover y Menu hacen `<Teleport to="body">`
// y desde un div interior saldrian del ambito del tema.
const PRESETS = [
  { id: "default", label: "Default" },
  { id: "acme", label: "Acme" },
  { id: "console", label: "Console" },
] as const;

const preset = ref(
  (typeof localStorage !== "undefined" &&
    localStorage.getItem("onyx-preset")) ||
    "default",
);

function applyPreset(id: string) {
  const root = document.documentElement;
  for (const p of PRESETS) root.classList.remove(`ui-theme-${p.id}`);
  if (id !== "default") root.classList.add(`ui-theme-${id}`);
  preset.value = id;
  try {
    localStorage.setItem("onyx-preset", id);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="docs">
    <aside class="docs__sidebar">
      <RouterLink class="docs__brand" to="/introduction">Onyx UI</RouterLink>
      <button type="button" class="docs__theme" @click="toggleDark">
        {{ dark ? "Light mode" : "Dark mode" }}
      </button>
      <label class="docs__preset">
        <span class="docs__preset-label">Preset</span>
        <select
          class="docs__preset-select"
          :value="preset"
          @change="applyPreset(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="p in PRESETS" :key="p.id" :value="p.id">
            {{ p.label }}
          </option>
        </select>
      </label>
      <nav class="docs__nav" aria-label="Documentation">
        <div v-for="section in NAV" :key="section.title" class="docs__section">
          <h2 class="docs__section-title">{{ section.title }}</h2>
          <ul class="docs__list">
            <li v-for="item in section.items" :key="item.path">
              <RouterLink
                class="docs__link"
                active-class="docs__link--active"
                :to="item.path"
                >{{ item.label }}</RouterLink
              >
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <main class="docs__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.docs {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  color: var(--ui-color-text);
  background: var(--ui-color-background, var(--ui-color-surface));
}
.docs__preset {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0 4px;
}
.docs__preset-label {
  font-size: 11px;
  color: var(--ui-color-text-muted);
}
.docs__preset-select {
  font: inherit;
  font-size: 13px;
  padding: 6px 8px;
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border: var(--ui-border-width) solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.docs__sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  padding: 1.25rem 1rem;
  border-right: 1px solid var(--ui-color-border);
  background: var(--ui-color-surface);
}
.docs__brand {
  display: block;
  font-size: 1.15rem;
  font-weight: 800;
  text-decoration: none;
  color: var(--ui-color-text);
}
.docs__theme {
  margin: 0.75rem 0 1.25rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--ui-color-text);
  background: transparent;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.docs__section + .docs__section {
  margin-top: 1.5rem;
}
.docs__section-title {
  margin: 0 0 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ui-color-text-muted);
}
.docs__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.docs__link {
  display: block;
  padding: 0.3rem 0.5rem;
  border-radius: var(--ui-radius);
  font-size: 0.9rem;
  text-decoration: none;
  color: var(--ui-color-text-muted);
}
.docs__link:hover {
  color: var(--ui-color-text);
  background: var(--ui-color-background, transparent);
}
.docs__link--active {
  color: var(--ui-color-primary);
  font-weight: 600;
}
.docs__main {
  padding: 2rem clamp(1rem, 4vw, 3rem);
  max-width: 70rem;
}
@media (max-width: 720px) {
  .docs {
    grid-template-columns: 1fr;
  }
  .docs__sidebar {
    position: static;
    height: auto;
  }
}
</style>
