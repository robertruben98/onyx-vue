<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, onMounted, onUpdated, ref, useSlots } from "vue";
import "./tag.scss";

export type TagVariant =
  | "neutral"
  | "muted"
  | "info"
  | "success"
  | "warning"
  | "danger";

/** Filled (a pastille) or outline (a hairline box around the text). */
export type TagAppearance = "filled" | "outline";

const props = withDefaults(
  defineProps<{
    /** Visual variant (semantic role). */
    variant?: TagVariant;
    /**
     * `outline` draws only a hairline in the variant's colour. For the small
     * facts that sit inside a table cell — "draft", "3 checks rojos" — where a
     * row of filled pastilles would outshout the data next to them.
     */
    appearance?: TagAppearance;
    /** Whether a remove (close) button is shown. */
    removable?: boolean;
    /** Accessible name for the remove button. */
    removeLabel?: string;
    /**
     * A tag keeps its text on one line by default ("vieja" never becomes
     * "viej / a" in a narrow cell). `wrap` lets a long label break instead.
     */
    wrap?: boolean;
    /**
     * Caps the tag width (any CSS length, e.g. `12ch`). Overflowing text ends
     * in an ellipsis; the full text stays in the DOM (so it is read by
     * assistive tech) and is shown as the native tooltip.
     */
    maxWidth?: string;
    /** Tooltip text; defaults to the label when `maxWidth` truncates it. */
    title?: string;
    /**
     * Shows the variant's status glyph before the label (success ✓, warning
     * ⚠, danger ✕, info ℹ), so the state is not told by colour alone
     * (WCAG 1.4.1). The `icon` slot replaces the glyph with your own.
     */
    showIcon?: boolean;
  }>(),
  {
    variant: "neutral",
    appearance: "filled",
    removable: false,
    removeLabel: () => useOnyxLocale().tagRemoveLabel,
    wrap: false,
    maxWidth: "",
    title: "",
    showIcon: false,
  },
);

/** Emitted when the remove button is activated. */
const emit = defineEmits<{ removed: [] }>();

const rootClasses = computed(() => ({
  "ui-tag": true,
  "ui-tag--neutral": props.variant === "neutral",
  "ui-tag--muted": props.variant === "muted",
  "ui-tag--info": props.variant === "info",
  "ui-tag--success": props.variant === "success",
  "ui-tag--warning": props.variant === "warning",
  "ui-tag--danger": props.variant === "danger",
  "ui-tag--outline": props.appearance === "outline",
  "ui-tag--wrap": props.wrap,
  "ui-tag--truncate": !!props.maxWidth,
}));

const rootStyle = computed(() => (props.maxWidth ? { maxWidth: props.maxWidth } : undefined));

/** Glifo por variante; neutral y muted no llevan, no anuncian un estado. */
const VARIANT_ICONS: Partial<Record<TagVariant, string>> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  danger: "✕",
};

const slots = useSlots();
const icon = computed(() => (props.showIcon ? VARIANT_ICONS[props.variant] ?? "" : ""));
const hasIcon = computed(() => !!slots.icon || !!icon.value);

// El tooltip por defecto es el texto del label, leido del DOM: el label es un
// slot y puede no ser una cadena.
const label = ref<HTMLElement | null>(null);
const labelText = ref("");
function readLabel(): void {
  labelText.value = label.value?.textContent?.trim() ?? "";
}
onMounted(readLabel);
onUpdated(readLabel);
const tooltip = computed(() => props.title || (props.maxWidth ? labelText.value : "") || undefined);

function remove(): void {
  emit("removed");
}
</script>

<template>
  <span :class="rootClasses" :style="rootStyle" :title="tooltip">
    <span v-if="hasIcon" class="ui-tag__icon" aria-hidden="true"><slot name="icon">{{ icon }}</slot></span>
    <span ref="label" class="ui-tag__label"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="ui-tag__remove"
      :aria-label="removeLabel"
      @click="remove"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </span>
</template>
