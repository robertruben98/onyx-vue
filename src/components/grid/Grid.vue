<script setup lang="ts">
import { computed } from "vue";
import "./grid.scss";

/** Step of the spacing scale (`--ui-space-N`); 0 is no gap. */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * What a fitted grid (`minItemWidth`) does with the room its items do not use.
 * `fit` collapses the empty columns and stretches the items over the row; `fill`
 * keeps them, so the column count depends only on the grid's width.
 */
export type GridTracks = "fit" | "fill";

const props = withDefaults(
  defineProps<{
    /** Fixed number of equal columns. Ignored when `minItemWidth` is set. */
    columns?: number;
    /**
     * Minimum width of an item (any CSS length). The grid fits as many columns
     * as there is room for and drops to one on a narrow screen.
     */
    minItemWidth?: string;
    /**
     * With `minItemWidth`: `fit` stretches the items over the room the missing
     * ones leave, `fill` keeps that room empty so each item keeps the width it
     * has in a full row. Unset, a grid of UiMediaCard fills and any other fits.
     */
    tracks?: GridTracks;
    /** Space between items, as a step of the spacing scale. */
    gap?: GridGap;
    /** Element to render. */
    as?: string;
  }>(),
  { columns: 1, minItemWidth: "", tracks: undefined, gap: 4, as: "div" },
);

const style = computed(() => ({
  "--ui-grid-gap": props.gap === 0 ? "0" : `var(--ui-space-${props.gap})`,
  // Solo si se pide: sin `tracks` decide la hoja de estilos (auto-fit, o
  // auto-fill cuando los hijos son UiMediaCard).
  ...(props.minItemWidth && props.tracks
    ? { "--ui-grid-repeat": props.tracks === "fill" ? "auto-fill" : "auto-fit" }
    : {}),
  // `min(100%, …)`: an item never asks for more than the grid has, so a
  // 16rem minimum on a 300 px screen gives one column, not a sideways scroll.
  gridTemplateColumns: props.minItemWidth
    ? `repeat(var(--ui-grid-repeat, auto-fit), minmax(min(100%, ${props.minItemWidth}), 1fr))`
    : `repeat(${Math.max(1, Math.floor(props.columns))}, minmax(0, 1fr))`,
}));
</script>

<template>
  <component :is="as" class="ui-grid" :style="style"><slot /></component>
</template>
