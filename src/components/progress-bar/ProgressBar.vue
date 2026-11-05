<script setup lang="ts">
import { computed } from "vue";
import { useOnyxLocale } from "../../locale";
import "./progress-bar.scss";

const props = withDefaults(
  defineProps<{
    /** Current value. */
    value?: number;
    /** Maximum value. */
    max?: number;
    /** Indeterminate (unknown progress) mode. */
    indeterminate?: boolean;
    /** Accessible label. */
    label?: string;
    /** Text at the start of the bar ("18"). Visual only: the aria values do not change. */
    startLabel?: string;
    /** Text at the end of the bar ("19"). Visual only. */
    endLabel?: string;
    /** Thickness of the bar. */
    size?: "sm" | "md" | "lg";
    /**
     * A projected change drawn as a second segment after `value` ("24/150 →
     * 44/150 with the proposal": `value` 24, `delta` 20). The part that would
     * pass `max` is drawn in the danger colour and clamped to the track.
     */
    delta?: number;
    /**
     * Spoken value (`aria-valuetext`). With a `delta` it defaults to the
     * locale text "{value} of {max}, {total} with the change".
     */
    valueText?: string;
  }>(),
  {
    value: 0,
    max: 100,
    indeterminate: false,
    label: "",
    startLabel: "",
    endLabel: "",
    size: "md",
    delta: 0,
    valueText: "",
  },
);

const messages = useOnyxLocale();

/** Clamped fill percentage (0–100). */
const percent = computed(() => {
  const max = props.max || 100;
  const ratio = (props.value / max) * 100;
  return Math.max(0, Math.min(100, ratio));
});

const pct = (n: number) => Math.max(0, Math.min(100, (n / (props.max || 100)) * 100));

/** Tramo del delta que cabe en la pista y tramo que se pasaria del maximo. */
const deltaPercent = computed(() => {
  if (props.indeterminate || props.delta <= 0) return 0;
  return pct(Math.min(props.value + props.delta, props.max || 100)) - percent.value;
});
const overflows = computed(() => !props.indeterminate && props.delta > 0 && props.value + props.delta > (props.max || 100));

const ariaValueText = computed(() => {
  if (props.valueText) return props.valueText;
  if (props.indeterminate || props.delta <= 0) return undefined;
  return messages.progressBarDeltaValueText
    .replace("{value}", String(props.value))
    .replace("{max}", String(props.max))
    .replace("{total}", String(props.value + props.delta));
});

const rootClasses = computed(() => ({
  "ui-progress-bar": true,
  "ui-progress": true,
  "ui-progress--indeterminate": props.indeterminate,
  "ui-progress--sm": props.size === "sm",
  "ui-progress--lg": props.size === "lg",
  "ui-progress--ends": !!(props.startLabel || props.endLabel),
  "ui-progress--delta": deltaPercent.value > 0,
  "ui-progress--overflow": overflows.value,
}));
</script>

<template>
  <div
    :class="rootClasses"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-valuetext="ariaValueText"
    :aria-label="label || undefined"
  >
    <span v-if="startLabel" class="ui-progress__end ui-progress__end--start" aria-hidden="true">{{ startLabel }}</span>
    <div class="ui-progress__track">
      <div
        class="ui-progress__fill"
        :style="indeterminate ? undefined : { width: percent + '%' }"
      ></div>
      <div
        v-if="deltaPercent > 0"
        class="ui-progress__delta"
        :style="{ width: deltaPercent + '%' }"
      ></div>
    </div>
    <span v-if="endLabel" class="ui-progress__end ui-progress__end--end" aria-hidden="true">{{ endLabel }}</span>
  </div>
</template>
