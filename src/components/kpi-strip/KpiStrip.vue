<script lang="ts">
/** One figure of the strip. */
export interface KpiItem {
  /** What is measured. */
  label: string;
  /** The figure, already formatted. */
  value: string | number;
  /** A line under the label: the comparison, the window, the unit. */
  sub?: string;
  /**
   * The same line under the label, by the name UiStatCard uses (0.8). When
   * both are set, `hint` wins.
   */
  hint?: string;
  /** Semantic tone of the figure. `default` is the deprecated name of `neutral`. */
  tone?: "neutral" | "muted" | "success" | "warning" | "danger" | "default";
  /** Tooltip: how the figure is computed. */
  title?: string;
}
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { canonicalTone } from "../../internal/tone";
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
    /** `lg` makes the values big, for a page with a handful of headline figures. */
    size?: "md" | "lg";
    /**
     * `cells` (default): one bordered instrument with shared rules. `plain`:
     * spaced cards without the table-like borders, the label in normal case.
     */
    variant?: "cells" | "plain";
  }>(),
  { label: () => useOnyxLocale().kpiStripLabel, columns: null, size: "md", variant: "cells" },
);

const rootClasses = computed(() => ({
  "ui-kpi-strip": true,
  "ui-kpi-strip--lg": props.size === "lg",
  "ui-kpi-strip--plain": props.variant === "plain",
}));

const rootStyle = computed(() => ({
  "--ui-kpi-strip-columns": String(props.columns ?? Math.max(props.items.length, 1)),
}));

/**
 * La clase del tono. `neutral` pinta la clase `--default` de siempre: los
 * estilos (y los que un consumidor sobrescriba) no cambian de nombre.
 */
function toneClass(tone: string | undefined): string {
  const t = canonicalTone(tone ?? "neutral");
  return t === "neutral" ? "default" : t;
}
</script>

<template>
  <ul :class="rootClasses" :aria-label="label" :style="rootStyle">
    <li v-for="(item, i) in items" :key="`${i}-${item.label}`" class="ui-kpi-strip__cell" :title="item.title || undefined">
      <span v-if="$slots[`icon-${i}`]" class="ui-kpi-strip__icon" aria-hidden="true"><slot :name="`icon-${i}`" :item="item" /></span>
      <span class="ui-kpi-strip__label">{{ item.label }}</span>
      <span :class="['ui-kpi-strip__value', `ui-kpi-strip__value--${toneClass(item.tone)}`]">
        <slot :name="`item-${i}`" :item="item">{{ item.value }}</slot>
      </span>
      <span v-if="item.hint || item.sub" class="ui-kpi-strip__sub">{{ item.hint || item.sub }}</span>
    </li>
  </ul>
</template>
