<script setup lang="ts">
import { computed, ref } from "vue";
import "./avatar.scss";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

const props = withDefaults(
  defineProps<{
    /** Image source URL. */
    src?: string;
    /** Person name — used for the image alt text and initials fallback. */
    name?: string;
    /** Avatar size. */
    size?: AvatarSize;
    /** Avatar shape. */
    shape?: AvatarShape;
  }>(),
  {
    src: "",
    name: "",
    size: "md",
    shape: "circle",
  },
);

/** Whether the image failed to load. */
const imgError = ref(false);

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

const rootClasses = computed(() => ({
  "ui-avatar": true,
  "ui-avatar--sm": props.size === "sm",
  "ui-avatar--lg": props.size === "lg",
  "ui-avatar--square": props.shape === "square",
}));

function handleError(): void {
  imgError.value = true;
}
</script>

<template>
  <span
    :class="rootClasses"
    :role="showInitials ? 'img' : undefined"
    :aria-label="showInitials ? name || undefined : undefined"
  >
    <span v-if="showInitials" class="ui-avatar__initials" aria-hidden="true">{{
      initials
    }}</span>
    <img
      v-else
      class="ui-avatar__img"
      :src="src"
      :alt="name"
      @error="handleError"
    />
  </span>
</template>
