<script setup lang="ts">
import { computed } from "vue";
import "./readout.scss";

/**
 * One large instrument reading: a number, a caption, and an optional unit.
 *
 * This is not a metric chip. A chip is one of many in a row and stays small on
 * purpose; a readout is the figure someone reads from across the desk, and it
 * is the only place in the run view where type gets big. Use one or two per
 * view — a wall of them is a dashboard with no point of view.
 *
 * The glow is a token (`--ui-matrix-glow`) with a plain fallback, so the same
 * component is merely bold under presets that have no phosphor.
 */
const props = withDefaults(
  defineProps<{
    /** The figure. A string so `06.0`, `BYPASS` or `—` are all valid. */
    value: string | number;
    /** What is being measured. */
    label: string;
    /** Rendered smaller next to the value: `s`, `%`, `ms`. */
    unit?: string;
    /** Semantic tone of the figure. */
    tone?: "default" | "success" | "warning" | "danger" | "muted";
  }>(),
  { tone: "default" },
);

const rootClasses = computed(() => [
  "ui-readout",
  `ui-readout--${props.tone}`,
]);
</script>

<template>
  <div :class="rootClasses">
    <span class="ui-readout__label">{{ label }}</span>
    <span class="ui-readout__value"
      >{{ value }}<small v-if="unit" class="ui-readout__unit">{{ unit }}</small></span
    >
  </div>
</template>
