<script setup lang="ts">
import { computed } from "vue";
import "./heat-strip.scss";

const props = withDefaults(
  defineProps<{
    /** One value per bucket, in bucket order. */
    values: number[];
    /** How many intensity steps above zero. */
    levels?: number;
    /** What the strip measures, for the accessible name. */
    label?: string;
    /** Names one bucket, for its tooltip. Defaults to the bucket index. */
    bucketLabel?: (index: number, value: number) => string;
    /** Scale caption rendered after the cells. */
    legend?: string;
  }>(),
  {
    levels: 4,
    label: "",
    bucketLabel: undefined,
    legend: "",
  },
);

const peak = computed(() =>
  props.values.reduce((m, n) => Math.max(m, n), 0),
);

const total = computed(() => props.values.reduce((n, v) => n + v, 0));

/**
 * Intensity is relative to the busiest bucket, not to an absolute scale: the
 * strip answers "was it a burst or a trickle", which is a question about the
 * shape of the day and not about how the day compares to any other.
 *
 * Anything above zero gets at least level 1. A bucket with work in it that
 * renders as empty is the one reading this component must never produce.
 */
function levelOf(value: number): number {
  if (value <= 0) return 0;
  if (peak.value <= 0) return 0;
  return Math.min(props.levels, Math.ceil((value / peak.value) * props.levels));
}

function titleOf(index: number, value: number): string {
  if (props.bucketLabel) return props.bucketLabel(index, value);
  return `${index}: ${value}`;
}

const ariaLabel = computed(() => {
  const what = props.label || "activity";
  return `${what}: ${total.value} across ${props.values.length} buckets, peak ${peak.value}`;
});
</script>

<template>
  <div class="ui-heat-strip" role="img" :aria-label="ariaLabel">
    <i
      v-for="(value, index) in values"
      :key="index"
      :class="['ui-heat-strip__cell', `ui-heat-strip__cell--l${levelOf(value)}`]"
      :title="titleOf(index, value)"
      aria-hidden="true"
    />
    <span v-if="legend" class="ui-heat-strip__legend" aria-hidden="true">{{
      legend
    }}</span>
  </div>
</template>
