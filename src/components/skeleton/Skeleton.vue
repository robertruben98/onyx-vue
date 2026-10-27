<script setup lang="ts">
import { computed } from "vue";
import "./skeleton.scss";

export type SkeletonVariant = "text" | "block" | "circle";

const props = withDefaults(
  defineProps<{
    /** Shape: lines of text, a block (image, chart) or a circle (avatar). */
    variant?: SkeletonVariant;
    /** Number of text lines (`text` only); the last one is shorter. */
    lines?: number;
    /** Width (CSS length). Defaults to the full width, or 2.5rem for a circle. */
    width?: string;
    /** Height (CSS length). Defaults to one line, 8rem for a block, the width for a circle. */
    height?: string;
    /**
     * What is loading, for screen readers. Empty makes the skeleton purely
     * decorative (use it when a parent already announces the loading).
     */
    label?: string;
  }>(),
  { variant: "text", lines: 1, width: "", height: "", label: "Loading…" },
);

const count = computed(() => (props.variant === "text" ? Math.max(1, Math.floor(props.lines)) : 1));

function boneStyle(index: number): Record<string, string> {
  const style: Record<string, string> = {};
  if (props.variant === "circle") {
    const size = props.width || props.height || "2.5rem";
    style.width = size;
    style.height = props.height || size;
    return style;
  }
  if (props.width) style.width = props.width;
  else if (props.variant === "text" && count.value > 1 && index === count.value) style.width = "60%";
  if (props.height) style.height = props.height;
  return style;
}
</script>

<template>
  <span
    :class="['ui-skeleton', `ui-skeleton--${variant}`]"
    :role="label ? 'status' : undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span v-if="label" class="ui-skeleton__label">{{ label }}</span>
    <span
      v-for="i in count"
      :key="i"
      class="ui-skeleton__bone"
      aria-hidden="true"
      :style="boneStyle(i)"
    ></span>
  </span>
</template>
