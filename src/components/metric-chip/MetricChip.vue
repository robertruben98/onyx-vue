<script lang="ts">
/** Semantic tone of a known value. */
export type MetricChipTone = "neutral" | "ok" | "warn" | "danger" | "info";

/**
 * What the chip has to report.
 *
 * `error` is its own state and not a zero with a red tone: "the count failed"
 * and "the count is nothing" are opposite claims, and a chip that shows 0 for
 * both is the reason this component does not take a bare number.
 */
export type MetricChipState = "known" | "pending" | "unrequested" | "error";
</script>

<script setup lang="ts">
import { computed } from "vue";
import { UiTriStateCount, type TriState } from "../tri-state-count";
import "./metric-chip.scss";

const props = withDefaults(
  defineProps<{
    /** What is being measured. Rendered as the chip's caption. */
    label: string;
    /** The measurement. Only read when `state` is `known`. */
    value?: number | null;
    /** Whether the value is a fact, in flight, unasked for, or failed. */
    state?: MetricChipState;
    /** Semantic tone of a known value. */
    tone?: MetricChipTone;
    /**
     * Marks a value that is being recomputed behind the scenes. It stays
     * readable — it was true a moment ago — but stops claiming to be current.
     */
    stale?: boolean;
    /** Renders a real button and emits `activated`. */
    interactive?: boolean;
    /** Glyph shown when the measurement failed. */
    errorGlyph?: string;
  }>(),
  {
    value: null,
    state: "known",
    tone: "neutral",
    stale: false,
    interactive: false,
    errorGlyph: "!",
  },
);

/** Emitted when an interactive chip is activated. */
const emit = defineEmits<{ activated: [] }>();

const failed = computed(() => props.state === "error");

/** The three states TriStateCount knows about; `error` is handled here. */
const countState = computed<TriState>(() =>
  failed.value ? "pending" : (props.state as TriState),
);

const rootClasses = computed(() => ({
  "ui-metric-chip": true,
  "ui-metric-chip--ok": !failed.value && props.tone === "ok",
  "ui-metric-chip--warn": !failed.value && props.tone === "warn",
  "ui-metric-chip--danger": failed.value || props.tone === "danger",
  "ui-metric-chip--info": !failed.value && props.tone === "info",
  "ui-metric-chip--stale": props.stale,
  "ui-metric-chip--interactive": props.interactive,
}));
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    :class="rootClasses"
    @click="interactive && emit('activated')"
  >
    <span class="ui-metric-chip__label">{{ label }}</span>
    <span
      v-if="failed"
      class="ui-metric-chip__value"
      role="img"
      :aria-label="`${label}: failed`"
      ><span aria-hidden="true">{{ errorGlyph }}</span></span
    >
    <UiTriStateCount
      v-else
      class="ui-metric-chip__value"
      :state="countState"
      :value="value"
      :tone="tone === 'info' ? 'neutral' : tone"
      :label="label"
    />
  </component>
</template>
