<script setup lang="ts">
import { computed } from "vue";
import UiRunState from "../run-state/RunState.vue";
import { runStateRank, type RunState } from "../run-state/RunState.vue";
import "./state-bar.scss";

/**
 * A run's progress and its composition, in one bar.
 *
 * `UiProgressBar` answers "how far along"; this also answers "how is it going",
 * which is the question a run view actually gets asked. The filled part is the
 * steps that have finished, split by outcome; the gap at the right is what is
 * still pending. One glance gives both readings without reading a single log
 * line.
 *
 * Segments are ordered worst-first, so a red sliver sits at the left edge where
 * the eye starts rather than hiding between two greens. The order is derived
 * from `runStateRank`, not hand-written, so it cannot drift from the scale.
 *
 * `UiBlockMeter` does not cover this: it fills one meter in a single tone.
 *
 * The legend doubles as the filter. It lives here rather than in each consumer
 * because the counts, the segments and the selection have to agree, and three
 * copies of that arithmetic is three chances to disagree.
 */
const props = withDefaults(
  defineProps<{
    /** How many steps ended in each state. States with 0 are dropped. */
    counts: Partial<Record<RunState, number>>;
    /**
     * Steps the run will have when it finishes. Anything above the sum of
     * `counts` is drawn as the pending gap. Defaults to the sum, i.e. a run
     * that is over.
     */
    total?: number;
    /** Turns the legend into filter buttons and emits `selected`. */
    interactive?: boolean;
    /** Which state the legend shows as active. */
    selected?: RunState | null;
    /** Accessible name for the bar. */
    label?: string;
    /** Renders the counts under the bar. */
    showLegend?: boolean;
  }>(),
  {
    interactive: false,
    selected: null,
    label: "Progreso de la ejecucion",
    showLegend: true,
  },
);

const emit = defineEmits<{
  /** A legend entry was activated. Emits null when the active one is cleared. */
  (event: "selected", state: RunState | null): void;
}>();

/** Present states, worst first. Order comes from the scale, never hand-written. */
const segments = computed(() =>
  (Object.entries(props.counts) as [RunState, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => runStateRank(a[0]) - runStateRank(b[0])),
);

const done = computed(() =>
  segments.value.reduce((sum, [, n]) => sum + n, 0),
);

const total = computed(() => Math.max(props.total ?? done.value, done.value));

const pending = computed(() => total.value - done.value);

function width(count: number): string {
  return total.value === 0 ? "0%" : `${(count / total.value) * 100}%`;
}

/** What a screen reader gets instead of the bar: the same reading, in words. */
const summary = computed(() => {
  const parts = segments.value.map(([state, n]) => `${n} ${state}`);
  if (pending.value > 0) parts.push(`${pending.value} pendientes`);
  return `${props.label}: ${done.value} de ${total.value}. ${parts.join(", ")}.`;
});

function pick(state: RunState) {
  emit("selected", props.selected === state ? null : state);
}
</script>

<template>
  <div class="ui-state-bar">
    <!-- Segments are keyed by state so Vue patches widths in place instead of
         replacing nodes. Rebuilding the bar mid-run detaches the element a
         click is travelling to, and the click lands on nothing. -->
    <div class="ui-state-bar__track" role="img" :aria-label="summary">
      <div
        v-for="[state, count] in segments"
        :key="state"
        :class="['ui-state-bar__seg', `ui-state-bar__seg--${state}`]"
        :style="{ width: width(count) }"
      ></div>
      <div
        v-if="pending > 0"
        class="ui-state-bar__seg ui-state-bar__seg--pending"
        :style="{ width: width(pending) }"
      ></div>
    </div>

    <ul v-if="showLegend" class="ui-state-bar__legend">
      <li v-for="[state, count] in segments" :key="state">
        <component
          :is="interactive ? 'button' : 'span'"
          :type="interactive ? 'button' : undefined"
          :class="[
            'ui-state-bar__entry',
            { 'ui-state-bar__entry--active': selected === state },
          ]"
          :aria-pressed="interactive ? String(selected === state) : undefined"
          @click="interactive && pick(state)"
        >
          <UiRunState :state="state" />
          <b class="ui-state-bar__count">{{ count }}</b>
        </component>
      </li>
    </ul>
  </div>
</template>
