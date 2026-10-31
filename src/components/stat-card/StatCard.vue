<script lang="ts">
export type StatCardTone = "neutral" | "primary" | "success" | "warning" | "danger";
export type StatCardSize = "sm" | "md" | "lg";
export type StatCardTrend = "up" | "down" | "flat";
export type StatCardVariant = "card" | "plain";
/** The element the card renders as. `button` and `a` make the whole card one control. */
export type StatCardElement = "div" | "button" | "a";


const TREND_GLYPH: Record<StatCardTrend, string> = { up: "↑", down: "↓", flat: "→" };
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed } from "vue";
import "./stat-card.scss";

/**
 * One prominent figure: a streak, a level, the days left.
 *
 * The value dominates (large, heavy, tabular); the label sits under it, smaller
 * and muted, and a `hint` line under that. In the DOM the label comes first,
 * so a screen reader says "Streak, 12 days" — the order a person asks it in.
 *
 * `trend` adds an arrow AND words: the arrow is decorative, and the direction
 * is said in text ("Up" by default, `trendText` to change it) beside the
 * visible `trendLabel` ("+3 this week"), so it never rests on colour or shape.
 *
 * `as="button"` or `as="a"` makes the whole card one control (at least 44px,
 * outline focus ring, pressed state), like UiCard. `loading` swaps the value
 * for a skeleton and marks the card `aria-busy`.
 */
const messages = useOnyxLocale();

const props = withDefaults(
  defineProps<{
    /** The figure, already formatted ("12", "56%", "3 d"). */
    value?: string | number | null;
    /** What the figure is. */
    label: string;
    /** A secondary line under the label: the unit, the window, a comparison. */
    hint?: string;
    /** Colour of the value. `neutral` is the text colour. */
    tone?: StatCardTone;
    size?: StatCardSize;
    /** `card` has a surface, border and radius; `plain` is the bare figure (for a header row). */
    variant?: StatCardVariant;
    /** Direction of change. */
    trend?: StatCardTrend | null;
    /** Visible text of the change, e.g. "+3 this week". */
    trendLabel?: string;
    /** Spoken word for the direction. Defaults to "Up", "Down", "No change". */
    trendText?: string;
    /** Root element. */
    as?: StatCardElement;
    /** Link target when `as="a"`. */
    href?: string;
    /** Disables an `as="button"` card. */
    disabled?: boolean;
    /** The value is loading: a skeleton in its place and `aria-busy`. */
    loading?: boolean;
    /** What an empty value shows. */
    emptyValue?: string;
  }>(),
  {
    value: null,
    hint: "",
    tone: "neutral",
    size: "md",
    variant: "card",
    trend: null,
    trendLabel: "",
    trendText: "",
    as: "div",
    href: undefined,
    disabled: false,
    loading: false,
    emptyValue: "—",
  },
);

defineSlots<{ icon?: () => unknown; value?: () => unknown }>();

const interactive = computed(() => props.as === "button" || props.as === "a");
// A <button> holds phrasing content only: the parts are spans laid out as blocks.
const shown = computed(() =>
  props.value === null || props.value === undefined || props.value === "" ? props.emptyValue : String(props.value),
);

const rootClasses = computed(() => ({
  "ui-stat-card": true,
  [`ui-stat-card--${props.size}`]: true,
  [`ui-stat-card--${props.variant}`]: true,
  [`ui-stat-card--${props.tone}`]: true,
  "ui-stat-card--interactive": interactive.value,
}));

const rootAttrs = computed(() => {
  const busy = props.loading ? { "aria-busy": "true" } : {};
  if (props.as === "button") return { ...busy, type: "button", disabled: props.disabled || undefined };
  if (props.as === "a") return { ...busy, href: props.href };
  return busy;
});

const trendWord = computed(() => (props.trend ? props.trendText || messages.statCardTrends[props.trend] : ""));
</script>

<template>
  <component :is="as" :class="rootClasses" v-bind="rootAttrs">
    <span v-if="$slots.icon" class="ui-stat-card__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="ui-stat-card__text">
      <span class="ui-stat-card__label">{{ label }}</span>
      <span class="ui-stat-card__value">
        <span v-if="loading" class="ui-stat-card__skeleton" aria-hidden="true"></span>
        <slot v-else name="value">{{ shown }}</slot>
      </span>
      <span v-if="hint" class="ui-stat-card__hint">{{ hint }}</span>
      <span v-if="trend" :class="['ui-stat-card__trend', `ui-stat-card__trend--${trend}`]">
        <span class="ui-stat-card__trend-glyph" aria-hidden="true">{{ TREND_GLYPH[trend] }}</span>
        <span :class="trendLabel ? 'ui-stat-card__sr' : undefined">{{ trendLabel ? `${trendWord}, ` : trendWord }}</span>
        <span v-if="trendLabel">{{ trendLabel }}</span>
      </span>
    </span>
  </component>
</template>
