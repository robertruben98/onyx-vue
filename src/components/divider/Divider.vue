<script setup lang="ts">
import { computed } from "vue";
import "./divider.scss";

export type DividerOrientation = "horizontal" | "vertical";

const props = withDefaults(
  defineProps<{
    /** Layout orientation. */
    orientation?: DividerOrientation;
    /** Optional centered label (horizontal only). */
    label?: string;
  }>(),
  {
    orientation: "horizontal",
    label: "",
  },
);

const rootClasses = computed(() => ({
  "ui-divider": true,
  "ui-divider--horizontal": props.orientation === "horizontal",
  "ui-divider--vertical": props.orientation === "vertical",
  "ui-divider--labelled": !!props.label,
}));
</script>

<template>
  <div role="separator" :aria-orientation="orientation" :class="rootClasses">
    <template v-if="label">
      <span class="ui-divider__line" aria-hidden="true"></span>
      <span class="ui-divider__label">{{ label }}</span>
      <span class="ui-divider__line" aria-hidden="true"></span>
    </template>
  </div>
</template>
