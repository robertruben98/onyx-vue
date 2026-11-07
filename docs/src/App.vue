<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { UiCrtOverlay, UiDigitalRain, UiSegmented } from "@onyx/vue";
import { NAV } from "./nav";
import DocSearch from "./DocSearch.vue";

// Modo de color: System / Light / Dark, persistido (el script de pre-pintado de
// index.html lee la misma clave). "true"/"false" son los valores historicos de
// la clave; cualquier otra cosa, o ninguna, es "seguir al sistema".
type Mode = "system" | "light" | "dark";
const MODES = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function modeFromStored(v: string | null): Mode {
  return v === "true" ? "dark" : v === "false" ? "light" : "system";
}
function read(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

const mode = ref<Mode>(modeFromStored(read("onyx-dark")));
const prefersDark =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function applyMode() {
  const dark = mode.value === "dark" || (mode.value === "system" && !!prefersDark?.matches);
  document.documentElement.classList.toggle("app-dark", dark);
}

function setMode(value: string) {
  mode.value = value as Mode;
  applyMode();
  try {
    localStorage.setItem("onyx-dark", value === "dark" ? "true" : value === "light" ? "false" : "system");
  } catch {
    /* ignore */
  }
}
prefersDark?.addEventListener?.("change", applyMode);
onBeforeUnmount(() => prefersDark?.removeEventListener?.("change", applyMode));

// Presets de cliente. La clase va en <html>, no en un contenedor de aqui
// dentro: Dialog, Select, Tooltip, Popover y Menu hacen `<Teleport to="body">`
// y desde un div interior saldrian del ambito del tema.
const PRESETS = [
  { id: "default", label: "Default" },
  { id: "acme", label: "Acme" },
  { id: "console", label: "Console" },
  { id: "matrix", label: "Matrix" },
  { id: "classroom", label: "Classroom" },
  { id: "pocket", label: "Pocket" },
  { id: "chat", label: "Chat" },
] as const;

const preset = ref(
  (typeof localStorage !== "undefined" &&
    localStorage.getItem("onyx-preset")) ||
    "default",
);

/**
 * La atmosfera del preset `matrix` para TODA la doc.
 *
 * No vive en el tema a proposito: un preset re-mapea tokens, y colgarle un
 * canvas animado a cualquier pagina que lo active seria decidir por el
 * consumidor. Aqui, en cambio, la doc SI quiere ensenar el tema entero — sin la
 * lluvia y las scanlines el preset se lee como "verde sobre negro" y no como la
 * pantalla que es.
 */
const atmosfera = computed(() => preset.value === "matrix");

function setPresetClass(id: string) {
  const root = document.documentElement;
  for (const p of PRESETS) root.classList.remove(`ui-theme-${p.id}`);
  if (id !== "default") root.classList.add(`ui-theme-${id}`);
  preset.value = id;
}

function applyPreset(id: string) {
  setPresetClass(id);
  try {
    localStorage.setItem("onyx-preset", id);
  } catch {
    /* ignore */
  }
}

/**
 * La vista previa de un pattern es esta misma app dentro de un iframe. El
 * script de pre-pintado de index.html le pone el tema al cargar, pero un cambio
 * posterior en la pagina de fuera no le llegaria. `storage` salta en los OTROS
 * documentos del mismo origen cuando uno escribe en localStorage, asi que el
 * marco sigue al selector sin recargar.
 */
function onStorage(event: StorageEvent) {
  if (event.key === "onyx-preset") setPresetClass(event.newValue || "default");
  if (event.key === "onyx-dark") {
    mode.value = modeFromStored(event.newValue);
    applyMode();
  }
}
window.addEventListener("storage", onStorage);
onBeforeUnmount(() => window.removeEventListener("storage", onStorage));

// El marco de un pattern (`meta.bare`) se pinta sin la barra lateral.
const route = useRoute();
const bare = computed(() => route.meta.bare === true);

// Menu movil: por debajo de 900 px la barra lateral es un cajon. Cerrado, esta
// `visibility: hidden` (ni foco ni lector de pantalla), y se cierra solo al
// navegar o con Escape.
const menuOpen = ref(false);
const sidebar = ref<HTMLElement | null>(null);
const search = ref<{ openSearch: () => void } | null>(null);
const mainEl = ref<HTMLElement | null>(null);

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
);
watch(menuOpen, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  sidebar.value?.querySelector<HTMLElement>("a, button, select")?.focus();
});

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && menuOpen.value) menuOpen.value = false;
}
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));

/** Salto al contenido. Un `href="#..."` en un router de historial navegaria, asi que se enfoca a mano. */
function skipToContent(event: Event) {
  event.preventDefault();
  mainEl.value?.focus();
  mainEl.value?.scrollIntoView?.();
}
</script>

<template>
  <!-- Opacidad mas baja que en una vista de ejecucion: estas paginas son texto
       largo, y por encima de ~0.15 la lluvia empieza a competir con lo que hay
       que leer.

       Las scanlines, mas bajas todavia. Multiplican, asi que solo se ven sobre
       lo claro — y en una galeria de componentes lo claro son los rellenos
       solidos de los botones, que a 0.16 salian a rayas y parecian un fallo de
       pintado en vez de un tubo. A 0.09 el tubo sigue ahi y el boton no. -->
  <UiDigitalRain v-if="atmosfera" :opacity="0.13" />
  <UiCrtOverlay v-if="atmosfera" :scanlines="0.09" :vignette="0.5" />

  <RouterView v-if="bare" />

  <div v-else class="docs">
    <a class="docs__skip" href="#main-content" @click="skipToContent">Skip to content</a>

    <header class="docs__topbar">
      <button
        type="button"
        class="docs__menu"
        aria-controls="docs-sidebar"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? "Close menu" : "Menu" }}
      </button>
      <RouterLink class="docs__brand" to="/introduction">Onyx UI</RouterLink>
      <button type="button" class="docs__search docs__search--top" @click="search?.openSearch()">
        Search
      </button>
    </header>
    <div v-if="menuOpen" class="docs__scrim" @click="menuOpen = false"></div>

    <aside id="docs-sidebar" ref="sidebar" class="docs__sidebar" :class="{ 'docs__sidebar--open': menuOpen }">
      <RouterLink class="docs__brand docs__brand--side" to="/introduction">Onyx UI</RouterLink>
      <button type="button" class="docs__search" @click="search?.openSearch()">
        <span>Search</span>
        <kbd class="docs__kbd" aria-hidden="true">/</kbd>
      </button>
      <div class="docs__mode">
        <UiSegmented
          :model-value="mode"
          :options="MODES"
          aria-label="Color mode"
          size="sm"
          fluid
          @update:model-value="setMode"
        />
      </div>
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

    <main id="main-content" ref="mainEl" class="docs__main" tabindex="-1">
      <RouterView />
    </main>
  </div>

  <DocSearch ref="search" />
</template>

<style scoped>
.docs {
  display: grid;
  /* `minmax(0, 1fr)` y no `1fr`: una pista `1fr` crece hasta el ancho minimo
     de su contenido, y un bloque de codigo o la tabla de API ensanchaban la
     pagina entera en el movil (a 360 px median 416-585 px). */
  grid-template-columns: 240px minmax(0, 1fr);
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
.docs__mode {
  margin: 0.75rem 0 0.5rem;
}
.docs__search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--ui-color-text-muted);
  background: transparent;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.docs__search:hover {
  color: var(--ui-color-text);
  border-color: var(--ui-color-primary);
}
.docs__search--top {
  width: auto;
  margin: 0 0 0 auto;
}
.docs__kbd {
  padding: 0 0.4rem;
  font-family: var(--docs-mono);
  font-size: 0.75rem;
  border: 1px solid var(--ui-color-border);
  border-radius: 4px;
}
.docs__skip {
  position: absolute;
  top: 0;
  left: 0.5rem;
  z-index: 100;
  padding: 0.5rem 0.9rem;
  font-weight: 600;
  color: var(--ui-color-on-primary, #fff);
  background: var(--ui-color-primary);
  border-radius: 0 0 var(--ui-radius) var(--ui-radius);
  transform: translateY(-120%);
}
.docs__skip:focus {
  transform: translateY(0);
}
.docs__topbar,
.docs__scrim {
  display: none;
}
.docs__menu {
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--ui-color-text);
  background: transparent;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.docs__main:focus {
  outline: none;
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
@media (max-width: 900px) {
  .docs {
    grid-template-columns: minmax(0, 1fr);
  }
  .docs__topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: var(--ui-color-surface);
    border-bottom: 1px solid var(--ui-color-border);
  }
  .docs__brand--side {
    display: none;
  }
  .docs__scrim {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: block;
    background: rgba(0, 0, 0, 0.45);
  }
  .docs__sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    width: min(20rem, 85vw);
    height: 100vh;
    height: 100dvh;
    visibility: hidden;
    transform: translateX(-100%);
    transition: transform 0.2s ease, visibility 0.2s;
  }
  .docs__sidebar--open {
    visibility: visible;
    transform: none;
  }
  .docs__search:not(.docs__search--top) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .docs__sidebar {
    transition: none;
  }
}
</style>
