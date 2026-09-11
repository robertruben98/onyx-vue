<script setup lang="ts">
import "./hud-frame.scss";

/**
 * A panel with corner brackets and an optional titled header.
 *
 * The brackets are two diagonal corners, not a full frame: a closed frame reads
 * as a box, two corners read as an instrument. They live in this component and
 * not in the theme because a preset re-maps tokens and does not paint inside a
 * component — drawing them onto `.ui-card` from a stylesheet would be a patch
 * shaped like a theme, and the library's own preset test rejects it.
 *
 * It is deliberately not a variant of `UiCard`: a card is a content surface
 * with padding and a shadow, and this is a chassis. Making it a card flag would
 * have meant a `shadow: none` override in every use.
 */
withDefaults(
  defineProps<{
    /** Header label. Omit it and the header is not rendered at all. */
    title?: string;
    /** Drops the brackets, keeping the border and the header. */
    plain?: boolean;
  }>(),
  { plain: false },
);
</script>

<template>
  <section :class="['ui-hud-frame', { 'ui-hud-frame--plain': plain }]">
    <header v-if="title" class="ui-hud-frame__header">
      <h2 class="ui-hud-frame__title">{{ title }}</h2>
      <span class="ui-hud-frame__rule" aria-hidden="true"></span>
      <span v-if="$slots.meta" class="ui-hud-frame__meta"><slot name="meta" /></span>
    </header>
    <div class="ui-hud-frame__body"><slot /></div>
  </section>
</template>
