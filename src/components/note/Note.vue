<script setup lang="ts">
import { computed } from "vue";
import "./note.scss";

export type NoteTone = "muted" | "success" | "warning" | "danger";
export type NoteSize = "sm" | "md" | "lg";
export type NoteVariant = "inline" | "block" | "empty";

const props = withDefaults(
  defineProps<{
    /** Semantic colour: muted (default), success, warning or danger. */
    tone?: NoteTone;
    /** Text size: sm 11px, md 12px (default), lg 12.5px. */
    size?: NoteSize;
    /**
     * `inline` flows with the text around it, `block` is a paragraph with no
     * margin, `empty` is the padded "nothing here" line.
     */
    variant?: NoteVariant;
    /** Monospace text that breaks anywhere (ids, paths, hashes). */
    mono?: boolean;
    /** Element to render. */
    as?: string;
    /**
     * With `variant="empty"`, exposes `role="status"` so an empty state that
     * appears after loading is announced. Ignored for other variants.
     */
    live?: boolean;
  }>(),
  {
    tone: "muted",
    size: "md",
    variant: "inline",
    mono: false,
    as: "p",
    live: false,
  },
);

const rootClasses = computed(() => ({
  "ui-note": true,
  [`ui-note--${props.tone}`]: true,
  [`ui-note--${props.size}`]: true,
  [`ui-note--${props.variant}`]: true,
  "ui-note--mono": props.mono,
}));

const role = computed(() => (props.variant === "empty" && props.live ? "status" : undefined));
</script>

<template>
  <component :is="as" :class="rootClasses" :role="role"><slot /></component>
</template>
