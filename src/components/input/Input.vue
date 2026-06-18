<script setup lang="ts">
import { computed } from "vue";
import "./input.scss";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";
export type InputSize = "sm" | "md" | "lg";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** Native input type. */
    type?: InputType;
    /** Control size. */
    size?: InputSize;
    /** Placeholder text. */
    placeholder?: string;
    /** Visible label — when set, renders a <label> linked to the input. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  {
    type: "text",
    size: "md",
    placeholder: "",
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
  },
);

/** Emitted on every value change (in addition to v-model). */
const emit = defineEmits<{ valueChange: [value: string] }>();

/** Two-way bound value (v-model). */
const value = defineModel<string>({ default: "" });

const inputId = `ui-input-${nextId++}`;

const rootClasses = computed(() => ({
  "ui-input": true,
  "ui-input--sm": props.size === "sm",
  "ui-input--lg": props.size === "lg",
  "ui-input--invalid": props.invalid,
  "ui-input--disabled": props.disabled,
}));

function handleInput(event: Event): void {
  if (props.disabled) {
    return;
  }
  const next = (event.target as HTMLInputElement).value;
  value.value = next;
  emit("valueChange", next);
}
</script>

<template>
  <span :class="rootClasses">
    <label v-if="label" class="ui-input__label" :for="inputId">{{
      label
    }}</label>
    <input
      class="ui-input__el"
      :id="inputId"
      :type="type"
      :value="value"
      :disabled="disabled"
      :placeholder="placeholder || undefined"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      @input="handleInput"
    />
  </span>
</template>
