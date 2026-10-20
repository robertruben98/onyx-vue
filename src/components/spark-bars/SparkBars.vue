<script lang="ts">
/** One bar of the series. */
export interface SparkBar {
  /** Caption under the bar. */
  label: string;
  /** The measurement. */
  value: number;
  /** Marks the bar the reader is standing on — today, this build, this run. */
  current?: boolean;
  /** Tooltip. Defaults to `label: value`. */
  title?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./spark-bars.scss";

const props = withDefaults(
  defineProps<{
    /** The series, in reading order. */
    bars: SparkBar[];
    /** Value that fills a bar. Defaults to the tallest bar in the series. */
    max?: number | null;
    /** What the series measures, for the accessible name. */
    label?: string;
    /**
     * Floor for a non-zero bar, in percent. A value of 1 against a peak of 200
     * rounds to nothing and reads as a zero, which is the opposite of what
     * happened.
     */
    minFilled?: number;
  }>(),
  {
    max: null,
    label: "",
    minFilled: 8,
  },
);

const peak = computed(() => {
  if (props.max != null && props.max > 0) return props.max;
  return props.bars.reduce((m, b) => Math.max(m, b.value), 0) || 1;
});

function heightOf(bar: SparkBar): string {
  if (bar.value <= 0) return "0%";
  const pct = Math.round((bar.value / peak.value) * 100);
  return `${Math.max(props.minFilled, Math.min(100, pct))}%`;
}

function titleOf(bar: SparkBar): string {
  return bar.title ?? `${bar.label}: ${bar.value}`;
}

const ariaLabel = computed(() => {
  const what = props.label || "series";
  const parts = props.bars.map((b) => `${b.label} ${b.value}`).join(", ");
  return `${what}: ${parts}`;
});
</script>

<template>
  <div class="ui-spark-bars" role="img" :aria-label="ariaLabel">
    <div
      v-for="(bar, index) in bars"
      :key="index"
      :class="[
        'ui-spark-bars__bar',
        { 'ui-spark-bars__bar--current': bar.current },
        { 'ui-spark-bars__bar--zero': bar.value <= 0 },
      ]"
      :title="titleOf(bar)"
      aria-hidden="true"
    >
      <span class="ui-spark-bars__value">{{ bar.value }}</span>
      <span class="ui-spark-bars__track"
        ><span class="ui-spark-bars__fill" :style="{ height: heightOf(bar) }"
      /></span>
      <span class="ui-spark-bars__label">{{ bar.label }}</span>
    </div>
  </div>
</template>
