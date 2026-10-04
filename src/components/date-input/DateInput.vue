<script setup lang="ts">
import { computed, useId } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "../input/input.scss";
import "./date-input.scss";

export type DateInputType = "date" | "time" | "datetime-local" | "month";
export type DateInputSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    /** What is picked: a day, a time, both, or a month. */
    type?: DateInputType;
    /** Visible label. */
    label?: string;
    /** Accessible name when there is no visible label. */
    ariaLabel?: string;
    /** Earliest accepted value, in the input's own format (`2026-10-04`, `09:00`). */
    min?: string;
    /** Latest accepted value. */
    max?: string;
    /** Control size. */
    size?: DateInputSize;
    /** Sets `aria-invalid` and the error style. */
    invalid?: boolean;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  { type: "date", label: "", ariaLabel: "", min: "", max: "", size: "md", invalid: false, disabled: false },
);

/** The value in the input's ISO format (`2026-10-04`, `13:00`, `2026-10-04T13:00`), or ''. */
const model = defineModel<string>({ default: "" });

const emit = defineEmits<{ valueChanged: [value: string] }>();

/**
 * The browser's own date and time pickers, styled like UiInput (gap G2: the
 * dashboard's "when" field was the only native input it had left). Native
 * means the locale's format, a keyboard-operable picker and a value in ISO
 * format, with nothing to parse.
 */
defineOptions({ inheritAttrs: false });
const inputId = `ui-date-input-${useId()}`;
const { rootAttrs, controlAttrs, controlId, fieldInvalid } = useForwardedAttrs(inputId, { field: true });
/** Invalido por su prop o por el UiFormField que lo envuelve. */
const isInvalid = (): boolean => props.invalid || fieldInvalid();

const rootClasses = computed(() => [
  "ui-input",
  "ui-date-input",
  {
    "ui-input--sm": props.size === "sm",
    "ui-input--lg": props.size === "lg",
    "ui-input--invalid": isInvalid(),
    "ui-input--disabled": props.disabled,
  },
  rootAttrs().class,
]);

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  model.value = value;
  emit("valueChanged", value);
}
</script>

<template>
  <span :class="rootClasses" :style="rootAttrs().style">
    <label v-if="label" class="ui-input__label" :for="controlId()">{{ label }}</label>
    <input
      v-bind="controlAttrs()"
      :id="controlId()"
      class="ui-input__el ui-date-input__el"
      :type="type"
      :value="model"
      :min="min || undefined"
      :max="max || undefined"
      :disabled="disabled"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="isInvalid() ? 'true' : undefined"
      @input="onInput"
    />
  </span>
</template>
