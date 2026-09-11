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
 * Colour comes from the live computed value of the theme tokens, so the rain
 * follows whatever preset is on the root instead of hard-coding a green.
 */
const props = withDefaults(
  defineProps<{
    /** How visible the rain is. Keep it low: it is a backdrop, not content. */
    opacity?: number;
    /** Distance between columns, in px. Larger is sparser and cheaper. */
    columnGap?: number;
    /** Accessible name — omitted from the tree entirely, it is decoration. */
    label?: string;
  }>(),
  {
    opacity: 0.22,
    columnGap: 16,
  },
);

const canvas = ref<HTMLCanvasElement | null>(null);
let frame = 0;
let stop = false;

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
  let body = "0,194,70";
  let dpr = 1;
  let columns = 0;
  let rows: number[] = [];

  function readPalette() {
    const css = getComputedStyle(el as HTMLCanvasElement);
    ground = css.getPropertyValue("--ui-matrix-void").trim() || "#040705";
    head = css.getPropertyValue("--ui-matrix-head").trim() || "#d6ffe4";
    const green = css.getPropertyValue("--ui-matrix-green").trim() || "#00c246";
    body = hexToRgb(green);
  }

  function measure() {
    const el2 = el as HTMLCanvasElement;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    el2.width = Math.floor(window.innerWidth * dpr);
    el2.height = Math.floor(window.innerHeight * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.ceil(window.innerWidth / props.columnGap);
    rows = Array.from({ length: columns }, () => Math.random() * -60);
    readPalette();
    ctx!.fillStyle = ground;
    ctx!.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  let last = 0;
  function paint(t: number) {
    if (stop) return;
    frame = requestAnimationFrame(paint);
    if (t - last < 52) return; // ~19fps, the cadence of the original effect
    last = t;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const gap = props.columnGap;

    // Phosphor persistence: dim the previous frame, never clear it.
    ctx!.fillStyle = withAlpha(ground, 0.1);
    ctx!.fillRect(0, 0, w, h);
    ctx!.font = `${gap - 1}px ${getComputedStyle(el as HTMLCanvasElement).fontFamily}`;
    ctx!.textBaseline = "top";

    for (let i = 0; i < columns; i++) {
      const x = i * gap;
      const row = rows[i];
      if (row > 0) {
        for (let k = 1; k < 7; k++) {
          const y = (row - k) * gap;
          if (y < 0) break;
          ctx!.fillStyle = `rgba(${body},${0.38 - k * 0.055})`;
          ctx!.fillText(pick(), x, y);
        }
        ctx!.fillStyle = head;
        ctx!.fillText(pick(), x, row * gap);
      }
      rows[i]++;
      if (rows[i] * gap > h && Math.random() > 0.975) rows[i] = 0;
    }
  }

  measure();
  window.addEventListener("resize", measure);
  frame = requestAnimationFrame(paint);

  onBeforeUnmount(() => {
    stop = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", measure);
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
