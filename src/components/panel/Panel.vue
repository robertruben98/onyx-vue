<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, useId } from "vue";
import { UiSectionHeader } from "../section-header";
import "./panel.scss";

/**
 * A titled block of a console page: a header band and whatever sits under it —
 * a table, a list, a form.
 *
 * The header is a `UiSectionHeader`, so the title is a real heading and a page
 * of panels keeps an outline. The body has no padding of its own by default:
 * what usually goes inside is a table that runs edge to edge, and a padded
 * body would inset its rules from the header's. `padded` adds it for prose.
 *
 * `empty` swaps the body for one line of text. A panel whose list is empty is
 * still worth keeping on screen — "nothing is waiting" is an answer — so the
 * panel does not disappear, it says so.
 *
 * A panel is a `region` landmark named by its heading (`aria-labelledby`, so
 * the name is the heading itself, not a copy). A page with many panels gets a
 * noisy landmark list; `:landmark="false"` renders a plain `<div>` instead.
 */
const props = withDefaults(
  defineProps<{
    /** Panel name. Rendered as a heading. */
    title: string;
    /** Shown beside the title: a number or prose ("3 of 12 · updated 10:04"). */
    count?: string | number | null;
    /** Heading level of the title. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Dims the title, for a panel with nothing in it. */
    quiet?: boolean;
    /** Replaces the body with `emptyText`. */
    empty?: boolean;
    /** What an empty panel says. */
    emptyText?: string;
    /** Pads the body, for prose instead of a table. */
    padded?: boolean;
    /**
     * `default`: a header band with a rule, the body unpadded (a table runs
     * edge to edge; `padded` for prose). `plain`: no rule, more space, and the
     * header and the body on the same inset. `card`: a surface with a radius,
     * header and body on the same inset.
     */
    variant?: "default" | "plain" | "card";
    /**
     * Renders a `<section>` region landmark named by the heading. `false`
     * renders a plain `<div>`: the heading still gives the page its outline.
     */
    landmark?: boolean;
  }>(),
  {
    count: null,
    headingLevel: 2,
    quiet: false,
    empty: false,
    emptyText: () => useOnyxLocale().panelEmptyText,
    padded: false,
    variant: "default",
    landmark: true,
  },
);

const headingId = `ui-panel-${useId()}-title`;

const rootClasses = computed(() => ({
  "ui-panel": true,
  "ui-panel--padded": props.padded,
  "ui-panel--plain": props.variant === "plain",
  "ui-panel--card": props.variant === "card",
}));
</script>

<template>
  <component
    :is="landmark ? 'section' : 'div'"
    :class="rootClasses"
    :aria-labelledby="landmark ? headingId : undefined"
  >
    <UiSectionHeader
      class="ui-panel__header"
      :title="title"
      :count="count"
      :quiet="quiet || empty"
      :heading-level="headingLevel"
      :heading-id="headingId"
    >
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
      <template v-if="$slots.controls" #controls><slot name="controls" /></template>
    </UiSectionHeader>
    <p v-if="empty" class="ui-panel__empty">{{ emptyText }}</p>
    <div v-else class="ui-panel__body"><slot /></div>
    <div v-if="$slots.footer" class="ui-panel__footer"><slot name="footer" /></div>
  </component>
</template>
