<script lang="ts">
/**
 * The seven outcomes a run step can have.
 *
 * The values are Spanish because they are the wire format: they arrive verbatim
 * from the NDJSON a runner emits, one event per line. Renaming them here would
 * mean translating at every boundary for nothing.
 *
 * Four of the seven are easy. The other three carry the distinctions that make
 * the scale worth having, and flattening any of them turns the view into a
 * green/red traffic light that cannot answer the question people actually ask:
 *
 * - `defecto` is NOT `fallo`. A `defecto` is a known, documented shortcoming
 *   this deployment still carries; a `fallo` is something that broke now. Both
 *   are red, but only one of them is news.
 * - `omitido` does NOT mean "passed". It means the step could not conclude —
 *   a scenario was missing, so nobody knows. Drawing it as a dimmed `ok` is a
 *   lie, and it is the most loaded call in the whole scale.
 * - `arreglado` is NOT `ok`. It means "this was broken and no longer is", which
 *   is what a deploy is really asking: not how many defects there are, but
 *   whether any of them moved.
 */
export type RunState =
  | "ok"
  | "arreglado"
  | "aviso"
  | "defecto"
  | "fallo"
  | "omitido"
  | "info";

/**
 * Sort key: worst first.
 *
 * `omitido` sorts ahead of `arreglado` and `ok` on purpose. It is not good
 * news — it is an unanswered question, and an unanswered question outranks a
 * settled one. Anything unrecognised goes to the back rather than the front:
 * a state this library has not heard of is not an emergency.
 */
const RANK: Record<string, number> = {
  fallo: 0,
  defecto: 1,
  aviso: 2,
  omitido: 3,
  arreglado: 4,
  ok: 5,
  info: 6,
};

export function runStateRank(state: RunState | string): number {
  const rank = RANK[String(state).toLowerCase()];
  return rank === undefined ? 9 : rank;
}

/**
 * The tri-state mark used by the plain-text export: `[X]`, `[!]`, `[ ]`.
 *
 * Three and not two because with two you have to lie about one of them. A
 * step that never concluded is not a pass and it is not a failure, and the
 * exporter has to say so.
 */
const MARK: Record<string, string> = {
  ok: "[X]",
  arreglado: "[X]",
  defecto: "[!]",
  fallo: "[!]",
  aviso: "[!]",
  omitido: "[ ]",
  info: "[ ]",
};

export function runStateMark(state: RunState | string): string {
  return MARK[String(state).toLowerCase()] ?? "[ ]";
}

/** Whether a state is one a reader has to do something about. */
export function runStateNeedsAttention(state: RunState | string): boolean {
  return runStateMark(state) === "[!]";
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./run-state.scss";

const props = withDefaults(
  defineProps<{
    /** Outcome of the step. */
    state?: RunState;
    /**
     * Renders the tri-state mark before the label, the same `[X] [!] [ ]` the
     * text export uses. Useful in a list that is also copied out as plain text.
     */
    showMark?: boolean;
  }>(),
  {
    state: "info",
    showMark: false,
  },
);

const rootClasses = computed(() => [
  "ui-run-state",
  `ui-run-state--${props.state}`,
]);
</script>

<template>
  <span :class="rootClasses">
    <span v-if="showMark" class="ui-run-state__mark" aria-hidden="true">{{
      runStateMark(state)
    }}</span>
    <slot>{{ state }}</slot>
  </span>
</template>
