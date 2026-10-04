<script setup lang="ts">
import { computed, useId } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./slider.scss";

const props = withDefaults(
  defineProps<{
    /** Lowest value. */
    min?: number;
    /** Highest value. */
    max?: number;
    /** Distance between values. */
    step?: number;
    /** Visible label. */
    label?: string;
    /** Accessible name when there is no visible label. */
    ariaLabel?: string;
    /** Shows the current value next to the label. */
    showValue?: boolean;
    /**
     * Turns the value into words: shown with `showValue` and read by screen
     * readers as `aria-valuetext` ("40 %", "3 replicas").
     */
    valueText?: (value: number) => string;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    label: "",
    ariaLabel: "",
    showValue: false,
    valueText: undefined,
    disabled: false,
  },
);

/** The value (v-model). */
const model = defineModel<number>({ default: 0 });

const emit = defineEmits<{ valueChanged: [value: number] }>();

// Los atributos del consumidor van al <input type="range">, no a la envoltura.
defineOptions({ inheritAttrs: false });
const inputId = `ui-slider-${useId()}`;
const { rootAttrs, controlAttrs, controlId } = useForwardedAttrs(inputId);

const hasValueText = computed(() => typeof props.valueText === "function");
const text = computed(() => {
  const format = props.valueText;
  return format ? format(model.value) : String(model.value);
});

/** Where the fill ends, 0–100: the track is painted with it. */
const fill = computed(() => {
  const span = props.max - props.min;
  if (span <= 0) return 0;
  return Math.min(100, Math.max(0, ((model.value - props.min) / span) * 100));
});

function onInput(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value);
  model.value = value;
  emit("valueChanged", value);
}
</script>

<template>
  <span
    :class="['ui-slider', { 'ui-slider--disabled': disabled }, rootAttrs().class]"
    :style="[{ '--ui-slider-fill-at': `${fill}%` }, rootAttrs().style as never]"
  >
    <span v-if="label || showValue" class="ui-slider__head">
      <label v-if="label" class="ui-slider__label" :for="controlId()">{{ label }}</label>
      <output v-if="showValue" class="ui-slider__value" :for="controlId()">{{ text }}</output>
    </span>
    <input
      v-bind="controlAttrs()"
      :id="controlId()"
      class="ui-slider__el"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="model"
      :disabled="disabled"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-valuetext="hasValueText ? text : undefined"
      @input="onInput"
    />
  </span>
</template>
