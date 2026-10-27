<script lang="ts">
/**
 * `[1, 2, 3, 7, 9, 10]` -> `"1-3, 7, 9, 10"`. Runs of three or more collapse
 * into a range; a pair stays a pair, since "9-10" saves nothing and reads as
 * one thing.
 */
export function formatRanges(numbers: Iterable<number>): string {
  const xs = [...new Set(numbers)].sort((a, b) => a - b);
  const out: string[] = [];
  let i = 0;
  while (i < xs.length) {
    let j = i;
    while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
    if (j - i >= 2) out.push(`${xs[i]}-${xs[j]}`);
    else for (let k = i; k <= j; k++) out.push(String(xs[k]));
    i = j + 1;
  }
  return out.join(", ");
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./sequence-grid.scss";

/**
 * A numbered run of things, each one there or not: the episodes of a season on
 * disk, the chapters of a course done, the days of a streak.
 *
 * Every number is printed, not just coloured: "is 7 the one missing?" is
 * answered by reading, and the state is also in words for a screen reader and
 * in the cell's outline for a reader who cannot tell the two colours apart.
 */
const props = withDefaults(
  defineProps<{
    /** The last number of the run. */
    max: number;
    /** The numbers that are not there. Everything else from `start` to `max` is. */
    missing?: number[];
    /** The first number of the run. */
    start?: number;
    /** What the run is, for the accessible name: "Season 1 episodes". */
    label?: string;
    /** What one number is, for its tooltip: "Episode". */
    itemLabel?: string;
    /** Word for a number that is there. */
    presentLabel?: string;
    /** Word for a number that is not. */
    missingLabel?: string;
  }>(),
  {
    missing: () => [],
    start: 1,
    label: "",
    itemLabel: "Item",
    presentLabel: "present",
    missingLabel: "missing",
  },
);

const gaps = computed(() => new Set(props.missing));

const cells = computed(() => {
  const out: { n: number; missing: boolean }[] = [];
  for (let n = props.start; n <= props.max; n++) out.push({ n, missing: gaps.value.has(n) });
  return out;
});

const summary = computed(() => {
  const total = cells.value.length;
  const lacking = cells.value.filter((c) => c.missing).map((c) => c.n);
  const what = props.label ? `${props.label}: ` : "";
  const head = `${what}${total - lacking.length} of ${total} ${props.presentLabel}`;
  return lacking.length ? `${head}, ${props.missingLabel} ${formatRanges(lacking)}` : head;
});
</script>

<template>
  <ul class="ui-sequence-grid" :aria-label="summary">
    <li
      v-for="cell in cells"
      :key="cell.n"
      :class="['ui-sequence-grid__cell', cell.missing ? 'ui-sequence-grid__cell--missing' : 'ui-sequence-grid__cell--present']"
      :title="`${itemLabel} ${cell.n}: ${cell.missing ? missingLabel : presentLabel}`"
    >
      {{ cell.n }}<span class="ui-sequence-grid__state">{{
        cell.missing ? missingLabel : presentLabel
      }}</span>
    </li>
  </ul>
</template>
