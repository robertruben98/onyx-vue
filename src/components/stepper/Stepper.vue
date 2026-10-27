<script lang="ts">
/** Where a step stands. */
export type StepState = "done" | "active" | "warn" | "error" | "pending" | "skipped";

/** One step of a flow. */
export interface Step {
  /** What the step does. */
  label: string;
  /** Where it stands. Unknown states render as `pending`. */
  state: StepState;
  /** Inline after the label: its duration, a count. */
  meta?: string;
  /** A line under the label: what happened, why it stopped. */
  note?: string;
}

/**
 * The glyph of each state. A glyph as well as a colour, so the state survives
 * a colour-blind reader and a monochrome screenshot.
 */
export const STEP_GLYPHS: Record<StepState, string> = {
  done: "✓",
  active: "·",
  warn: "!",
  error: "✕",
  pending: "",
  skipped: "–",
};
</script>

<script setup lang="ts">
import "./stepper.scss";

/**
 * The steps of a flow and where each one stands: checkout, tests, review,
 * push. Vertical, one row per step, because the notes are what people read
 * and they need the width.
 *
 * An ordered list — the order is the content. The step in progress carries
 * `aria-current="step"`, and every state is also spoken, not only drawn.
 */
withDefaults(
  defineProps<{
    /** The steps, in order. */
    steps: Step[];
    /** Accessible name of the list. */
    label?: string;
    /** Spoken names of the states, for other languages. */
    stateLabels?: Partial<Record<StepState, string>>;
  }>(),
  { label: "Steps", stateLabels: () => ({}) },
);

const DEFAULT_STATE_LABELS: Record<StepState, string> = {
  done: "done",
  active: "in progress",
  warn: "warning",
  error: "failed",
  pending: "pending",
  skipped: "skipped",
};

function stateOf(step: Step): StepState {
  return step.state in STEP_GLYPHS ? step.state : "pending";
}
</script>

<template>
  <ol class="ui-stepper" :aria-label="label">
    <li
      v-for="(step, i) in steps"
      :key="`${i}-${step.label}`"
      :class="['ui-stepper__step', `ui-stepper__step--${stateOf(step)}`]"
      :aria-current="stateOf(step) === 'active' ? 'step' : undefined"
    >
      <span class="ui-stepper__icon" aria-hidden="true">{{ STEP_GLYPHS[stateOf(step)] }}</span>
      <span class="ui-stepper__text">
        <span class="ui-stepper__label">{{ step.label }}</span>
        <span v-if="step.meta" class="ui-stepper__meta"> · {{ step.meta }}</span>
        <span class="ui-stepper__state">
          ({{ stateLabels[stateOf(step)] ?? DEFAULT_STATE_LABELS[stateOf(step)] }})</span
        >
        <span v-if="step.note" class="ui-stepper__note">{{ step.note }}</span>
      </span>
    </li>
  </ol>
</template>
