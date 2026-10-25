<script setup lang="ts">
import { computed } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./button.scss";

export type ButtonVariant = "primary" | "secondary" | "danger" | "text";
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
    /** Full width: the button fills its container (a block-level root). */
    block?: boolean;
    /**
     * Lets a long label wrap onto more lines: the height becomes a minimum
     * instead of a fixed value, so the text never spills out of the button.
     */
    wrap?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
    loading: false,
    block: false,
    wrap: false,
  },
);

/** Emitted on activation when interactive. */
const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

// Los atributos del consumidor van al elemento nativo, no a la envoltura
// (ver internal/forward-attrs.ts).
defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs } = useForwardedAttrs();

const isInteractive = computed(() => !props.disabled && !props.loading);

const rootClasses = computed(() => ({
  "ui-button": true,
  "ui-button--primary": props.variant === "primary",
  "ui-button--secondary": props.variant === "secondary",
  "ui-button--danger": props.variant === "danger",
  "ui-button--text": props.variant === "text",
  "ui-button--sm": props.size === "sm",
  "ui-button--lg": props.size === "lg",
  "ui-button--loading": props.loading,
  "ui-button--disabled": props.disabled,
  "ui-button--block": props.block,
  "ui-button--wrap": props.wrap,
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
  <span :class="[rootClasses, rootAttrs().class]" :style="rootAttrs().style">
    <button
      v-bind="controlAttrs()"
      class="ui-button__el"
      :type="type"
      :disabled="disabled || loading"
      :aria-busy="loading ? 'true' : undefined"
      @click="handleClick"
    >
      <span v-if="loading" class="ui-button__spinner" aria-hidden="true"></span>
      <span v-else-if="$slots.leading" class="ui-button__icon ui-button__icon--leading" aria-hidden="true"
        ><slot name="leading"
      /></span>
      <span class="ui-button__label"><slot /></span>
      <span v-if="$slots.trailing" class="ui-button__icon ui-button__icon--trailing" aria-hidden="true"
        ><slot name="trailing"
      /></span>
    </button>
  </span>
</template>
