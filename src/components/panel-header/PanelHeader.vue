<script setup lang="ts">
import { computed } from "vue";
import "./panel-header.scss";

/**
 * The header of a list panel (the chat list, a folder list): a 64 px bar with
 * the panel title on the left and a row of action buttons on the right.
 */
const props = withDefaults(
  defineProps<{
    /** Panel title. Rendered as the heading. */
    title?: string;
    /** Heading level of the title; `0` renders plain text. */
    headingLevel?: 0 | 1 | 2 | 3;
  }>(),
  { title: "", headingLevel: 2 },
);

const titleTag = computed(() => (props.headingLevel === 0 ? "span" : `h${props.headingLevel}`));
</script>

<template>
  <header class="ui-panel-header">
    <div class="ui-panel-header__title-slot">
      <slot name="title">
        <component :is="titleTag" v-if="title" class="ui-panel-header__title">{{ title }}</component>
      </slot>
    </div>
    <div v-if="$slots.actions" class="ui-panel-header__actions"><slot name="actions" /></div>
  </header>
</template>
