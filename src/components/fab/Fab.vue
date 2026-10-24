<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import "./fab.scss";

/**
 * Floating action button: the one action that must stay at hand on a long
 * page ("Ask", "New"). Fixed to a bottom corner, above the content.
 *
 * Extended it shows the glyph and the label. With `collapseOnScroll` it
 * shrinks to a round glyph while the page scrolls down (it was covering the
 * row buttons on the right edge of every card it passed) and grows back at
 * the top of the page or when scrolling up. The label stays the accessible
 * name in both shapes.
 */
const props = withDefaults(
  defineProps<{
    /** Visible label (extended) and accessible name. */
    label: string;
    /** `d` of a 24×24 stroke icon; or use the `icon` slot. */
    icon?: string;
    /** Shows the label. `false` is always the round, glyph-only button. */
    extended?: boolean;
    /** Shrinks to the glyph while scrolling down, grows back scrolling up. */
    collapseOnScroll?: boolean;
    /**
     * Slides out of view while scrolling down and comes back scrolling up, at
     * the top or at the end of the page. Even round, a fixed button covers
     * whatever passes under it on the right edge (listen buttons, steppers).
     */
    hideOnScroll?: boolean;
    /** Corner it sits in. */
    placement?: "end" | "start";
  }>(),
  { icon: "", extended: true, collapseOnScroll: false, hideOnScroll: false, placement: "end" },
);

const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

const collapsed = ref(false);
const hidden = ref(false);
// Pasos de menos de 8px no cuentan (el rebote de iOS, un temblor del dedo).
const STEP = 8;
// Cerca de arriba siempre extendido: ahi no tapa nada que no se vea entero.
const TOP = 64;
let last = 0;
// Al final de la pagina vuelve: ahi la pagina deja sitio debajo y no tapa nada.
const BOTTOM = 80;
function onScroll(): void {
  const y = window.scrollY;
  const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM;
  let down: boolean;
  if (y < TOP) down = false;
  else if (y > last + STEP) down = true;
  else if (y < last - STEP) down = false;
  else return;
  last = y;
  if (props.collapseOnScroll) collapsed.value = down;
  if (props.hideOnScroll) hidden.value = down && !atEnd;
}
onMounted(() => {
  if (!props.collapseOnScroll && !props.hideOnScroll) return;
  last = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

const showLabel = computed(() => props.extended && !collapsed.value);
const rootClasses = computed(() => [
  "ui-fab",
  `ui-fab--${props.placement}`,
  { "ui-fab--compact": !showLabel.value, "ui-fab--hidden": hidden.value },
]);
</script>

<template>
  <!-- Escondido sigue en el arbol y en el orden de foco: al recibirlo vuelve (fab.scss). -->
  <button type="button" :class="rootClasses" :aria-label="label" @click="emit('clicked', $event)" @focus="hidden = false">
    <span class="ui-fab__glyph" aria-hidden="true">
      <slot name="icon">
        <svg v-if="icon" class="ui-fab__svg" viewBox="0 0 24 24" focusable="false"><path :d="icon" /></svg>
      </slot>
    </span>
    <span class="ui-fab__label" aria-hidden="true">{{ label }}</span>
  </button>
</template>
