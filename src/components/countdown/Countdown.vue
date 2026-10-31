<script lang="ts">
import { DEFAULT_MESSAGES } from "../../locale";
export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";
export type CountdownFormat = "long" | "short";
export type CountdownSize = "sm" | "md" | "lg";

/** The words of one unit: the visible abbreviation and the spoken singular and plural. */
export interface CountdownUnitLabel {
  short: string;
  one: string;
  other: string;
}
export type CountdownUnitLabels = Record<CountdownUnit, CountdownUnitLabel>;

export const DEFAULT_COUNTDOWN_LABELS: CountdownUnitLabels = DEFAULT_MESSAGES.countdownUnitLabels;

const ORDER: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
const UNIT_MS: Record<CountdownUnit, number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1_000,
};

export interface CountdownPart {
  unit: CountdownUnit;
  amount: number;
}

/**
 * Splits what is left into the given units, largest first.
 *
 * The smallest unit is rounded UP: with minutes, 13 h 17 min 30 s reads
 * "13 h 18 min", and the display reaches zero exactly when the time does, never
 * a minute early. A unit that is not listed folds into the next larger one
 * (without days, 50 hours stay 50 hours).
 *
 * `auto` is days, hours and minutes with the leading zero units dropped:
 * "2 d 0 h 5 min", "13 h 18 min", "4 min".
 */
export function splitCountdown(ms: number, units: CountdownUnit[] | "auto" = "auto"): CountdownPart[] {
  const list = units === "auto" ? (["days", "hours", "minutes"] as CountdownUnit[]) : units;
  const sorted = ORDER.filter((u) => list.includes(u));
  if (!sorted.length) sorted.push("minutes");
  const smallest = sorted[sorted.length - 1];
  let rest = Math.max(0, Math.ceil(ms / UNIT_MS[smallest])) * UNIT_MS[smallest];
  const parts = sorted.map((unit) => {
    const amount = Math.floor(rest / UNIT_MS[unit]);
    rest -= amount * UNIT_MS[unit];
    return { unit, amount };
  });
  if (units !== "auto") return parts;
  const first = parts.findIndex((p) => p.amount > 0);
  return first < 0 ? parts.slice(-1) : parts.slice(first);
}

/** The visible text: "13 h 18 min" (long) or "13:18" (short; days stay apart, "2 d 13:18"). */
export function formatCountdown(
  parts: CountdownPart[],
  format: CountdownFormat = "long",
  labels: CountdownUnitLabels = DEFAULT_COUNTDOWN_LABELS,
): string {
  if (format === "long" || parts.length < 2) {
    return parts.map((p) => `${p.amount} ${labels[p.unit].short}`).join(" ");
  }
  const days = parts.find((p) => p.unit === "days");
  const clock = parts.filter((p) => p.unit !== "days");
  const hms = clock.map((p, i) => (i === 0 ? String(p.amount) : String(p.amount).padStart(2, "0"))).join(":");
  return days ? `${days.amount} ${labels.days.short} ${hms}` : hms;
}

/** The spoken sentence: "13 hours and 18 minutes". */
export function speakCountdown(parts: CountdownPart[], labels: CountdownUnitLabels = DEFAULT_COUNTDOWN_LABELS, conjunction = DEFAULT_MESSAGES.countdownConjunction): string {
  const words = parts.map((p) => `${p.amount} ${p.amount === 1 ? labels[p.unit].one : labels[p.unit].other}`);
  return words.length > 1 ? `${words.slice(0, -1).join(", ")} ${conjunction} ${words[words.length - 1]}` : words.join("");
}

/** ISO 8601 duration of the parts, for `<time datetime>`: "P2DT13H18M". */
export function isoDuration(parts: CountdownPart[]): string {
  const get = (u: CountdownUnit) => parts.find((p) => p.unit === u)?.amount ?? 0;
  const d = get("days");
  const time = `${get("hours") ? `${get("hours")}H` : ""}${get("minutes") ? `${get("minutes")}M` : ""}${get("seconds") ? `${get("seconds")}S` : ""}`;
  return `P${d ? `${d}D` : ""}T${time || "0S"}`;
}

type Moment = Date | string | number;
const toMs = (m: Moment): number => (m instanceof Date ? m.getTime() : typeof m === "number" ? m : new Date(m).getTime());
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";
import "./countdown.scss";

/**
 * A live countdown to a moment: "13 h 18 min to the written exam".
 *
 * The visible text updates every `tick`, but it is NOT a chatty live region: a
 * `role="timer"` is `aria-live="off"`, and a screen reader reads the full
 * sentence ("13 hours and 18 minutes to the written exam") when it reaches it.
 * `announce` makes it `polite`, and then the sentence only changes at coarse
 * steps (a day, an hour, ten minutes, then each minute), not on every tick.
 *
 * At zero it emits `ended` once and stops its timer; the `#ended` slot replaces
 * the figure. The timer also stops when the component unmounts.
 */
const messages = useOnyxLocale();

const props = withDefaults(
  defineProps<{
    /** The moment counted down to: a Date, an ISO string or epoch ms. */
    to: Moment;
    /** Units shown, largest first. `auto`: days, hours and minutes, leading zeros dropped. */
    units?: CountdownUnit[] | "auto";
    /** `long` "13 h 18 min", `short` "13:18". */
    format?: CountdownFormat;
    size?: CountdownSize;
    /** Text after the figure, also the end of the spoken sentence: "to the written exam". */
    label?: string;
    /** Update interval in ms. Defaults to 1 s when seconds are shown, 30 s otherwise. */
    tick?: number;
    /** Clock, for tests: a fixed moment, or a function read on every tick. */
    now?: Moment | (() => Moment);
    /** `aria-live="polite"`, announcing at coarse steps only. */
    announce?: boolean;
    /** Unit words, for a page in another language. Merged over the English ones. */
    unitLabels?: Partial<CountdownUnitLabels>;
  }>(),
  {
    units: "auto",
    format: "long",
    size: "md",
    label: "",
    tick: undefined,
    now: undefined,
    announce: false,
    unitLabels: undefined,
  },
);

const emit = defineEmits<{ ended: [] }>();
const slots = useSlots();

function readNow(): number {
  const n = props.now;
  if (n === undefined) return Date.now();
  return toMs(typeof n === "function" ? n() : n);
}

const current = ref(readNow());
const target = computed(() => toMs(props.to));
const valid = computed(() => Number.isFinite(target.value));
const remaining = computed(() => Math.max(0, target.value - current.value));
const ended = computed(() => valid.value && remaining.value <= 0);

const labels = computed<CountdownUnitLabels>(() => ({ ...messages.countdownUnitLabels, ...(props.unitLabels ?? {}) }));
const parts = computed(() => splitCountdown(remaining.value, props.units));
const showsSeconds = computed(() => parts.value.some((p) => p.unit === "seconds"));
const interval = computed(() => props.tick ?? (showsSeconds.value ? 1_000 : 30_000));

const text = computed(() => (valid.value ? formatCountdown(parts.value, props.format, labels.value) : "—"));
const sentence = computed(() => {
  if (!valid.value) return "—";
  const s = speakCountdown(parts.value, labels.value, messages.countdownConjunction);
  return props.label ? `${s} ${props.label}` : s;
});

// The coarse step the spoken sentence follows when `announce` is on.
const step = computed(() => {
  const ms = remaining.value;
  if (ms > UNIT_MS.days) return `d${Math.ceil(ms / UNIT_MS.days)}`;
  if (ms > UNIT_MS.hours) return `h${Math.ceil(ms / UNIT_MS.hours)}`;
  if (ms > 10 * UNIT_MS.minutes) return `m10-${Math.ceil(ms / (10 * UNIT_MS.minutes))}`;
  return `m${Math.ceil(ms / UNIT_MS.minutes)}`;
});
const announced = ref(sentence.value);
watch([step, () => props.label, () => props.announce], () => { announced.value = sentence.value; });
const spoken = computed(() => (props.announce ? announced.value : sentence.value));

let timer: ReturnType<typeof setInterval> | undefined;
let firedEnd = false;

function stop(): void {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}

function start(): void {
  stop();
  if (!valid.value || ended.value) return;
  timer = setInterval(() => { current.value = readNow(); }, interval.value);
}

watch(ended, (now) => {
  if (now && !firedEnd) {
    firedEnd = true;
    stop();
    emit("ended");
  }
});

// A new target (or a new pace) restarts the clock, and may end again.
watch([target, interval], () => {
  current.value = readNow();
  if (!ended.value) firedEnd = false;
  start();
});

// A fixed `now` from the parent is the clock: follow it.
watch(() => props.now, () => { current.value = readNow(); });

onMounted(() => {
  if (ended.value && !firedEnd) {
    firedEnd = true;
    emit("ended");
    return;
  }
  start();
});
onBeforeUnmount(stop);

const showEnded = computed(() => ended.value && !!slots.ended);
</script>

<template>
  <span
    :class="['ui-countdown', `ui-countdown--${size}`, { 'ui-countdown--ended': ended }]"
    role="timer"
    :aria-live="announce ? 'polite' : 'off'"
    aria-atomic="true"
  >
    <span v-if="showEnded" class="ui-countdown__ended"><slot name="ended" /></span>
    <template v-else>
      <span class="ui-countdown__sr">{{ spoken }}</span>
      <time class="ui-countdown__value" :datetime="valid ? isoDuration(parts) : undefined" aria-hidden="true">
        <template v-if="format === 'long' && valid">
          <span v-for="p in parts" :key="p.unit" class="ui-countdown__part"><span class="ui-countdown__num">{{ p.amount }}</span> <span class="ui-countdown__unit">{{ labels[p.unit].short }}</span>{{ " " }}</span>
        </template>
        <span v-else class="ui-countdown__num">{{ text }}</span>
      </time>
      <span v-if="label" class="ui-countdown__label" aria-hidden="true">{{ label }}</span>
    </template>
  </span>
</template>
