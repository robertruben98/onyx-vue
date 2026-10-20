<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from "vue";
import "./app-bar.scss";

/**
 * The bar across the top of a console page: what you are looking at on the
 * left, how things stand in the middle, and what you can do on the right.
 *
 * It wraps instead of overflowing. A console bar collects things over time —
 * a budget meter, a token chip, a stamp, three buttons — and at some width
 * they stop fitting; a second row is readable, a horizontal scrollbar across
 * the whole page is not.
 *
 * On a phone even the second row is too much: a sticky bar with a theme
 * switch, two buttons and an account line ate half of a 740px screen (the
 * English trainer, 2026-10-20). With `collapseBelow`, under that width the
 * status and the actions move behind a menu button and the brand keeps one
 * line per row, truncated.
 */
const props = withDefaults(
  defineProps<{
    /** What the page shows. Rendered as the page's heading. */
    title?: string;
    /** Secondary line beside the title: a repo, a host, a count. */
    subtitle?: string;
    /** Small caps line above the title. */
    eyebrow?: string;
    /** Heading level of the title. `0` renders it as plain text. */
    headingLevel?: 0 | 1 | 2 | 3;
    /** Sticks the bar to the top of the scrolling page. */
    sticky?: boolean;
    /**
     * Viewport width (px) under which status and actions fold into a menu
     * button. `0` never folds.
     */
    collapseBelow?: number;
    /** Accessible name of the menu button. */
    menuLabel?: string;
  }>(),
  {
    title: "",
    subtitle: "",
    eyebrow: "",
    headingLevel: 1,
    sticky: true,
    collapseBelow: 0,
    menuLabel: "Menu",
  },
);

const slots = useSlots();
const menuId = `ui-app-bar-menu-${useId()}`;
const root = ref<HTMLElement | null>(null);
const narrow = ref(false);
const open = ref(false);
let query: MediaQueryList | null = null;

const hasMenu = computed(() => narrow.value && !!(slots.status || slots.actions));

function onQuery(e: MediaQueryListEvent | MediaQueryList): void {
  narrow.value = e.matches;
}

function watchWidth(): void {
  query?.removeEventListener("change", onQuery);
  query = null;
  narrow.value = false;
  if (props.collapseBelow > 0 && typeof window !== "undefined" && window.matchMedia) {
    query = window.matchMedia(`(max-width: ${props.collapseBelow - 0.02}px)`);
    onQuery(query);
    query.addEventListener("change", onQuery);
  }
}

// Cerrar: Escape, un toque fuera de la barra, o elegir un boton/enlace del menu
// (un selector dentro del menu, como el de tema, no lo cierra: se ve el cambio).
function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape" && open.value) open.value = false;
}
function onPointer(e: Event): void {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false;
}
function onMenuClick(e: MouseEvent): void {
  if ((e.target as HTMLElement).closest("button, a")) open.value = false;
}

watch(narrow, (v) => { if (!v) open.value = false; });
watch(() => props.collapseBelow, watchWidth);
onMounted(() => {
  watchWidth();
  document.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onPointer);
});
onBeforeUnmount(() => {
  query?.removeEventListener("change", onQuery);
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("pointerdown", onPointer);
});

const titleTag = computed(() =>
  props.headingLevel === 0 ? "span" : `h${props.headingLevel}`,
);

const rootClasses = computed(() => ({
  "ui-app-bar": true,
  "ui-app-bar--sticky": props.sticky,
  "ui-app-bar--collapsed": hasMenu.value,
}));
</script>

<template>
  <header ref="root" :class="rootClasses">
    <div class="ui-app-bar__brand">
      <slot name="brand">
        <span v-if="eyebrow" class="ui-app-bar__eyebrow">{{ eyebrow }}</span>
        <span class="ui-app-bar__heading">
          <component :is="titleTag" v-if="title" class="ui-app-bar__title">{{ title }}</component>
          <span v-if="subtitle" class="ui-app-bar__subtitle">{{ subtitle }}</span>
        </span>
      </slot>
    </div>
    <div class="ui-app-bar__gap" />
    <template v-if="hasMenu">
      <button
        type="button"
        class="ui-app-bar__toggle"
        :aria-expanded="open"
        :aria-controls="menuId"
        :aria-label="menuLabel"
        @click="open = !open"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path v-if="open" d="M6 6l12 12M18 6L6 18" />
          <path v-else d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div v-show="open" :id="menuId" class="ui-app-bar__menu" @click="onMenuClick">
        <div v-if="$slots.status" class="ui-app-bar__status"><slot name="status" /></div>
        <div v-if="$slots.actions" class="ui-app-bar__actions"><slot name="actions" /></div>
      </div>
    </template>
    <template v-else>
      <div v-if="$slots.status" class="ui-app-bar__status"><slot name="status" /></div>
      <div v-if="$slots.actions" class="ui-app-bar__actions"><slot name="actions" /></div>
    </template>
  </header>
</template>
