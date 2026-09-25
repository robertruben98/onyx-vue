<script lang="ts">
import type { ChartTone } from "../bar-chart/chart-kit";

/** One stacked part of a row. */
export interface BarSegment {
  value: number;
  tone: ChartTone;
  /** What the part is, for its tooltip ("fallido"). */
  label?: string;
}

/** One row: a category and its bar. */
export interface BarListItem {
  label: string;
  /** A single bar. Ignored when `segments` is given. */
  value?: number;
  /** Tone of a single bar. */
  tone?: ChartTone;
  /** Stacked parts, left to right. */
  segments?: BarSegment[];
  /** Text after the bar (single) or in the right column (stacked). */
  valueText?: string;
  /** Tooltip of the row. */
  tip?: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  barPath,
  fitLabel,
  useChartTip,
  useChartWidth,
  type ChartLegendItem,
  type ChartTable,
} from "../bar-chart/chart-kit";
import ChartParts from "../bar-chart/ChartParts.vue";
import "../bar-chart/chart.scss";

/**
 * Horizontal bars, one row per category: why runs get stuck, reliability per
 * agent, cost per session. Ranked by the consumer; the component keeps order.
 *
 * A row is either one bar (with its value written after the end) or a stack of
 * segments (with a 2px gap between them, the count inside a segment only when
 * it fits with room to spare, and a summary in a right-hand column). Labels
 * are cut to their column; the full label stays in the tooltip and the table.
 * Nominal categories share one tone unless the consumer says otherwise —
 * re-encoding in colour what the length already says is noise.
 */
const props = withDefaults(
  defineProps<{
    /** The rows, top to bottom. */
    items: BarListItem[];
    /** Accessible name of the chart. */
    label: string;
    /** Scale maximum; defaults to the largest row. */
    max?: number | null;
    /** Width of the label column in px (capped at 40% of the chart). */
    gutter?: number;
    /** Width of the column after the bars in px. */
    trail?: number;
    /** Row height in px. */
    rowHeight?: number;
    /** Keys above the chart. */
    legend?: ChartLegendItem[];
    /** The table twin. `null` hides it; by default one row per item. */
    table?: ChartTable | null;
    /** Summary of the table fold. */
    tableSummary?: string;
    /** Headers of the default table. */
    tableHeaders?: [string, string];
  }>(),
  {
    max: null,
    gutter: 200,
    trail: 80,
    rowHeight: 32,
    legend: () => [],
    table: undefined,
    tableSummary: "data",
    tableHeaders: () => ["category", "value"],
  },
);

const box = ref<HTMLElement | null>(null);
const width = useChartWidth(box);
const { tip, show, hide } = useChartTip();
const tableOpen = ref(false);

const PAD_T = 8;
const BAR_H = 18;

const padL = computed(() => Math.min(props.gutter, Math.round(width.value * 0.4)));
const plotW = computed(() => Math.max(40, width.value - padL.value - props.trail));
const height = computed(() => PAD_T + props.items.length * props.rowHeight + 8);

function totalOf(item: BarListItem): number {
  return item.segments ? item.segments.reduce((a, s) => a + s.value, 0) : item.value ?? 0;
}

const scaleMax = computed(
  () => props.max ?? (Math.max(0, ...props.items.map(totalOf)) || 1),
);

const rows = computed(() =>
  props.items.map((item, i) => {
    const yTop = PAD_T + i * props.rowHeight;
    const y = yTop + (props.rowHeight - BAR_H) / 2;
    const textY = y + BAR_H / 2 + 4;
    const label = fitLabel(item.label, padL.value);
    if (item.segments) {
      const parts = item.segments.filter((s) => s.value > 0);
      let x = padL.value;
      const segs = parts.map((s, k) => {
        const last = k === parts.length - 1;
        const w = Math.max((s.value / scaleMax.value) * plotW.value - (last ? 0 : 2), 2);
        const seg = {
          d: barPath(x, y, w, BAR_H, last ? "right" : "flat"),
          tone: s.tone,
          inside: w > 26 ? { x: x + w / 2, text: String(s.value) } : null,
          light: s.tone === "bad" || s.tone === "none",
          hit: { x, w },
          tip: `${item.label} · ${s.value}${s.label ? ` ${s.label}` : ""}`,
        };
        x += w + 2;
        return seg;
      });
      return { i, yTop, textY, label, segs, bar: null, stacked: true, item };
    }
    const w = Math.max(((item.value ?? 0) / scaleMax.value) * plotW.value, 2);
    return {
      i,
      yTop,
      textY,
      label,
      segs: [],
      bar: { d: barPath(padL.value, y, w, BAR_H, "right"), w, tone: item.tone ?? "one" },
      stacked: false,
      item,
    };
  }),
);

const twin = computed<ChartTable | null>(() => {
  if (props.table !== undefined) return props.table;
  return {
    headers: [...props.tableHeaders],
    rows: props.items.map((it) => [it.label, it.valueText ?? totalOf(it)]),
  };
});
</script>

<template>
  <div ref="box" class="ui-chart ui-bar-list">
    <ChartParts part="legend" :legend="legend" />
    <svg
      class="ui-chart__svg"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      :aria-label="label"
      @pointerleave="hide"
    >
      <g v-for="row in rows" :key="row.i">
        <text class="ui-chart__cat ui-chart__end" :x="padL - 12" :y="row.textY">{{ row.label }}</text>
        <template v-if="row.stacked">
          <template v-for="(s, k) in row.segs" :key="k">
            <path :d="s.d" :class="`ui-chart--${s.tone}`" />
            <text
              v-if="s.inside"
              :class="['ui-chart__inseg', 'ui-chart__mid', { 'ui-chart__inseg--light': s.light }]"
              :x="s.inside.x"
              :y="row.textY"
            >{{ s.inside.text }}</text>
            <rect
              class="ui-chart__hit"
              :x="s.hit.x"
              :y="row.yTop"
              :width="s.hit.w"
              :height="rowHeight"
              @pointerenter="show($event, row.item.tip ? `${row.item.tip} · ${s.tip}` : s.tip)"
              @pointerleave="hide"
            />
          </template>
          <text
            v-if="row.item.valueText"
            class="ui-chart__val"
            :x="width - trail + 12"
            :y="row.textY"
          >{{ row.item.valueText }}</text>
        </template>
        <template v-else-if="row.bar">
          <path :d="row.bar.d" :class="`ui-chart--${row.bar.tone}`" />
          <text class="ui-chart__val" :x="padL + row.bar.w + 10" :y="row.textY">{{
            row.item.valueText ?? row.item.value
          }}</text>
          <rect
            class="ui-chart__hit"
            :x="padL"
            :y="row.yTop"
            :width="Math.max(row.bar.w, 24)"
            :height="rowHeight"
            @pointerenter="show($event, row.item.tip ?? `${row.item.label} · ${row.item.valueText ?? row.item.value}`)"
            @pointerleave="hide"
          />
        </template>
      </g>
    </svg>
    <ChartParts part="tip" :tip="tip" />
    <ChartParts v-model:table-open="tableOpen" part="table" :table="twin" :table-summary="tableSummary" />
  </div>
</template>
