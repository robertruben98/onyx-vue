<script setup lang="ts">
import { computed } from "vue";
import "./icon-button.scss";

export type IconButtonSize = "sm" | "md";

/**
 * A button that is only a glyph: row actions, the "i" of an info panel, the
 * close cross of a strip.
 *
 * `label` is required because the glyph is not a name. It becomes the
 * accessible name and the tooltip, so the mouse and the screen reader get the
 * same word. The glyph is either an SVG path (`icon`, drawn as a 24×24 stroke
 * icon) or the default slot for anything else — a letter, an emoji, an inline
 * SVG of your own.
 */
const props = withDefaults(
  defineProps<{
    /** Accessible name and tooltip. */
    label: string;
    /** `d` of a 24×24 stroke icon. */
    icon?: string;
    /** Control size. */
    size?: IconButtonSize;
    /** Disabled state — never emits `clicked`. */
    disabled?: boolean;
    /** Toggle state, exposed as `aria-pressed`. Omit for a plain button. */
    pressed?: boolean | null;
  }>(),
  { icon: "", size: "md", disabled: false, pressed: null },
);

const emit = defineEmits<{ clicked: [event: MouseEvent] }>();

const rootClasses = computed(() => ({
  "ui-icon-button": true,
  "ui-icon-button--sm": props.size === "sm",
  "ui-icon-button--pressed": props.pressed === true,
}));

function onClick(event: MouseEvent): void {
  if (props.disabled) return;
  emit("clicked", event);
}
</script>

<template>
  <button
    type="button"
    :class="rootClasses"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    :aria-pressed="pressed === null ? undefined : pressed"
    @click="onClick"
  >
    <svg v-if="icon" class="ui-icon-button__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path :d="icon" />
    </svg>
    <span v-else class="ui-icon-button__glyph" aria-hidden="true"><slot /></span>
  </button>
</template>
