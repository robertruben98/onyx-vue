<script setup lang="ts">
import { computed } from "vue";
import "./tag.scss";

export type TagVariant =
  | "neutral"
  | "muted"
  | "info"
  | "success"
  | "warning"
  | "danger";

/** Filled (a pastille) or outline (a hairline box around the text). */
export type TagAppearance = "filled" | "outline";

const props = withDefaults(
  defineProps<{
    /** Visual variant (semantic role). */
    variant?: TagVariant;
    /**
     * `outline` draws only a hairline in the variant's colour. For the small
     * facts that sit inside a table cell — "draft", "3 checks rojos" — where a
     * row of filled pastilles would outshout the data next to them.
     */
    appearance?: TagAppearance;
    /** Whether a remove (close) button is shown. */
    removable?: boolean;
    /** Accessible name for the remove button. */
    removeLabel?: string;
  }>(),
  {
    variant: "neutral",
    appearance: "filled",
    removable: false,
    removeLabel: "Remove",
  },
);

/** Emitted when the remove button is activated. */
const emit = defineEmits<{ removed: [] }>();

const rootClasses = computed(() => ({
  "ui-tag": true,
  "ui-tag--neutral": props.variant === "neutral",
  "ui-tag--muted": props.variant === "muted",
  "ui-tag--info": props.variant === "info",
  "ui-tag--success": props.variant === "success",
  "ui-tag--warning": props.variant === "warning",
  "ui-tag--danger": props.variant === "danger",
  "ui-tag--outline": props.appearance === "outline",
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
