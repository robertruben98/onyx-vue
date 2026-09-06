<script setup lang="ts">
import { computed, ref, useId } from "vue";
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

const uid = useId();
const inputId = `ui-input-${uid}`;

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
/**
 * Foco programatico. Sin esto, quien quiera enfocar la caja tiene que sacar el
 * `<input>` del DOM por su cuenta — y un `ref` sobre `<UiInput>` devuelve la
 * instancia del componente, no un elemento, asi que el intento natural
 * (`ref.querySelector("input")`) revienta con "querySelector is not a
 * function". Se expone tambien `select` porque enfocar para reescribir el
 * contenido es el caso que sigue.
 */
const elemento = ref<HTMLInputElement | null>(null);

function focus(opciones?: FocusOptions): void {
  elemento.value?.focus(opciones);
}

function select(): void {
  elemento.value?.select();
}

defineExpose({ focus, select, elemento });
</script>

<template>
  <span :class="rootClasses">
    <label v-if="label" class="ui-input__label" :for="inputId">{{
      label
    }}</label>
    <input
      ref="elemento"
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
