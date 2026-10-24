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
    /** Corner it sits in. */
    placement?: "end" | "start";
  }>(),
  { icon: "", extended: true, collapseOnScroll: false, placement: "end" },
);

const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

const collapsed = ref(false);
// Pasos de menos de 8px no cuentan (el rebote de iOS, un temblor del dedo).
const STEP = 8;
// Cerca de arriba siempre extendido: ahi no tapa nada que no se vea entero.
const TOP = 64;
let last = 0;
function onScroll(): void {
  const y = window.scrollY;
  if (y < TOP) collapsed.value = false;
  else if (y > last + STEP) collapsed.value = true;
  else if (y < last - STEP) collapsed.value = false;
  else return;
  last = y;
}
onMounted(() => {
  if (!props.collapseOnScroll) return;
  last = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

const showLabel = computed(() => props.extended && !collapsed.value);
const rootClasses = computed(() => [
  "ui-fab",
  `ui-fab--${props.placement}`,
  { "ui-fab--compact": !showLabel.value },
]);
</script>

<template>
  <button type="button" :class="rootClasses" :aria-label="label" @click="emit('clicked', $event)">
    <span class="ui-fab__glyph" aria-hidden="true">
      <slot name="icon">
        <svg v-if="icon" class="ui-fab__svg" viewBox="0 0 24 24" focusable="false"><path :d="icon" /></svg>
      </slot>
    </span>
    <span class="ui-fab__label" aria-hidden="true">{{ label }}</span>
  </button>
</template>
