<script setup lang="ts">
import "./chip.scss";

/**
 * Suggestion chip: a small one-shot action ("Give me an example", "Shorter").
 *
 * It is not a filter. UiFilterChip toggles (aria-pressed) and carries a match
 * count; a suggestion does something once and has no on/off state, so it is a
 * plain button with a chip's shape. Use UiChipRow to lay a set of them out.
 */
const props = withDefaults(
  defineProps<{
    /** Disabled state — a disabled chip never emits `clicked`. */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

/** Emitted on activation, only while enabled. */
const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

function activate(event: MouseEvent): void {
  if (props.disabled) return;
  emit("clicked", event);
}
</script>

<template>
  <button type="button" class="ui-chip" :disabled="disabled" @click="activate">
    <span v-if="$slots.leading" class="ui-chip__icon" aria-hidden="true"><slot name="leading" /></span>
    <span class="ui-chip__label"><slot /></span>
  </button>
</template>
