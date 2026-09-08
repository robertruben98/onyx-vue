<script lang="ts">
/**
 * Where one requirement (or one step of a job) stands.
 *
 * One vocabulary for both, on purpose: a checklist item and a job step are the
 * same row with different reasons for existing, and giving them separate state
 * names ("ok"/"err" here, "done"/"failed" there) is how two lists that look
 * identical drift into meaning different things.
 */
export type CheckState = "pending" | "running" | "done" | "failed";
</script>

<script setup lang="ts">
import { computed } from "vue";
import { UiSpinner } from "../spinner";
import { UiStatusDot, type StatusDotState } from "../status-dot";
import "./check-row.scss";

const props = withDefaults(
  defineProps<{
    /** Where this row stands. */
    state?: CheckState;
    /** What is being checked. */
    name: string;
    /** The evidence, or what is missing. */
    detail?: string;
    /**
     * Drops the rule and tightens the row, for a live sequence of steps rather
     * than a checklist of requirements.
     */
    dense?: boolean;
  }>(),
  {
    state: "pending",
    detail: "",
    dense: false,
  },
);

const DOT: Record<CheckState, StatusDotState> = {
  pending: "off",
  running: "unknown",
  done: "live",
  failed: "dead",
};

const dotState = computed<StatusDotState>(() => DOT[props.state]);

/**
 * `running` is the one state a dot cannot report: a static circle says "this
 * is how it is", and the whole content of `running` is that it is not settled
 * yet.
 */
const spinning = computed(() => props.state === "running");

const rootClasses = computed(() => ({
  "ui-check-row": true,
  "ui-check-row--done": props.state === "done",
  "ui-check-row--failed": props.state === "failed",
  "ui-check-row--running": spinning.value,
  "ui-check-row--dense": props.dense,
}));
</script>

<template>
  <div :class="rootClasses">
    <span class="ui-check-row__state">
      <UiSpinner v-if="spinning" size="sm" :label="`${name}: running`" />
      <UiStatusDot v-else :state="dotState" :label="`${name}: ${state}`" />
    </span>
    <span class="ui-check-row__name">{{ name }}</span>
    <span class="ui-check-row__detail" :title="detail">{{ detail }}</span>
    <span class="ui-check-row__actions"><slot name="actions" /></span>
  </div>
</template>
