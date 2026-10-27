<script setup lang="ts">
import { computed } from "vue";
import "./chip-row.scss";

export type ChipRowOverflow = "wrap" | "scroll";

/**
 * A row of chips (UiChip, UiFilterChip). `wrap` flows onto more lines;
 * `scroll` keeps one line that slides sideways. In scroll mode the row keeps
 * room on every side for the first and last chip and for their focus ring:
 * a bare `overflow-x: auto` strip cut "Give me an example" at its edge and
 * clipped the ring of whichever chip had focus.
 */
const props = withDefaults(
  defineProps<{
    /** `wrap` onto more lines, or one `scroll`ing line. */
    overflow?: ChipRowOverflow;
    /** Accessible name. When set, the row is a `role="group"`. */
    label?: string;
  }>(),
  {
    overflow: "wrap",
    label: undefined,
  },
);

const rootClasses = computed(() => ({
  "ui-chip-row": true,
  "ui-chip-row--scroll": props.overflow === "scroll",
}));
</script>

<template>
  <div :class="rootClasses" :role="label ? 'group' : undefined" :aria-label="label">
    <slot />
  </div>
</template>
