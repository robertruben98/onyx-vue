<script setup lang="ts">
import { computed, useSlots } from "vue";
import "./card.scss";

export type CardVariant = "elevated" | "outlined";

const props = withDefaults(
  defineProps<{
    /** Visual variant. */
    variant?: CardVariant;
  }>(),
  {
    variant: "elevated",
  },
);

const slots = useSlots();

const rootClasses = computed(() => ({
  "ui-card": true,
  "ui-card--elevated": props.variant === "elevated",
  "ui-card--outlined": props.variant === "outlined",
}));
</script>

<template>
  <div :class="rootClasses">
    <div v-if="slots.header" class="ui-card__header">
      <slot name="header" />
    </div>
    <div class="ui-card__body">
      <slot />
    </div>
    <div v-if="slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
