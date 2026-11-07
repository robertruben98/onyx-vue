<script setup lang="ts">
// Buscador de la doc: "/" o Ctrl/Cmd+K. Un UiDialog con un UiInput y la lista
// de resultados como listbox (patron combobox: el foco se queda en la caja y
// `aria-activedescendant` apunta a la opcion activa).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { searchDocs } from "./search";

const router = useRouter();
const open = ref(false);
const query = ref("");
const active = ref(0);
const input = ref<{ focus: () => void } | null>(null);

const results = computed(() => searchDocs(query.value).slice(0, 50));
watch(query, () => (active.value = 0));

const listId = "docs-search-list";
const optionId = (i: number) => `docs-search-option-${i}`;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return (
    el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT"
  );
}

function onGlobalKey(event: KeyboardEvent) {
  const chord = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target);
  if (!chord && !slash) return;
  event.preventDefault();
  openSearch();
}

function openSearch() {
  query.value = "";
  open.value = true;
}
defineExpose({ openSearch });

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    input.value?.focus();
  }
});

function go(index: number) {
  const hit = results.value[index];
  if (!hit) return;
  open.value = false;
  router.push(hit.path);
}

function onInputKey(event: KeyboardEvent) {
  const n = results.value.length;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (n) active.value = (active.value + 1) % n;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (n) active.value = (active.value - 1 + n) % n;
  } else if (event.key === "Enter") {
    event.preventDefault();
    go(active.value);
  }
}

watch(active, async () => {
  await nextTick();
  document.getElementById(optionId(active.value))?.scrollIntoView?.({ block: "nearest" });
});

onMounted(() => document.addEventListener("keydown", onGlobalKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onGlobalKey));
</script>

<template>
  <UiDialog v-model:open="open" heading="Search the docs" size="md">
    <UiInput
      ref="input"
      v-model="query"
      icon="search"
      clearable
      fluid
      placeholder="Search components, patterns and guides"
      aria-label="Search the docs"
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :aria-expanded="results.length > 0 ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="results.length ? optionId(active) : undefined"
      @keydown="onInputKey"
    />
    <ul :id="listId" class="docs-search__list" role="listbox" aria-label="Results">
      <li
        v-for="(hit, i) in results"
        :id="optionId(i)"
        :key="hit.path"
        role="option"
        class="docs-search__option"
        :class="{ 'docs-search__option--active': i === active }"
        :aria-selected="i === active"
        @mousemove="active = i"
        @click="go(i)"
      >
        <span class="docs-search__label">{{ hit.label }}</span>
        <span class="docs-search__group">{{ hit.group }}</span>
      </li>
    </ul>
    <p v-if="!results.length" class="docs-search__empty" role="status">
      No page matches "{{ query }}".
    </p>
  </UiDialog>
</template>

<style>
/* Sin `scoped`: el dialogo se teletransporta a <body>. */
.docs-search__list {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  max-height: min(50vh, 22rem);
  overflow-y: auto;
}
.docs-search__option {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--ui-radius);
  cursor: pointer;
}
.docs-search__option--active {
  color: var(--ui-color-primary);
  background: var(--ui-color-surface-hover, transparent);
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: -2px;
}
.docs-search__group {
  font-size: 0.75rem;
  color: var(--ui-color-text-muted);
}
.docs-search__empty {
  margin: 0.75rem 0 0;
  color: var(--ui-color-text-muted);
}
</style>
