<script setup lang="ts">
import { computed } from "vue";
import "./spinner.scss";

export type SpinnerSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    /** Spinner size. */
    size?: SpinnerSize;
    /** Accessible label announced by assistive tech. */
    label?: string;
  }>(),
  {
    size: "md",
    label: "Loading",
  },
);

const rootClasses = computed(() => ({
  "ui-spinner": true,
  "ui-spinner--sm": props.size === "sm",
  "ui-spinner--lg": props.size === "lg",
}));
</script>

<template>
  <span :class="rootClasses" role="status" :aria-label="label">
    <span class="ui-spinner__ring" aria-hidden="true"></span>
  </span>
</template>
