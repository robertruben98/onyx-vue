<script setup lang="ts">
import { computed, ref } from "vue";
import "./textarea.scss";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** Number of visible text rows. */
    rows?: number;
    /** Placeholder text. */
    placeholder?: string;
    /** Visible label — when set, renders a <label> linked to the control. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  {
    rows: 3,
    placeholder: "",
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
  },
);

/** Two-way bound value (v-model). */
const model = defineModel<string>({ default: "" });

/** Emitted on every value change (in addition to v-model). */
const emit = defineEmits<{ valueChange: [value: string] }>();

const inputId = `ui-textarea-${nextId++}`;

const rootClasses = computed(() => ({
  "ui-textarea": true,
  "ui-textarea--invalid": props.invalid,
  "ui-textarea--disabled": props.disabled,
}));

const touched = ref(false);

function handleInput(event: Event): void {
  if (props.disabled) {
    return;
  }
  const value = (event.target as HTMLTextAreaElement).value;
  model.value = value;
  emit("valueChange", value);
}

function handleBlur(): void {
  touched.value = true;
}
</script>

<template>
  <span :class="rootClasses">
    <label v-if="label" class="ui-textarea__label" :for="inputId">{{
      label
    }}</label>
    <textarea
      class="ui-textarea__el"
      :id="inputId"
      :rows="rows"
      :value="model"
      :disabled="disabled"
      :placeholder="placeholder || undefined"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      @input="handleInput"
      @blur="handleBlur"
    ></textarea>
  </span>
</template>
