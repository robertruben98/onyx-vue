<script lang="ts">
import { canonicalTone, type LegacyTone } from "../../internal/tone";
/** Semantic tone of a known value. */
export type MetricChipTone = "neutral" | "info" | "success" | "warning" | "danger" | LegacyTone;

/**
 * What the chip has to report.
 *
 * `error` is its own state and not a zero with a red tone: "the count failed"
 * and "the count is nothing" are opposite claims, and a chip that shows 0 for
 * both is the reason this component does not take a bare number.
 */
export type MetricChipState = "known" | "pending" | "unrequested" | "error";

/** Which way of moving is good news: it decides the delta's tone, not its sign. */
export type MetricChipDeltaPolarity = "higher-is-better" | "lower-is-better";

/**
 * Words for a screen reader, `{n}` being the size of the change. The visible
 * `(+16)` is a sign and a number; read aloud it is "open paren plus sixteen".
 */
export interface MetricChipDeltaLabels {
  up: string;
  down: string;
  same: string;
}

export const DEFAULT_DELTA_LABELS: MetricChipDeltaLabels = {
  up: "up {n}",
  down: "down {n}",
  same: "unchanged",
};
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
    /**
     * The value before this one. Shows the change after the value — `74 (+16)`
     * — toned by `deltaPolarity`. Only when both numbers are known.
     */
    previous?: number | null;
    /** Whether going up is good (success) or bad (danger). No change is muted. */
    deltaPolarity?: MetricChipDeltaPolarity;
    /** What a screen reader hears for the change, `{n}` being its size. */
    deltaLabels?: MetricChipDeltaLabels;
  }>(),
  {
    value: null,
    state: "known",
    tone: "neutral",
    stale: false,
    interactive: false,
    errorGlyph: "!",
    previous: null,
    deltaPolarity: "higher-is-better",
    deltaLabels: () => DEFAULT_DELTA_LABELS,
  },
);

/** El tono con los nombres antiguos (`ok`, `warn`, `default`) ya traducidos. */
const tone = computed(() => canonicalTone(props.tone));

/** Emitted when an interactive chip is activated. */
const emit = defineEmits<{ activated: [] }>();

const failed = computed(() => props.state === "error");

/** The three states TriStateCount knows about; `error` is handled here. */
const countState = computed<TriState>(() =>
  failed.value ? "pending" : (props.state as TriState),
);

/**
 * El cambio respecto a `previous`, o `null` si no hay dos numeros que restar.
 * Redondeado a 6 decimales: 0.3 - 0.1 no debe pintarse como +0.19999999999999998.
 */
const delta = computed<number | null>(() => {
  if (failed.value || props.state !== "known") return null;
  if (props.value == null || props.previous == null) return null;
  return Math.round((props.value - props.previous) * 1e6) / 1e6;
});

const direction = computed(() =>
  delta.value === null ? null : delta.value > 0 ? "up" : delta.value < 0 ? "down" : "same",
);

const deltaClasses = computed(() => {
  const d = direction.value;
  const good = d === "same" ? null : (d === "up") === (props.deltaPolarity === "higher-is-better");
  return {
    "ui-metric-chip__delta": true,
    [`ui-metric-chip__delta--${d}`]: true,
    "ui-metric-chip__delta--good": good === true,
    "ui-metric-chip__delta--bad": good === false,
  };
});

/** `+16`, `−3` (signo menos de verdad, U+2212), `±0`. */
const deltaText = computed(() => {
  const d = delta.value ?? 0;
  if (d === 0) return "±0";
  return d > 0 ? `+${d}` : `\u2212${Math.abs(d)}`;
});

const deltaSpoken = computed(() => {
  const d = direction.value ?? "same";
  return props.deltaLabels[d].replace("{n}", String(Math.abs(delta.value ?? 0)));
});

const rootClasses = computed(() => ({
  "ui-metric-chip": true,
  "ui-metric-chip--ok": !failed.value && tone.value === "success",
  "ui-metric-chip--warn": !failed.value && tone.value === "warning",
  "ui-metric-chip--danger": failed.value || tone.value === "danger",
  "ui-metric-chip--info": !failed.value && tone.value === "info",
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
      :tone="tone === 'info' || tone === 'muted' ? 'neutral' : tone"
      :label="label"
    />
    <span v-if="direction" :class="deltaClasses"
      ><span aria-hidden="true">({{ deltaText }})</span
      ><span class="ui-metric-chip__sr">{{ deltaSpoken }}</span></span
    >
  </component>
</template>
