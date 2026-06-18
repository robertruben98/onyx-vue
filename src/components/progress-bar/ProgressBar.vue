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
  }>(),
  {
    value: 0,
    max: 100,
    indeterminate: false,
    label: "",
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
    <div class="ui-progress__track">
      <div
        class="ui-progress__fill"
        :style="indeterminate ? undefined : { width: percent + '%' }"
      ></div>
    </div>
  </div>
</template>
