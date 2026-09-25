<script setup lang="ts">
import "./app-shell.scss";

/**
 * The frame of a console page: a navigation rail on the left and the content
 * beside it.
 *
 * The rail is sticky and scrolls on its own, so a long list of entries never
 * drags the page; it never scrolls sideways — a long name truncates inside its
 * entry instead of widening the rail. Below the collapse width the rail stacks
 * above the content, because a 232px column on a phone leaves nothing to read.
 *
 * The shell owns no background: under a preset with atmosphere (the matrix
 * rain) the rail lets it show through, and what separates the rail from the
 * content is the rule, not a fill.
 */
withDefaults(
  defineProps<{
    /** Accessible name of the rail landmark. */
    label?: string;
  }>(),
  { label: "Navigation" },
);
</script>

<template>
  <div class="ui-app-shell">
    <aside v-if="$slots.rail" class="ui-app-shell__rail" :aria-label="label">
      <slot name="rail" />
    </aside>
    <div class="ui-app-shell__content">
      <slot />
    </div>
  </div>
</template>
