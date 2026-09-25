import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

/**
 * Shared pieces of the bar charts: tones, the bar path, the measured width and
 * the tooltip state.
 *
 * The charts follow one set of rules that are not taste: thin marks, a solid
 * hairline grid one step above the surface, a 2px gap between fills, a direct
 * label only on the extreme, text never in the series colour (the mark next to
 * it carries the colour), and a table twin for every chart.
 */

/** Colour role of a mark. Maps to the `--ui-chart-*` tokens. */
export type ChartTone = "ok" | "warn" | "bad" | "none" | "one";

/** A key of the legend. */
export interface ChartLegendItem {
  label: string;
  tone: ChartTone;
}

/** The table twin of a chart: what a screen reader and a copy-paste get. */
export interface ChartTable {
  headers: string[];
  rows: Array<Array<string | number>>;
}

/**
 * A bar with its data end rounded (4px) and its baseline end square.
 * `dir` says which side the data end is on.
 */
export function barPath(
  x: number,
  y: number,
  w: number,
  h: number,
  dir: "up" | "right" | "flat",
): string {
  const vertical = dir === "up";
  const r = Math.min(4, vertical ? w / 2 : h / 2, vertical ? h : w);
  if (dir === "flat" || r <= 0.5) return `M${x} ${y}h${w}v${h}h${-w}Z`;
  if (dir === "up") {
    return (
      `M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}` +
      `h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h}Z`
    );
  }
  return (
    `M${x} ${y}h${w - r}a${r} ${r} 0 0 1 ${r} ${r}` +
    `v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}H${x}Z`
  );
}

/** A label cut to what fits its column (~7 units per character at 11.5px). */
export function fitLabel(label: string, gutter: number): string {
  const n = Math.max(6, Math.floor((gutter - 16) / 7));
  return label.length > n ? `${label.slice(0, n - 1)}…` : label;
}

/**
 * The width of the chart's box, in CSS pixels. The viewBox is measured in real
 * pixels (1 unit = 1px): with a fixed viewBox the SVG scales to the panel and
 * the bar caps, the 2px gap and the 11px text scale with it, and the rules
 * above stop being true. Never below 360, where 11px labels stay legible.
 */
export function useChartWidth(el: Ref<HTMLElement | null>, fallback = 1200) {
  const width = ref(fallback);
  let ro: ResizeObserver | null = null;
  function measure(): void {
    const w = el.value?.clientWidth ?? 0;
    if (w > 0) width.value = Math.max(360, Math.round(w));
  }
  onMounted(() => {
    measure();
    if (typeof ResizeObserver !== "undefined" && el.value) {
      ro = new ResizeObserver(measure);
      ro.observe(el.value);
    }
  });
  onBeforeUnmount(() => ro?.disconnect());
  return width;
}

/** Tooltip state for the hit areas of a chart. */
export function useChartTip() {
  const tip = ref<{ text: string; x: number; y: number } | null>(null);
  function show(event: Event, text: string): void {
    const target = event.currentTarget as Element | null;
    if (!target || !text) return;
    const r = target.getBoundingClientRect();
    tip.value = { text, x: r.left + r.width / 2, y: r.top };
  }
  function hide(): void {
    tip.value = null;
  }
  return { tip, show, hide };
}
