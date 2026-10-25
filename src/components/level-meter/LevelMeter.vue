<script setup lang="ts">
import { computed } from "vue";
import "./level-meter.scss";

/**
 * A live input level as a row of bars (a microphone while recording). The
 * middle bars weigh more, like a wave; silence leaves them at a low floor
 * instead of disappearing, so the meter still reads as "listening".
 *
 * Feed it `level` (0–1) as often as you like: each bar is a scaleY transform
 * with a short transition that smooths the jumps, and under reduced motion
 * the transition is off (the bars still show the level, without easing).
 *
 * Decorative by default (`aria-hidden`). With `label` it is an image with that
 * name — but the name never carries the value: a number that changes many
 * times a second is noise to a screen reader.
 */
const props = withDefaults(
  defineProps<{
    /** Input level, 0 (silence) to 1 (loudest). Clamped. */
    level?: number;
    /** Number of bars (at least 3). */
    bars?: number;
    /** Accessible name; when unset the meter is aria-hidden. */
    label?: string;
  }>(),
  {
    level: 0,
    bars: 5,
    label: undefined,
  },
);

/** Lowest bar height, so a silent meter is still visible. */
const FLOOR = 0.15;

const count = computed(() => Math.max(3, Math.round(props.bars)));

const scales = computed(() => {
  const level = Number.isFinite(props.level) ? Math.min(1, Math.max(0, props.level)) : 0;
  const mid = (count.value - 1) / 2;
  return Array.from({ length: count.value }, (_, i) => {
    const weight = 1 - Math.abs(i - mid) / (mid + 1);
    return Math.max(FLOOR, Math.min(1, level * (0.6 + weight)));
  });
});
</script>

<template>
  <span
    class="ui-level-meter"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span
      v-for="(scale, i) in scales"
      :key="i"
      class="ui-level-meter__bar"
      :style="{ transform: `scaleY(${scale.toFixed(3)})` }"
    />
  </span>
</template>
