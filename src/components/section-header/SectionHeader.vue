<script setup lang="ts">
import { computed } from "vue";
import "./section-header.scss";

const props = withDefaults(
  defineProps<{
    /** Section name. Rendered as a heading. */
    title: string;
    /**
     * Count shown beside the title. A number or a prepared string — the
     * console pages pass prose there ("12 · GitHub dice 40").
     */
    count?: string | number | null;
    /** Dims the title, for a section that is empty or inactive. */
    quiet?: boolean;
    /** Heading level, so a page with several sections keeps a sane outline. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
  }>(),
  {
    count: null,
    quiet: false,
    headingLevel: 2,
  },
);

const heading = computed(() => `h${props.headingLevel}`);

/** Zero is a count, not an absence — `v-if` on the value alone would hide it. */
const hasCount = computed(() => props.count !== null && props.count !== undefined);

const rootClasses = computed(() => ({
  "ui-section-header": true,
  "ui-section-header--quiet": props.quiet,
}));
</script>

<template>
  <div :class="rootClasses">
    <component :is="heading" class="ui-section-header__title">{{ title }}</component>
    <span v-if="hasCount" class="ui-section-header__count">{{ count }}</span>
    <slot name="actions" />
    <div v-if="$slots.controls" class="ui-section-header__controls">
      <slot name="controls" />
    </div>
  </div>
</template>
