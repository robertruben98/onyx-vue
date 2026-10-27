<script lang="ts">
/** Tones a ring can be painted in. */
export type RingTone = "primary" | "success" | "warning" | "danger" | "neutral";

// Module scope on purpose (see id-scope.test.ts): `useId()` is unique within one
// app only, and a gradient id has to be unique in the whole document, where
// several apps (a docs page of demos) can each render a ring.
let ringSeq = 0;
</script>

<script setup lang="ts">
import { computed, useId } from "vue";
import "./ring-svg.scss";

/**
 * The drawing shared by UiProgressRing and the progress ring of UiAvatar: a
 * track and an arc in a 100×100 viewBox, so it scales to whatever box holds
 * it. It carries no semantics; the component that uses it owns the role and
 * the accessible name, and this is always `aria-hidden`.
 *
 * The arc uses `pathLength="100"`, so the dash offset is the percentage left
 * and nothing depends on the radius.
 */
const props = withDefaults(
  defineProps<{
    /** Filled percentage, 0–100. `null` draws the indeterminate arc. */
    percent: number | null;
    /** Stroke width in viewBox units (the ring is 100 wide). */
    thickness?: number;
    tone?: RingTone;
    /** Paints the arc with the `--ui-progress-ring-gradient-*` pair instead of one colour. */
    gradient?: boolean;
  }>(),
  { thickness: 10, tone: "primary", gradient: false },
);

const gradientId = `ui-ring-${useId()}-${++ringSeq}`;
const stroke = computed(() => Math.min(Math.max(props.thickness, 1), 40));
const radius = computed(() => 50 - stroke.value / 2);
const offset = computed(() => (props.percent === null ? 75 : 100 - props.percent));
// A round cap at 0% still paints a dot: an empty ring has no arc at all.
const empty = computed(() => props.percent !== null && props.percent <= 0);
</script>

<template>
  <svg
    :class="['ui-ring', `ui-ring--${tone}`, { 'ui-ring--indeterminate': percent === null }]"
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <defs v-if="gradient">
      <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" class="ui-ring__stop-from" />
        <stop offset="1" class="ui-ring__stop-to" />
      </linearGradient>
    </defs>
    <circle class="ui-ring__track" cx="50" cy="50" :r="radius" :stroke-width="stroke" />
    <circle
      v-if="!empty"
      class="ui-ring__arc"
      cx="50"
      cy="50"
      :r="radius"
      :stroke-width="stroke"
      pathLength="100"
      stroke-dasharray="100"
      :stroke-dashoffset="offset"
      :style="gradient ? { stroke: `url(#${gradientId})` } : undefined"
    />
  </svg>
</template>
