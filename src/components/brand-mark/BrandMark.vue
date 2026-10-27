<script setup lang="ts">
import "./brand-mark.scss";

/**
 * The head of a rail: a two-or-three letter tile and the tool's name.
 *
 * Every page of a console carries one, and each used to draw its own tile with
 * its own size and border. The tile is decorative — the name next to it says
 * the same thing — so it is hidden from assistive tech.
 *
 * With `href` the whole mark is a link (usually back to the tool's home); a
 * plain mark is not focusable, because a tab stop that goes nowhere is noise.
 */
withDefaults(
  defineProps<{
    /** Two or three letters for the tile. */
    mark: string;
    /** The tool's name. */
    name: string;
    /** Secondary line under the name: a host, a port, a section. */
    sub?: string;
    /** Makes the whole mark a link. */
    href?: string;
  }>(),
  { sub: "", href: "" },
);
</script>

<template>
  <component :is="href ? 'a' : 'div'" class="ui-brand-mark" :href="href || undefined">
    <span class="ui-brand-mark__tile" aria-hidden="true">{{ mark }}</span>
    <span class="ui-brand-mark__text">
      <span class="ui-brand-mark__name">{{ name }}</span>
      <span v-if="sub" class="ui-brand-mark__sub">{{ sub }}</span>
    </span>
  </component>
</template>
