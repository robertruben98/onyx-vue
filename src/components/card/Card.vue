<script setup lang="ts">
import { computed, useSlots } from "vue";
import "./card.scss";

export type CardVariant = "elevated" | "outlined";
/** The element the card renders as. `button` and `a` make the whole card one control. */
export type CardElement = "div" | "button" | "a";

const props = withDefaults(
  defineProps<{
    /** Visual variant. */
    variant?: CardVariant;
    /**
     * Root element. `div` (default) is a plain surface. `button` and `a` make
     * the whole card a single interactive control with hover, focus and
     * pressed states and a 44px minimum height.
     */
    as?: CardElement;
    /** Link target when `as="a"`. */
    href?: string;
    /** Disables an `as="button"` card. Ignored for the other elements. */
    disabled?: boolean;
  }>(),
  {
    variant: "elevated",
    as: "div",
    href: undefined,
    disabled: false,
  },
);

const slots = useSlots();

const interactive = computed(() => props.as === "button" || props.as === "a");

// A <button> may only hold phrasing content, so an interactive card renders its
// parts as spans (laid out as blocks by the stylesheet) instead of divs.
const part = computed(() => (interactive.value ? "span" : "div"));

const rootClasses = computed(() => ({
  "ui-card": true,
  "ui-card--elevated": props.variant === "elevated",
  "ui-card--outlined": props.variant === "outlined",
  "ui-card--interactive": interactive.value,
}));

const rootAttrs = computed(() => {
  if (props.as === "button") return { type: "button", disabled: props.disabled || undefined };
  if (props.as === "a") return { href: props.href };
  return {};
});
</script>

<template>
  <component :is="as" :class="rootClasses" v-bind="rootAttrs">
    <component :is="part" v-if="slots.header" class="ui-card__header">
      <slot name="header" />
    </component>
    <component :is="part" class="ui-card__body">
      <slot />
    </component>
    <component :is="part" v-if="slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </component>
  </component>
</template>
