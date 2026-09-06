<script lang="ts">
/**
 * The three things a counter can be.
 *
 * `known` is a fact — including zero. `pending` means the data is in flight.
 * `unrequested` means nobody asked for it. Collapsing the last two into a
 * zero is the bug this type exists to prevent: "no open alerts" and "we never
 * looked for alerts" render identically and mean opposite things.
 */
export type TriState = "known" | "pending" | "unrequested";

/** Semantic tone for a known value — ignored when state is pending or unrequested. */
export type TriStateTone = "neutral" | "ok" | "warn" | "danger";

/** Derive the state from the shape a data layer usually reports. */
export function resolveTriState(input: {
  value?: number | null;
  loading?: boolean;
  requested?: boolean;
}): TriState {
  if (input.requested === false) return "unrequested";
  if (input.loading) return "pending";
  return input.value === null || input.value === undefined ? "pending" : "known";
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./tri-state-count.scss";

const props = withDefaults(
  defineProps<{
    /** Which of the three things this counter is. */
    state?: TriState;
    /** The count. Only read when `state` is `known`. */
    value?: number | null;
    /** Semantic tone, applied only to a known value. */
    tone?: TriStateTone;
    /** What is being counted, for the accessible name — e.g. "open alerts". */
    label?: string;
    /** Stand-in shown while the data is in flight. */
    pendingGlyph?: string;
    /** Stand-in shown when nobody asked for the data. */
    unrequestedGlyph?: string;
  }>(),
  {
    state: "known",
    value: null,
    tone: "neutral",
    label: "",
    pendingGlyph: "·",
    unrequestedGlyph: "—",
  },
);

const text = computed(() => {
  if (props.state === "pending") return props.pendingGlyph;
  if (props.state === "unrequested") return props.unrequestedGlyph;
  return String(props.value ?? 0);
});

/**
 * The name states the meaning, never the glyph. A screen reader announcing
 * "em dash" tells the user nothing; "not requested" tells them everything.
 */
const ariaLabel = computed(() => {
  if (props.state === "pending") return "loading";
  if (props.state === "unrequested") return "not requested";
  const n = String(props.value ?? 0);
  return props.label ? `${n} ${props.label}` : n;
});

/**
 * Tone is a claim about the number, so a state with no number gets no tone:
 * a red "·" would report a problem that has not been measured yet.
 */
const known = computed(() => props.state === "known");

const rootClasses = computed(() => ({
  "ui-tri-state-count": true,
  "ui-tri-state-count--ok": known.value && props.tone === "ok",
  "ui-tri-state-count--warn": known.value && props.tone === "warn",
  "ui-tri-state-count--danger": known.value && props.tone === "danger",
  "ui-tri-state-count--quiet": !known.value,
}));
</script>

<template>
  <span :class="rootClasses" :aria-label="ariaLabel" role="img">
    <span aria-hidden="true">{{ text }}</span>
  </span>
</template>
