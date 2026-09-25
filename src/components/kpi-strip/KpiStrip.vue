<script lang="ts">
/** One figure of the strip. */
export interface KpiItem {
  /** What is measured. */
  label: string;
  /** The figure, already formatted. */
  value: string | number;
  /** A line under the label: the comparison, the window, the unit. */
  sub?: string;
  /** Semantic tone of the figure. */
  tone?: "default" | "muted" | "success" | "warning" | "danger";
  /** Tooltip: how the figure is computed. */
  title?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./kpi-strip.scss";

/**
 * A row of headline figures above a list: runs today, acted on, skipped,
 * success rate.
 *
 * The cells share borders so the strip reads as one instrument rather than
 * five cards. Below 1080px it folds into two columns; a strip of five 60px
 * cells is five truncated labels.
 *
 * It is a list, because the figures are siblings; each value is announced
 * after its label ("runs, 42"), which is the order a person reads them.
 */
const props = withDefaults(
  defineProps<{
    /** The figures, in reading order. */
    items: KpiItem[];
    /** Accessible name of the strip. */
    label?: string;
    /** Columns on a wide screen; defaults to one per item. */
    columns?: number | null;
  }>(),
  { label: "Summary", columns: null },
);

const rootStyle = computed(() => ({
  "--ui-kpi-strip-columns": String(props.columns ?? Math.max(props.items.length, 1)),
}));
</script>

<template>
  <ul class="ui-kpi-strip" :aria-label="label" :style="rootStyle">
    <li v-for="(item, i) in items" :key="`${i}-${item.label}`" class="ui-kpi-strip__cell" :title="item.title || undefined">
      <span class="ui-kpi-strip__label">{{ item.label }}</span>
      <span :class="['ui-kpi-strip__value', `ui-kpi-strip__value--${item.tone ?? 'default'}`]">
        <slot :name="`item-${i}`" :item="item">{{ item.value }}</slot>
      </span>
      <span v-if="item.sub" class="ui-kpi-strip__sub">{{ item.sub }}</span>
    </li>
  </ul>
</template>
