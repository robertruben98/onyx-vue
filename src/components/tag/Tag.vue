<script setup lang="ts">
import { computed } from "vue";
import "./tag.scss";

export type TagVariant = "neutral" | "info" | "success" | "warning" | "danger";

const props = withDefaults(
  defineProps<{
    /** Visual variant (semantic role). */
    variant?: TagVariant;
    /** Whether a remove (close) button is shown. */
    removable?: boolean;
    /** Accessible name for the remove button. */
    removeLabel?: string;
  }>(),
  {
    variant: "neutral",
    removable: false,
    removeLabel: "Remove",
  },
);

/** Emitted when the remove button is activated. */
const emit = defineEmits<{ removed: [] }>();

const rootClasses = computed(() => ({
  "ui-tag": true,
  "ui-tag--neutral": props.variant === "neutral",
  "ui-tag--info": props.variant === "info",
  "ui-tag--success": props.variant === "success",
  "ui-tag--warning": props.variant === "warning",
  "ui-tag--danger": props.variant === "danger",
}));

function remove(): void {
  emit("removed");
}
</script>

<template>
  <span :class="rootClasses">
    <span class="ui-tag__label"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="ui-tag__remove"
      :aria-label="removeLabel"
      @click="remove"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </span>
</template>
