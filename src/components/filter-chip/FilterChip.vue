<script lang="ts">
/**
 * Semantic tone of a filter chip.
 *
 * The tone says what the chip filters FOR, not whether it is on: a red chip
 * is "things that are failing", pressed or not. Pressed-ness is a separate
 * axis and carries no colour of its own.
 */
export type FilterChipTone =
  | "neutral"
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "muted";
</script>

<script setup lang="ts">
import { computed } from "vue";
import { UiTriStateCount, type TriState } from "../tri-state-count";
import "./filter-chip.scss";

const props = withDefaults(
  defineProps<{
    /** What the chip filters for. */
    label: string;
    /** How many rows match. Only read when `state` is `known`. */
    count?: number | null;
    /** Whether the count is a fact, in flight, or never asked for. */
    state?: TriState;
    /** Semantic tone of the thing being filtered. */
    tone?: FilterChipTone;
    /** Whether the filter is currently applied. */
    pressed?: boolean;
    /** Disabled state — a disabled chip never emits `toggled`. */
    disabled?: boolean;
  }>(),
  {
    count: null,
    state: "known",
    tone: "neutral",
    pressed: false,
    disabled: false,
  },
);

/** Emitted on activation, carrying the state the chip is moving TO. */
const emit = defineEmits<{ toggled: [pressed: boolean] }>();

/**
 * A chip whose filter would leave the list empty is dimmed, never hidden or
 * disabled: "no rows match this" is an answer, and removing the chip would
 * take away the only place that answer is written.
 */
const empty = computed(
  () => props.state === "known" && (props.count ?? 0) === 0,
);

/**
 * The count only borrows the chip's tone once it is pressed. An unpressed row
 * of thirteen chips each colouring its own number turns the filter bar into a
 * traffic light; the tone belongs to the label, which is what names the state.
 */
const countTone = computed(() => {
  if (!props.pressed) return "neutral" as const;
  if (props.tone === "ok") return "ok" as const;
  if (props.tone === "warn") return "warn" as const;
  if (props.tone === "danger") return "danger" as const;
  return "neutral" as const;
});

const rootClasses = computed(() => ({
  "ui-filter-chip": true,
  "ui-filter-chip--ok": props.tone === "ok",
  "ui-filter-chip--warn": props.tone === "warn",
  "ui-filter-chip--danger": props.tone === "danger",
  "ui-filter-chip--info": props.tone === "info",
  "ui-filter-chip--muted": props.tone === "muted",
  "ui-filter-chip--pressed": props.pressed,
  "ui-filter-chip--empty": empty.value && !props.pressed,
}));

function activate(): void {
  if (props.disabled) return;
  emit("toggled", !props.pressed);
}
</script>

<template>
  <button
    type="button"
    :class="rootClasses"
    :aria-pressed="pressed"
    :disabled="disabled"
    @click="activate"
  >
    <span class="ui-filter-chip__label">{{ label }}</span>
    <UiTriStateCount
      :state="state"
      :value="count"
      :tone="countTone"
      :label="label"
    />
  </button>
</template>
