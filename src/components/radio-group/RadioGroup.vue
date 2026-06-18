<script setup lang="ts">
import { computed } from "vue";
import "./radio-group.scss";

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** Options to render: { label, value, disabled? }. */
    options: RadioOption[];
    /** Visible group label — rendered as a <legend>. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled — disables the whole group. */
    disabled?: boolean;
  }>(),
  {
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
  },
);

/** Two-way bound selected value (v-model). */
const value = defineModel<string>({ default: "" });

/** Emitted on every selection change. */
const emit = defineEmits<{ valueChange: [value: string] }>();

const name = `ui-radio-${nextId++}`;

const rootClasses = computed(() => ({
  "ui-radio-group": true,
  "ui-radio-group--invalid": props.invalid,
  "ui-radio-group--disabled": props.disabled,
}));

function select(optValue: string): void {
  if (props.disabled) return;
  value.value = optValue;
  emit("valueChange", optValue);
}
</script>

<template>
  <span :class="rootClasses">
    <fieldset
      class="ui-radio-group__fieldset"
      role="radiogroup"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
    >
      <legend v-if="label" class="ui-radio-group__legend">{{ label }}</legend>
      <label v-for="opt in options" :key="opt.value" class="ui-radio">
        <input
          class="ui-radio__el"
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="value === opt.value"
          :disabled="disabled || !!opt.disabled"
          @change="select(opt.value)"
        />
        <span class="ui-radio__label">{{ opt.label }}</span>
      </label>
    </fieldset>
  </span>
</template>
