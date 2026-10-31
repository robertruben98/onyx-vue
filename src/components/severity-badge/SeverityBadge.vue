<script lang="ts">
export type Severity =
  | "critical"
  | "very-high"
  | "high"
  | "moderate"
  | "medium"
  | "low"
  | "very-low"
  | "unknown";

/**
 * Sort key for a severity: lower comes first.
 *
 * Lives here and not in the consumer because every page that lists alerts
 * needs it and each one was copying the same map. `medium` and `moderate` are
 * the same rung under two names — GitHub's dependency alerts say one and its
 * code scanning says the other. Anything unrecognised goes to the back rather
 * than to the front: an unknown severity is not an emergency.
 *
 * The five-level scale `very-low | low | medium | high | very-high` (the
 * English trainer's mistake severities) shares the rungs: `very-high` sits
 * with `critical` and `very-low` comes after `low`.
 */
const RANK: Record<string, number> = {
  critical: 0,
  "very-high": 0,
  high: 1,
  moderate: 2,
  medium: 2,
  low: 3,
  "very-low": 4,
  unknown: 9,
};

export function severityRank(severity: Severity | string): number {
  const rank = RANK[String(severity).toLowerCase()];
  return rank === undefined ? 9 : rank;
}
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed } from "vue";
import "./severity-badge.scss";

const messages = useOnyxLocale();

const props = withDefaults(
  defineProps<{
    /** Severity reported. */
    severity?: Severity;
  }>(),
  {
    severity: "unknown",
  },
);

/** `medium` and `moderate` share a rung, so they share a look. */
const level = computed(() =>
  props.severity === "medium" ? "moderate" : props.severity,
);

const rootClasses = computed(() => ({
  "ui-severity-badge": true,
  "ui-severity-badge--critical": level.value === "critical",
  "ui-severity-badge--very-high": level.value === "very-high",
  "ui-severity-badge--high": level.value === "high",
  "ui-severity-badge--moderate": level.value === "moderate",
  "ui-severity-badge--low": level.value === "low",
  "ui-severity-badge--very-low": level.value === "very-low",
  "ui-severity-badge--unknown": level.value === "unknown",
}));
</script>

<template>
  <span :class="rootClasses"><slot>{{ messages.severityLabels[severity] }}</slot></span>
</template>
