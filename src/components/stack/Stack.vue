<script setup lang="ts">
import { computed } from "vue";
import "./stack.scss";

/** Step of the spacing scale (`--ui-space-N`); 0 is no gap. */
export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type StackDirection = "vertical" | "horizontal";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

const props = withDefaults(
  defineProps<{
    /** Main axis. */
    direction?: StackDirection;
    /** Space between children, as a step of the spacing scale. */
    gap?: StackGap;
    /** Cross-axis alignment. */
    align?: StackAlign;
    /** Main-axis distribution. */
    justify?: StackJustify;
    /** Lets children wrap onto new lines (horizontal stacks). */
    wrap?: boolean;
    /** Element to render. */
    as?: string;
  }>(),
  { direction: "vertical", gap: 3, align: "stretch", justify: "start", wrap: false, as: "div" },
);

/**
 * The one layout every page re-wrote: a flex column or row with a gap from
 * the scale. The pattern pages measured it — their only hand-written CSS was
 * this stack and a grid.
 */
const style = computed(() => ({
  "--ui-stack-gap": props.gap === 0 ? "0" : `var(--ui-space-${props.gap})`,
}));

const classes = computed(() => [
  "ui-stack",
  `ui-stack--${props.direction}`,
  `ui-stack--align-${props.align}`,
  `ui-stack--justify-${props.justify}`,
  { "ui-stack--wrap": props.wrap },
]);
</script>

<template>
  <component :is="as" :class="classes" :style="style"><slot /></component>
</template>
