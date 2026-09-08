<script lang="ts">
const MINUTE = 60_000;

/**
 * The suffix for each rung of the scale.
 *
 * The only part of this component that is a word rather than a number, and so
 * the only part a page in another language has to be able to change: a Spanish
 * console reading "16m", "3h", "5d" and then "1mo" mixes languages in the one
 * cell where it is most visible.
 */
export interface RelativeUnits {
  minute: string;
  hour: string;
  day: string;
  month: string;
}

export const DEFAULT_UNITS: RelativeUnits = {
  minute: "m",
  hour: "h",
  day: "d",
  month: "mo",
};

/**
 * Compact age: `0m`, `5m`, `3h`, `2d`, `4mo`.
 *
 * `now` is a parameter and not `Date.now()` so the output is testable. A
 * future timestamp clamps to `0m` rather than reporting a negative age —
 * clocks on two machines disagree and that is not worth rendering.
 */
export function formatRelative(
  date: string | Date,
  now: Date,
  units: RelativeUnits = DEFAULT_UNITS,
): string {
  const then = date instanceof Date ? date : new Date(date);
  const mins = Math.max(0, Math.round((now.getTime() - then.getTime()) / MINUTE));
  if (mins < 60) return `${mins}${units.minute}`;
  // 1410 and not 1440: `Math.round(mins / 60)` reaches 24 for any mins in
  // [1410, 1440), which would render "24h" — a rung nobody wants, since the
  // scale must read 23h then 1d, never 23h → 24h → 1d.
  if (mins < 1410) return `${Math.round(mins / 60)}${units.hour}`;
  const days = Math.round(mins / 1440);
  if (days < 31) return `${days}${units.day}`;
  return `${Math.round(days / 30)}${units.month}`;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./relative-time.scss";

const props = withDefaults(
  defineProps<{
    /** The moment being aged. */
    date: string | Date;
    /**
     * Age past which the row reads as stale. The original in `prs.js` tested
     * the rendered string, so `3d` was stale and `1mes` was not; this compares
     * the actual age.
     */
    staleAfterDays?: number;
    /** Clock, injectable so tests are deterministic. */
    now?: Date;
    /** Suffixes for the four rungs, for a page that is not in English. */
    units?: RelativeUnits;
  }>(),
  {
    staleAfterDays: 3,
    now: () => new Date(),
    units: () => DEFAULT_UNITS,
  },
);

const then = computed(() =>
  props.date instanceof Date ? props.date : new Date(props.date),
);

const text = computed(() => formatRelative(then.value, props.now, props.units));

const iso = computed(() => then.value.toISOString());

const absolute = computed(() => then.value.toLocaleString());

const stale = computed(() => {
  const ms = props.now.getTime() - then.value.getTime();
  return ms >= props.staleAfterDays * 24 * 60 * MINUTE;
});

const rootClasses = computed(() => ({
  "ui-relative-time": true,
  "ui-relative-time--stale": stale.value,
}));
</script>

<template>
  <time :class="rootClasses" :datetime="iso" :title="absolute">{{ text }}</time>
</template>
