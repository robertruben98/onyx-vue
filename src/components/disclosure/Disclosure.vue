<script setup lang="ts">
import { computed } from "vue";
import "./disclosure.scss";

/**
 * A fold: a summary line that opens to show the rest. Long explanations, the
 * raw prompt of a run, the table twin of a chart, one PR among many.
 *
 * Native `<details>`/`<summary>`, so it works with the keyboard and find-in-
 * page with no script. The open state is a model and not only the element's
 * attribute: a page that repaints every five seconds must not close what the
 * reader opened, and the only way to survive a repaint is for the state to
 * live outside the DOM.
 */
const props = withDefaults(
  defineProps<{
    /** Summary text; the `#summary` slot replaces it. */
    summary?: string;
    /** Draws a border around the whole fold. */
    bordered?: boolean;
  }>(),
  { summary: "", bordered: true },
);

/** Open state (`v-model:open`). */
const open = defineModel<boolean>("open", { default: false });

function onToggle(event: Event): void {
  const now = (event.target as HTMLDetailsElement).open;
  if (now !== open.value) open.value = now;
}

const rootClasses = computed(() => ({
  "ui-disclosure": true,
  "ui-disclosure--bordered": props.bordered,
}));
</script>

<template>
  <details :class="rootClasses" :open="open" @toggle="onToggle">
    <summary class="ui-disclosure__summary">
      <span class="ui-disclosure__marker" aria-hidden="true" />
      <span class="ui-disclosure__label"><slot name="summary">{{ summary }}</slot></span>
    </summary>
    <div class="ui-disclosure__body"><slot /></div>
  </details>
</template>
