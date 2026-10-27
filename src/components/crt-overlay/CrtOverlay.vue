<script setup lang="ts">
import "./crt-overlay.scss";

/**
 * Scanlines and a vignette, over everything.
 *
 * The pair is what makes a flat dark page read as a screen being looked at
 * rather than a dark theme: the lines imply a raster and the vignette implies
 * a tube. Both are pure CSS — no canvas, no timer, nothing to clean up.
 *
 * It is a sibling of the page content, not a wrapper, so it cannot affect the
 * layout of anything. It never takes a pointer event.
 */
withDefaults(
  defineProps<{
    /** Strength of the scanlines. 0 turns them off and leaves the vignette. */
    scanlines?: number;
    /** Strength of the vignette. 0 turns it off and leaves the lines. */
    vignette?: number;
  }>(),
  {
    scanlines: 0.22,
    vignette: 0.65,
  },
);
</script>

<template>
  <div class="ui-crt-overlay" aria-hidden="true">
    <div
      class="ui-crt-overlay__scanlines"
      :style="{ '--ui-crt-overlay-scanline-alpha': String(scanlines) }"
    ></div>
    <div
      class="ui-crt-overlay__vignette"
      :style="{ '--ui-crt-overlay-vignette-alpha': String(vignette) }"
    ></div>
  </div>
</template>
