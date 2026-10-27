<script lang="ts">
export type ProgressRingSize = "sm" | "md" | "lg" | "xl";
export type { RingTone as ProgressRingTone } from "../../internal/RingSvg.vue";
</script>

<script setup lang="ts">
import { computed } from "vue";
import RingSvg, { type RingTone } from "../../internal/RingSvg.vue";
import "./progress-ring.scss";

/**
 * Circular progress: a level, a day's goal, the readiness for an exam.
 *
 * A `progressbar` with `aria-valuenow/min/max` (and `aria-valuetext` when the
 * number alone says too little: "56 of 100 XP"). When the progress is unknown
 * (`indeterminate`) it is a `role="img"` named by `label`, spinning unless the
 * person asked for reduced motion.
 *
 * The centre shows the percentage with `showValue`, or anything through the
 * default slot (a level number, an icon). The centre is drawn, not read: a
 * progressbar's children are presentational, so put what a screen reader needs
 * in `label` and `valueText`.
 */
const props = withDefaults(
  defineProps<{
    /** Current value. */
    value?: number;
    /** Value of a full ring. */
    max?: number;
    /** `sm` 40px, `md` 64px, `lg` 96px, `xl` 128px (tokens), or a size in px. */
    size?: ProgressRingSize | number;
    /** Stroke width as a percentage of the diameter. Defaults to 12 for `sm`, 10 otherwise. */
    thickness?: number;
    /** Colour of the arc. */
    tone?: RingTone;
    /** Paints the arc with the brand gradient (`--ui-progress-ring-gradient-from/to`). */
    gradient?: boolean;
    /** Accessible name. */
    label?: string;
    /** Spoken value instead of the bare number, e.g. "56 of 100 XP". */
    valueText?: string;
    /** Unknown progress: `role="img"` and a spinning arc. */
    indeterminate?: boolean;
    /** Shows the rounded percentage in the centre (the default slot replaces it). */
    showValue?: boolean;
  }>(),
  {
    value: 0,
    max: 100,
    size: "md",
    thickness: undefined,
    tone: "primary",
    gradient: false,
    label: "",
    valueText: undefined,
    indeterminate: false,
    showValue: false,
  },
);

/** Clamped percentage, 0–100. */
const percent = computed(() => {
  if (!props.max || props.max <= 0) return 0;
  return Math.max(0, Math.min(100, (props.value / props.max) * 100));
});

const stroke = computed(() => props.thickness ?? (props.size === "sm" ? 12 : 10));

const rootClasses = computed(() => ({
  "ui-progress-ring": true,
  [`ui-progress-ring--${props.size}`]: typeof props.size === "string",
}));

const rootStyle = computed(() =>
  typeof props.size === "number" ? { "--ui-progress-ring-size": `${props.size}px` } : undefined,
);

const a11y = computed(() =>
  props.indeterminate
    ? { role: "img", "aria-label": props.label || undefined }
    : {
        role: "progressbar",
        "aria-label": props.label || undefined,
        "aria-valuemin": 0,
        "aria-valuemax": props.max,
        "aria-valuenow": Math.max(0, Math.min(props.value, props.max)),
        "aria-valuetext": props.valueText || undefined,
      },
);
</script>

<template>
  <div :class="rootClasses" :style="rootStyle" v-bind="a11y">
    <RingSvg :percent="indeterminate ? null : percent" :thickness="stroke" :tone="tone" :gradient="gradient" />
    <div v-if="$slots.default || (showValue && !indeterminate)" class="ui-progress-ring__center">
      <slot>
        <span class="ui-progress-ring__value">{{ Math.round(percent) }}<span class="ui-progress-ring__unit">%</span></span>
      </slot>
    </div>
  </div>
</template>
