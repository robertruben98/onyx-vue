<script setup lang="ts">
import { computed } from "vue";
import "./button.scss";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonType = "button" | "submit" | "reset";

const props = withDefaults(
  defineProps<{
    /** Visual variant. */
    variant?: ButtonVariant;
    /** Control size. */
    size?: ButtonSize;
    /** Native button type. */
    type?: ButtonType;
    /** Disabled state — a disabled button never emits `clicked`. */
    disabled?: boolean;
    /** Loading state — shows a spinner and suppresses interaction. */
    loading?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
    loading: false,
  },
);

/** Emitted on activation when interactive. */
const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

const isInteractive = computed(() => !props.disabled && !props.loading);

const rootClasses = computed(() => ({
  "ui-button": true,
  "ui-button--primary": props.variant === "primary",
  "ui-button--secondary": props.variant === "secondary",
  "ui-button--text": props.variant === "text",
  "ui-button--sm": props.size === "sm",
  "ui-button--lg": props.size === "lg",
  "ui-button--loading": props.loading,
  "ui-button--disabled": props.disabled,
}));

function handleClick(event: MouseEvent): void {
  if (!isInteractive.value) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  emit("clicked", event);
}
</script>

<template>
  <span :class="rootClasses">
    <button
      class="ui-button__el"
      :type="type"
      :disabled="disabled || loading"
      :aria-busy="loading ? 'true' : undefined"
      @click="handleClick"
    >
      <span v-if="loading" class="ui-button__spinner" aria-hidden="true"></span>
      <span class="ui-button__label"><slot /></span>
    </button>
  </span>
</template>
