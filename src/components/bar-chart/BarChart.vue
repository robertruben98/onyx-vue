<script lang="ts">
import type { ChartTone } from "./chart-kit";

/** One stacked series of a bar chart. */
export interface BarSeries {
  id: string;
  label: string;
  tone: ChartTone;
}

/** One column: a label on the axis and a value per series. */
export interface BarPoint {
  label: string;
  values: Record<string, number>;
  /** Tooltip text; defaults to the label and the values. */
  tip?: string;
  /** Dims the axis label (a weekend, a day off). */
  muted?: boolean;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { barPath, useChartTip, useChartWidth, type ChartTable } from "./chart-kit";
import ChartParts from "./ChartParts.vue";
import "./chart.scss";

/**
 * Stacked vertical bars over time: work per day, runs per week.
 *
 * Series stack bottom-up in the order given, with a 2px gap in the surface
 * colour between segments. Four grid lines; the axis labels every column only
 * when they fit (with 30 or 90 columns, every nth and always the last). A
 * direct value label goes on the tallest column only — a number on every
 * column is a number nobody reads. Every column has a hit area the full
 * height of the plot, so the tooltip target is never a 2px sliver.
 *
 * The SVG is an image with a name; the numbers themselves are in the table
 * twin, which is what assistive tech and copy-paste get.
 */
const props = withDefaults(
  defineProps<{
    /** The stacked series, bottom first. */
    series: BarSeries[];
    /** The columns, left to right. */
    points: BarPoint[];
    /** Accessible name of the chart. */
    label: string;
    /** Plot height in px. */
    height?: number;
    /** Formats the axis ticks and the direct label. */
    valueFormat?: (n: number) => string;
    /** Draws the legend above the chart. */
    showLegend?: boolean;
    /** The table twin; defaults to one row per column. `null` hides it. */
    table?: ChartTable | null;
    /** Summary of the table fold. */
    tableSummary?: string;
    /** Header of the first column of the default table. */
    categoryHeader?: string;
  }>(),
  {
    height: 300,
    valueFormat: (n: number) => n.toLocaleString(),
    showLegend: true,
    table: undefined,
    tableSummary: "data",
    categoryHeader: "category",
  },
);

const box = ref<HTMLElement | null>(null);
const width = useChartWidth(box);
const { tip, show, hide } = useChartTip();
const tableOpen = ref(false);

const PAD = { l: 46, r: 16, t: 18, b: 34 };

const totals = computed(() =>
  props.points.map((p) => props.series.reduce((a, s) => a + (p.values[s.id] ?? 0), 0)),
);

const max = computed(() => {
  const m = Math.max(0, ...totals.value);
  return Math.ceil(m / 4) * 4 || 4;
});

const geo = computed(() => {
  const plotW = width.value - PAD.l - PAD.r;
  const plotH = props.height - PAD.t - PAD.b;
  const band = plotW / Math.max(props.points.length, 1);
  const bw = Math.min(24, Math.max(3, band - 10));
  return { plotW, plotH, band, bw };
});

const y = (v: number) => PAD.t + geo.value.plotH - (v / max.value) * geo.value.plotH;

const ticks = computed(() => [0, 1, 2, 3, 4].map((i) => (max.value / 4) * i));

const labelStep = computed(() => Math.ceil(props.points.length / 16));

const maxIndex = computed(() => {
  let best = -1;
  totals.value.forEach((t, i) => {
    if (t > 0 && (best < 0 || t > totals.value[best])) best = i;
  });
  return best;
});

interface Seg {
  d: string;
  tone: string;
}

const columns = computed(() =>
  props.points.map((p, i) => {
    const { band, bw, plotH } = geo.value;
    const cx = PAD.l + band * i + (band - bw) / 2;
    const present = props.series.filter((s) => (p.values[s.id] ?? 0) > 0);
    const segs: Seg[] = [];
    let base = PAD.t + plotH;
    present.forEach((s, k) => {
      const h = Math.max(((p.values[s.id] ?? 0) / max.value) * plotH, 1.5);
      const top = base - h;
      const last = k === present.length - 1;
      segs.push({ d: barPath(cx, top, bw, h, last ? "up" : "flat"), tone: s.tone });
      base = top - 2;
    });
    const tipText =
      p.tip ??
      [p.label, ...props.series.map((s) => `${p.values[s.id] ?? 0} ${s.label}`)].join(" · ");
    return {
      i,
      cx,
      segs,
      topY: base + 2,
      showLabel: i % labelStep.value === 0 || i === props.points.length - 1,
      hitX: PAD.l + band * i,
      tipText,
    };
  }),
);

const legend = computed(() => props.series.map((s) => ({ label: s.label, tone: s.tone })));

const twin = computed<ChartTable | null>(() => {
  if (props.table !== undefined) return props.table;
  return {
    headers: [props.categoryHeader, ...props.series.map((s) => s.label)],
    rows: props.points.map((p) => [p.label, ...props.series.map((s) => p.values[s.id] ?? 0)]),
  };
});
</script>

<template>
  <div ref="box" class="ui-chart ui-bar-chart">
    <ChartParts v-if="showLegend" part="legend" :legend="legend" />
    <svg
      class="ui-chart__svg"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      :aria-label="label"
      @pointerleave="hide"
    >
      <g>
        <template v-for="t in ticks" :key="t">
          <line class="ui-chart__grid" :x1="PAD.l" :x2="width - PAD.r" :y1="y(t)" :y2="y(t)" />
          <text class="ui-chart__tick ui-chart__end" :x="PAD.l - 10" :y="y(t) + 4">{{ valueFormat(t) }}</text>
        </template>
      </g>
      <g v-for="col in columns" :key="col.i">
        <path v-for="(s, k) in col.segs" :key="k" :d="s.d" :class="`ui-chart--${s.tone}`" />
        <text
          v-if="col.i === maxIndex"
          class="ui-chart__val ui-chart__mid"
          :x="col.cx + geo.bw / 2"
          :y="col.topY - 12"
        >{{ valueFormat(totals[col.i]) }}</text>
        <text
          v-if="col.showLabel"
          :class="['ui-chart__tick', 'ui-chart__mid', { 'ui-chart__tick--dim': points[col.i].muted }]"
          :x="col.cx + geo.bw / 2"
          :y="height - 12"
        >{{ points[col.i].label }}</text>
        <rect
          class="ui-chart__hit"
          :x="col.hitX"
          :y="PAD.t"
          :width="geo.band"
          :height="geo.plotH"
          @pointerenter="show($event, col.tipText)"
          @pointerleave="hide"
        />
      </g>
    </svg>
    <ChartParts part="tip" :tip="tip" />
    <ChartParts v-model:table-open="tableOpen" part="table" :table="twin" :table-summary="tableSummary" />
  </div>
</template>
