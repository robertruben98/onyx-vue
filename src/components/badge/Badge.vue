<script setup lang="ts">
import { computed } from "vue";
import "./badge.scss";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

const props = withDefaults(
  defineProps<{
    /** Visual variant (semantic role). */
    variant?: BadgeVariant;
  }>(),
  {
    variant: "neutral",
  },
);

const rootClasses = computed(() => ({
  "ui-badge": true,
  "ui-badge--neutral": props.variant === "neutral",
  "ui-badge--info": props.variant === "info",
  "ui-badge--success": props.variant === "success",
  "ui-badge--warning": props.variant === "warning",
  "ui-badge--danger": props.variant === "danger",
}));
</script>

<template>
  <span :class="rootClasses">
    <span class="ui-badge__el"><slot /></span>
  </span>
</template>
