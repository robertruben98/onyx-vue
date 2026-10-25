<script lang="ts">
export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarRingTone = "primary" | "success" | "warning" | "danger" | "neutral";

/** Number of `--ui-avatar-gradient-N` tokens. */
export const AVATAR_GRADIENTS = 8;

/**
 * The gradient (1…8) a name always gets: a small string hash, so the same
 * person keeps the same colours on every page and every device.
 */
export function avatarGradientIndex(name: string): number {
  const key = name.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return (h % AVATAR_GRADIENTS) + 1;
}

// Rendered sizes in px at a 16px root, for the ring's stroke ratio only.
const SIZE_PX: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 48, xl: 72 };
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import RingSvg from "../../internal/RingSvg.vue";
import "./avatar.scss";

const props = withDefaults(
  defineProps<{
    /** Image source URL. */
    src?: string;
    /** Person name — used for the image alt text and initials fallback. */
    name?: string;
    /** Alternative text of the image. Defaults to `name`. */
    alt?: string;
    /** Avatar size: `sm` 32px, `md` 40px, `lg` 48px, `xl` 72px. */
    size?: AvatarSize;
    /** Avatar shape. */
    shape?: AvatarShape;
    /** Initials on a colour gradient picked from the name (always the same one for a name). */
    gradient?: boolean;
    /** Draws a progress ring around the avatar with this value. `null` draws none. */
    ringValue?: number | null;
    /** Value of a full ring. */
    ringMax?: number;
    /** Colour of the ring. */
    ringTone?: AvatarRingTone;
    /** Paints the ring with the brand gradient (as UiProgressRing `gradient`). */
    ringGradient?: boolean;
    /**
     * Accessible name of the ring. Set, the ring is a `progressbar` beside the
     * avatar; unset, it is decorative (say the progress elsewhere).
     */
    ringLabel?: string;
  }>(),
  {
    src: "",
    name: "",
    alt: undefined,
    size: "md",
    shape: "circle",
    gradient: false,
    ringValue: null,
    ringMax: 100,
    ringTone: "primary",
    ringGradient: false,
    ringLabel: "",
  },
);

/** Whether the image failed to load. */
const imgError = ref(false);
// A new image gets its own chance to load.
watch(() => props.src, () => { imgError.value = false; });

/** Show initials when there is no image or it failed. */
const showInitials = computed(() => !props.src || imgError.value);

/** Up-to-two-letter initials derived from the name. */
const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
});

/** What the avatar is called: the image alt, or the name. */
const altText = computed(() => props.alt ?? props.name);

const gradientIndex = computed(() => avatarGradientIndex(props.name));

const rootClasses = computed(() => ({
  "ui-avatar": true,
  "ui-avatar--sm": props.size === "sm",
  "ui-avatar--lg": props.size === "lg",
  "ui-avatar--xl": props.size === "xl",
  "ui-avatar--square": props.shape === "square",
  "ui-avatar--gradient": props.gradient && showInitials.value,
  [`ui-avatar--gradient-${gradientIndex.value}`]: props.gradient && showInitials.value,
}));

const hasRing = computed(() => props.ringValue !== null && props.ringValue !== undefined);

const ringPercent = computed(() => {
  if (!props.ringMax || props.ringMax <= 0) return 0;
  return Math.max(0, Math.min(100, ((props.ringValue ?? 0) / props.ringMax) * 100));
});

// The stroke is --ui-avatar-ring-width (4px) of a ring whose diameter is the
// avatar plus twice (gap + width): 12px at the default tokens.
const ringThickness = computed(() => (400 / (SIZE_PX[props.size] + 12)));

const ringA11y = computed(() =>
  props.ringLabel
    ? {
        role: "progressbar",
        "aria-label": props.ringLabel,
        "aria-valuemin": 0,
        "aria-valuemax": props.ringMax,
        "aria-valuenow": Math.max(0, Math.min(props.ringValue ?? 0, props.ringMax)),
      }
    : { "aria-hidden": "true" as const },
);

function handleError(): void {
  imgError.value = true;
}
</script>

<template>
  <span v-if="hasRing" :class="['ui-avatar-ring', `ui-avatar-ring--${size}`]">
    <span class="ui-avatar-ring__meter" v-bind="ringA11y">
      <RingSvg :percent="ringPercent" :thickness="ringThickness" :tone="ringTone" :gradient="ringGradient" />
    </span>
    <span
      :class="rootClasses"
      :role="showInitials && altText ? 'img' : undefined"
      :aria-hidden="showInitials && !altText ? 'true' : undefined"
      :aria-label="showInitials ? altText || undefined : undefined"
    >
      <span v-if="showInitials" class="ui-avatar__initials" aria-hidden="true">{{ initials }}</span>
      <img v-else class="ui-avatar__img" :src="src" :alt="altText" @error="handleError" />
    </span>
  </span>
  <span
    v-else
    :class="rootClasses"
    :role="showInitials && altText ? 'img' : undefined"
      :aria-hidden="showInitials && !altText ? 'true' : undefined"
    :aria-label="showInitials ? altText || undefined : undefined"
  >
    <span v-if="showInitials" class="ui-avatar__initials" aria-hidden="true">{{
      initials
    }}</span>
    <img
      v-else
      class="ui-avatar__img"
      :src="src"
      :alt="altText"
      @error="handleError"
    />
  </span>
</template>
