<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import "./digital-rain.scss";

/**
 * The falling-glyph backdrop, on a canvas.
 *
 * Three details separate this from a column of random symbols, and all three
 * come from how the effect actually works rather than from how it looks in a
 * screenshot:
 *
 * 1. The alphabet is half-width katakana plus digits and a few latin glyphs.
 * 2. Each column has a near-white head and a tail that fades out behind it —
 *    the columns have depth because of the gradient, not because of the colour.
 * 3. The previous frame is DIMMED, never cleared. That is phosphor persistence:
 *    a CRT cell flares when it is painted and then decays. Clearing the canvas
 *    each frame gives you disconnected glyphs; dimming gives you trails.
 *
 * It paints at ~19fps on purpose. That is the cadence of the original effect,
 * and it costs a third of what 60fps would on a background nobody looks at.
 *
 * Three more things keep that frame cheap, none of them visible (measured on
 * the SM23 panel, 2026-09-16: 1.4 ms per frame before, 25 ms of JS per second):
 * the canvas is 1 CSS px per device px whatever the screen's ratio — at 12 %
 * opacity behind the page a sharper glyph buys nothing and a retina screen
 * would paint four times the pixels —, every string the frame needs (font,
 * veil, the seven tail colours) is built once per resize, and `fillStyle` is
 * set once per tail level instead of once per glyph, because each assignment
 * parses a colour and there were ~900 of them per frame for seven values.
 * The cadence comes from a timer that hands over to `requestAnimationFrame`
 * for the paint itself: 19 wake-ups a second instead of one per refresh (165
 * on a fast screen), and still frozen while the tab is hidden, because the
 * frame is only ever painted from a rAF callback. A glyph atlas drawn with
 * `drawImage` was tried and measured no cheaper than `fillText` (0.99 ms
 * against 0.87 per frame): Chromium caches the glyphs already.
 *
 * Colour comes from the live computed value of the theme tokens, so the rain
 * follows whatever preset is on the root instead of hard-coding a green.
 *
 * It also stops when its window loses focus (`pauseWhenUnfocused`, on by
 * default), not only when the tab is hidden: a backdrop is decoration, and a
 * dashboard left open on a second monitor kept painting it all day. On the
 * SM23 agents graph (2026-10-09) the rain was ~5 % of a core with nobody
 * looking. The last frame stays on the canvas, so the page does not flash
 * empty; it moves again on focus.
 */
const props = withDefaults(
  defineProps<{
    /** How visible the rain is. Keep it low: it is a backdrop, not content. */
    opacity?: number;
    /** Distance between columns, in px. Larger is sparser and cheaper. */
    columnGap?: number;
    /** Accessible name — omitted from the tree entirely, it is decoration. */
    label?: string;
    /** Stop painting while the window has no focus (the last frame stays). */
    pauseWhenUnfocused?: boolean;
  }>(),
  {
    opacity: 0.22,
    columnGap: 16,
    pauseWhenUnfocused: true,
  },
);

const canvas = ref<HTMLCanvasElement | null>(null);
let frame = 0;
let timer = 0;
let stop = false;
/** Whether a paint is scheduled: a resume must not start a second loop. */
let running = false;

/** Half-width katakana, digits and a few latin glyphs: the real alphabet. */
const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFZ:.=*+-<>".split(
    "",
  );

function pick(): string {
  return GLYPHS[(Math.random() * GLYPHS.length) | 0];
}

onMounted(() => {
  const el = canvas.value;
  if (!el) return;

  // A viewer who asked for less motion gets a still, empty backdrop rather than
  // a frozen frame of glyphs — a static wall of katakana is worse than none.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = el.getContext("2d", { alpha: false });
  if (!ctx) return;

  // Read the palette once per resize rather than once per frame: getComputedStyle
  // forces a style recalc, and doing that 19 times a second for a backdrop is
  // how a decorative canvas ends up owning the frame budget.
  let ground = "#000";
  let head = "#fff";
  let veil = "rgba(0,0,0,0.1)";
  let font = "15px monospace";
  const TAIL = 7;
  const tailStyles: string[] = [];
  let columns = 0;
  let rows: number[] = [];

  function readPalette() {
    const css = getComputedStyle(el as HTMLCanvasElement);
    ground = css.getPropertyValue("--ui-matrix-void").trim() || "#040705";
    head = css.getPropertyValue("--ui-matrix-head").trim() || "#d6ffe4";
    const green = css.getPropertyValue("--ui-matrix-green").trim() || "#00c246";
    const body = hexToRgb(green);
    veil = withAlpha(ground, 0.1);
    font = `${props.columnGap - 1}px ${css.fontFamily}`;
    for (let k = 1; k < TAIL; k++) tailStyles[k] = `rgba(${body},${0.38 - k * 0.055})`;
  }

  function measure() {
    const el2 = el as HTMLCanvasElement;
    // 1 CSS px per canvas px on purpose: see the note at the top.
    el2.width = Math.floor(window.innerWidth);
    el2.height = Math.floor(window.innerHeight);
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    columns = Math.ceil(window.innerWidth / props.columnGap);
    rows = Array.from({ length: columns }, () => Math.random() * -60);
    readPalette();
    ctx!.fillStyle = ground;
    ctx!.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  const PERIOD = 52; // ~19fps, the cadence of the original effect
  let last = 0;

  /** Hidden tab, or (unless turned off) a window without focus. */
  function paused(): boolean {
    if (document.hidden) return true;
    return props.pauseWhenUnfocused && typeof document.hasFocus === "function" && !document.hasFocus();
  }

  function schedule() {
    if (stop || paused()) {
      running = false;
      return;
    }
    running = true;
    const wait = Math.max(0, PERIOD - (performance.now() - last));
    timer = window.setTimeout(() => {
      frame = requestAnimationFrame(paint);
    }, wait);
  }

  /** Back from a pause: one loop again, never two. */
  function resume() {
    if (stop || running || paused()) return;
    running = true;
    frame = requestAnimationFrame(paint);
  }

  function paint() {
    if (stop) return;
    last = performance.now();
    schedule();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const gap = props.columnGap;

    // Phosphor persistence: dim the previous frame, never clear it.
    ctx!.fillStyle = veil;
    ctx!.fillRect(0, 0, w, h);
    ctx!.font = font;
    ctx!.textBaseline = "top";

    // Tail level by tail level, so fillStyle is set seven times per frame and
    // not once per glyph. Cells never overlap, so the order does not change a
    // pixel of the result.
    for (let k = 1; k < TAIL; k++) {
      ctx!.fillStyle = tailStyles[k];
      for (let i = 0; i < columns; i++) {
        const y = (rows[i] - k) * gap;
        if (rows[i] > 0 && y >= 0) ctx!.fillText(pick(), i * gap, y);
      }
    }
    ctx!.fillStyle = head;
    for (let i = 0; i < columns; i++) {
      if (rows[i] > 0) ctx!.fillText(pick(), i * gap, rows[i] * gap);
      rows[i]++;
      if (rows[i] * gap > h && Math.random() > 0.975) rows[i] = 0;
    }
  }

  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("focus", resume);
  document.addEventListener("visibilitychange", resume);
  running = true;
  frame = requestAnimationFrame(paint);

  onBeforeUnmount(() => {
    stop = true;
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", measure);
    window.removeEventListener("focus", resume);
    document.removeEventListener("visibilitychange", resume);
  });
});

/** `#rrggbb` to `"r,g,b"`, so it can be dropped into an rgba() string. */
function hexToRgb(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return "0,194,70";
  return [1, 2, 3].map((i) => parseInt(m[i], 16)).join(",");
}

/** The ground colour at a given alpha, for the persistence veil. */
function withAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)},${alpha})`;
}
</script>

<template>
  <canvas
    ref="canvas"
    class="ui-digital-rain"
    :style="{ opacity: String(opacity) }"
    aria-hidden="true"
  ></canvas>
</template>
