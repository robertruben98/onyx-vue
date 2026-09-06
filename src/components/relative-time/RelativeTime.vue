<script lang="ts">
const MINUTE = 60_000;

/**
 * Compact age: `0m`, `5m`, `3h`, `2d`, `4mo`.
 *
 * `now` is a parameter and not `Date.now()` so the output is testable. A
 * future timestamp clamps to `0m` rather than reporting a negative age —
 * clocks on two machines disagree and that is not worth rendering.
 */
export function formatRelative(date: string | Date, now: Date): string {
  const then = date instanceof Date ? date : new Date(date);
  const mins = Math.max(0, Math.round((now.getTime() - then.getTime()) / MINUTE));
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  const days = Math.round(mins / 1440);
  if (days < 31) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
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
  }>(),
  {
    staleAfterDays: 3,
    now: () => new Date(),
  },
);

const then = computed(() =>
  props.date instanceof Date ? props.date : new Date(props.date),
);

const text = computed(() => formatRelative(then.value, props.now));

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
