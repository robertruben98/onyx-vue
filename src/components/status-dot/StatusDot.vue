<script setup lang="ts">
import { computed } from "vue";
import "./status-dot.scss";

export type StatusDotState = "live" | "dead" | "warn" | "off" | "unknown";

const props = withDefaults(
  defineProps<{
    /** State the dot reports. */
    state?: StatusDotState;
    /**
     * Accessible name. Without it the dot is decorative and hidden from
     * assistive tech — a coloured circle with no name announces nothing
     * useful, and `role="img"` without a name is an axe violation.
     */
    label?: string;
  }>(),
  {
    state: "unknown",
    label: "",
  },
);

const rootClasses = computed(() => ({
  "ui-status-dot": true,
  "ui-status-dot--live": props.state === "live",
  "ui-status-dot--dead": props.state === "dead",
  "ui-status-dot--warn": props.state === "warn",
  "ui-status-dot--off": props.state === "off",
  "ui-status-dot--unknown": props.state === "unknown",
}));
</script>

<template>
  <span
    :class="rootClasses"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  ></span>
</template>
