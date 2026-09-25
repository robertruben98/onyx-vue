<script setup lang="ts">
import { useId } from "vue";
import "./fieldset.scss";

/**
 * One setting: its label on the left and the control on the right.
 *
 * The label is not a `<label for>`, because the control is whatever the
 * consumer puts in the slot and may not be a native input (a `UiSelect` is a
 * button with a listbox). Instead the slot receives `labelId`, and the control
 * takes it as `aria-labelledby` — the one wiring that works for both.
 */
defineProps<{
  /** What the setting is. */
  label: string;
}>();

const labelId = `ui-field-row-${useId()}`;
</script>

<template>
  <div class="ui-field-row">
    <span :id="labelId" class="ui-field-row__label">{{ label }}</span>
    <div class="ui-field-row__control"><slot :label-id="labelId" /></div>
  </div>
</template>
