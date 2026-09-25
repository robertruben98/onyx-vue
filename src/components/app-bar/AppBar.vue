<script setup lang="ts">
import { computed } from "vue";
import "./app-bar.scss";

/**
 * The bar across the top of a console page: what you are looking at on the
 * left, how things stand in the middle, and what you can do on the right.
 *
 * It wraps instead of overflowing. A console bar collects things over time —
 * a budget meter, a token chip, a stamp, three buttons — and at some width
 * they stop fitting; a second row is readable, a horizontal scrollbar across
 * the whole page is not.
 */
const props = withDefaults(
  defineProps<{
    /** What the page shows. Rendered as the page's heading. */
    title?: string;
    /** Secondary line beside the title: a repo, a host, a count. */
    subtitle?: string;
    /** Small caps line above the title. */
    eyebrow?: string;
    /** Heading level of the title. `0` renders it as plain text. */
    headingLevel?: 0 | 1 | 2 | 3;
    /** Sticks the bar to the top of the scrolling page. */
    sticky?: boolean;
  }>(),
  {
    title: "",
    subtitle: "",
    eyebrow: "",
    headingLevel: 1,
    sticky: true,
  },
);

const titleTag = computed(() =>
  props.headingLevel === 0 ? "span" : `h${props.headingLevel}`,
);

const rootClasses = computed(() => ({
  "ui-app-bar": true,
  "ui-app-bar--sticky": props.sticky,
}));
</script>

<template>
  <header :class="rootClasses">
    <div class="ui-app-bar__brand">
      <slot name="brand">
        <span v-if="eyebrow" class="ui-app-bar__eyebrow">{{ eyebrow }}</span>
        <span class="ui-app-bar__heading">
          <component :is="titleTag" v-if="title" class="ui-app-bar__title">{{ title }}</component>
          <span v-if="subtitle" class="ui-app-bar__subtitle">{{ subtitle }}</span>
        </span>
      </slot>
    </div>
    <div class="ui-app-bar__gap" />
    <div v-if="$slots.status" class="ui-app-bar__status"><slot name="status" /></div>
    <div v-if="$slots.actions" class="ui-app-bar__actions"><slot name="actions" /></div>
  </header>
</template>
