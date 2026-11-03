<script setup lang="ts">
import { computed } from "vue";
import { useOnyxLocale } from "../../locale";
import "./day-timeline.scss";

export type DayTimelineBand = "free" | "likely" | "busy" | "past" | "nodata";

export interface DayTimelineSegment {
  /** Start, in minutes of the day. */
  start: number;
  /** End, in minutes of the day. */
  end: number;
  band: DayTimelineBand;
  /** Text read by assistive technology, e.g. "15:00–15:30 libre 76 %". */
  label?: string;
}

const props = withDefaults(
  defineProps<{
    /** First minute shown, e.g. 360 for 06:00. */
    start: number;
    /** Last minute shown, e.g. 1440 for 24:00. */
    end: number;
    segments: DayTimelineSegment[];
    /** Current minute of the day. Null, unset or outside the range shows no marker. */
    now?: number | null;
    /** Minutes that get an hour label. Defaults to every 3 hours from `start`. */
    ticks?: number[];
    /** Show the legend of the bands present. */
    legend?: boolean;
  }>(),
  { now: null, ticks: undefined, legend: true },
);

const messages = useOnyxLocale();

const span = computed(() => Math.max(props.end - props.start, 1));
const pct = (minute: number) => ((minute - props.start) / span.value) * 100;
const fmt = (n: number) => `${Math.round(n * 1e4) / 1e4}%`;
const clock = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const spans = computed(() =>
  props.segments.map((s) => ({
    ...s,
    left: fmt(pct(s.start)),
    width: fmt(((s.end - s.start) / span.value) * 100),
    text: s.label ?? `${clock(s.start)}–${clock(s.end)} ${messages.dayTimelineBands[s.band]}`,
  })),
);

const tickList = computed(() => {
  const minutes =
    props.ticks ??
    Array.from({ length: Math.floor(span.value / 180) + 1 }, (_, i) => props.start + i * 180);
  return minutes
    .filter((m) => m >= props.start && m <= props.end)
    .map((m) => ({ minute: m, left: fmt(pct(m)), text: String(Math.floor(m / 60)).padStart(2, "0") }));
});

const nowLeft = computed(() =>
  props.now != null && props.now >= props.start && props.now <= props.end ? fmt(pct(props.now)) : null,
);

const bandsPresent = computed(() => {
  const order: DayTimelineBand[] = ["free", "likely", "busy", "past", "nodata"];
  return order.filter((b) => props.segments.some((s) => s.band === b));
});

const summary = computed(
  () => `${messages.dayTimelineLabel} ${clock(props.start)}–${clock(props.end)}`,
);
</script>

<template>
  <div class="ui-day-timeline">
    <div class="ui-day-timeline__track" role="img" :aria-label="summary">
      <span
        v-for="(s, i) in spans"
        :key="i"
        :class="['ui-day-timeline__segment', `ui-day-timeline__segment--${s.band}`]"
        :style="{ left: s.left, width: s.width }"
      />
      <span v-if="nowLeft" class="ui-day-timeline__now" :style="{ left: nowLeft }">
        <span class="ui-day-timeline__now-label">{{ messages.dayTimelineNow }}</span>
      </span>
    </div>
    <div class="ui-day-timeline__ticks" aria-hidden="true">
      <span v-for="t in tickList" :key="t.minute" class="ui-day-timeline__tick" :style="{ left: t.left }">{{
        t.text
      }}</span>
    </div>
    <ul class="ui-day-timeline__list">
      <li v-for="(s, i) in spans" :key="i" class="ui-day-timeline__item">{{ s.text }}</li>
    </ul>
    <ul v-if="legend && bandsPresent.length" class="ui-day-timeline__legend">
      <li v-for="b in bandsPresent" :key="b" class="ui-day-timeline__legend-item">
        <span :class="['ui-day-timeline__swatch', `ui-day-timeline__segment--${b}`]" aria-hidden="true" />
        {{ messages.dayTimelineBands[b] }}
      </li>
    </ul>
  </div>
</template>
