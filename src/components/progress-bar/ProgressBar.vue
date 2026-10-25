<script setup lang="ts">
import { computed } from "vue";
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
  }>(),
  {
    value: 0,
    max: 100,
    indeterminate: false,
    label: "",
    startLabel: "",
    endLabel: "",
    size: "md",
  },
);

/** Clamped fill percentage (0–100). */
const percent = computed(() => {
  const max = props.max || 100;
  const ratio = (props.value / max) * 100;
  return Math.max(0, Math.min(100, ratio));
});

const rootClasses = computed(() => ({
  "ui-progress-bar": true,
  "ui-progress": true,
  "ui-progress--indeterminate": props.indeterminate,
  "ui-progress--sm": props.size === "sm",
  "ui-progress--lg": props.size === "lg",
  "ui-progress--ends": !!(props.startLabel || props.endLabel),
}));
</script>

<template>
  <div
    :class="rootClasses"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-label="label || undefined"
  >
    <span v-if="startLabel" class="ui-progress__end ui-progress__end--start" aria-hidden="true">{{ startLabel }}</span>
    <div class="ui-progress__track">
      <div
        class="ui-progress__fill"
        :style="indeterminate ? undefined : { width: percent + '%' }"
      ></div>
    </div>
    <span v-if="endLabel" class="ui-progress__end ui-progress__end--end" aria-hidden="true">{{ endLabel }}</span>
  </div>
</template>
