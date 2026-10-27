<script setup lang="ts">
import { computed } from "vue";
import "./fieldset.scss";

/**
 * A group of settings under one caption, with an optional note underneath.
 *
 * Settings dialogs in a console tend to be long lists of checkboxes, and the
 * part that matters is usually the note: what hiding a column really does,
 * what a refresh costs. The note is a first-class slot so it sits in the same
 * place in every group and nobody has to style a `<p>` again.
 *
 * `columns` lays checkboxes out in a grid; rows of `UiFieldRow` (label +
 * control) read better in one column, which is the default.
 */
const props = withDefaults(
  defineProps<{
    /** The group's caption. */
    legend: string;
    /** Grid columns for the items. */
    columns?: 1 | 2 | 3;
  }>(),
  { columns: 1 },
);

const bodyClasses = computed(() => [
  "ui-fieldset__body",
  `ui-fieldset__body--cols-${props.columns}`,
]);
</script>

<template>
  <fieldset class="ui-fieldset">
    <legend class="ui-fieldset__legend">{{ legend }}</legend>
    <div :class="bodyClasses"><slot /></div>
    <p v-if="$slots.note" class="ui-fieldset__note"><slot name="note" /></p>
  </fieldset>
</template>
