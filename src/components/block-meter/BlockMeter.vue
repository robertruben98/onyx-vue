<script lang="ts">
/** Semantic tone applied to the filled part of the meter. */
export type BlockMeterTone = "neutral" | "ok" | "warn" | "danger" | "info";
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./block-meter.scss";

const props = withDefaults(
  defineProps<{
    /** Current value. */
    value: number;
    /** Value that fills the meter. */
    max?: number;
    /** How many blocks the meter is drawn with. */
    blocks?: number;
    /** Accessible name — what is being measured. */
    label?: string;
    /** Semantic tone of the filled part. */
    tone?: BlockMeterTone;
    /** Renders `value/max` after the blocks. */
    showRatio?: boolean;
    /** Glyph for a filled block. */
    filledGlyph?: string;
    /** Glyph for an empty block. */
    emptyGlyph?: string;
  }>(),
  {
    max: 100,
    blocks: 8,
    label: "",
    tone: "neutral",
    showRatio: false,
    filledGlyph: "▰",
    emptyGlyph: "▱",
  },
);

/**
 * A meter drawn in text rather than in boxes.
 *
 * It reads at 11px in a row that is already dense, it costs no layout, and it
 * survives being copied out of the page as text — which a `<div>` bar does
 * not. `UiProgressBar` is the graphical one; this is the one for a table cell.
 */
const filled = computed(() => {
  const span = props.max || 1;
  const ratio = props.value / span;
  const n = Math.round(ratio * props.blocks);
  return Math.max(0, Math.min(props.blocks, n));
});

const empty = computed(() => props.blocks - filled.value);

/**
 * The name states the measurement, never the glyphs: a screen reader reading
 * out eight black squares tells nobody how full the meter is.
 */
const ariaLabel = computed(() => {
  const measure = `${props.value} of ${props.max}`;
  return props.label ? `${props.label}: ${measure}` : measure;
});

const rootClasses = computed(() => ({
  "ui-block-meter": true,
  "ui-block-meter--ok": props.tone === "ok",
  "ui-block-meter--warn": props.tone === "warn",
  "ui-block-meter--danger": props.tone === "danger",
  "ui-block-meter--info": props.tone === "info",
}));
</script>

<template>
  <span
    :class="rootClasses"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    <span class="ui-block-meter__blocks" aria-hidden="true"
      ><span class="ui-block-meter__filled">{{ filledGlyph.repeat(filled) }}</span
      ><span class="ui-block-meter__empty">{{ emptyGlyph.repeat(empty) }}</span></span
    >
    <span v-if="showRatio" class="ui-block-meter__ratio" aria-hidden="true"
      >{{ value }}/{{ max }}</span
    >
  </span>
</template>
