<script lang="ts">
import type { TagVariant } from "../tag/Tag.vue";
import type { RelativeUnits } from "../relative-time/RelativeTime.vue";

/** One thing that happened, at one moment. */
export interface TimelineEvent {
  /** Stable key. Falls back to the position when absent. */
  id?: string | number;
  /** When it happened. A string is parsed with `new Date()`. */
  date: string | number | Date;
  /** The one line that says what happened. */
  title: string;
  /** Plain-text body. Ignored when the `#event` slot is given. */
  body?: string;
  /** A short state shown beside the title ("por decidir", "descartada"). */
  tag?: string;
  /** Tone of the tag. */
  tagTone?: TagVariant;
}

/** Tone of a status item's marker. */
export type TimelineTone = "success" | "warning" | "danger" | "info" | "muted";

/** `list` is the vertical history; `compact` is one inline marker per item. */
export type TimelineVariant = "list" | "compact";

/** One entry of the status history (`items`): what happened, with a state. */
export interface TimelineItem {
  id: string | number;
  title: string;
  /** Secondary line under the title. */
  meta?: string;
  /** When it happened, shown beside the title (any text). */
  time?: string;
  /** Colour and icon of the marker. Default `muted`. */
  tone?: TimelineTone;
  /** The event in progress: pulsing marker and `aria-current="step"`. */
  active?: boolean;
}

/** How each event's date is written. */
export type TimelineDateFormat = "absolute" | "relative";

/** A date as a `Date`, or `null` when it cannot be read. */
export function toDate(value: TimelineEvent["date"]): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Newest first, without touching the caller's array.
 *
 * The sort is stable, so two events of the same moment keep the order they
 * came in; an event whose date cannot be read goes to the end instead of
 * landing wherever `NaN` compares.
 */
export function sortNewestFirst<T extends TimelineEvent>(events: readonly T[]): T[] {
  return events
    .map((event, index) => ({ event, index, time: toDate(event.date)?.getTime() ?? null }))
    .sort((a, b) => {
      if (a.time === null || b.time === null) {
        if (a.time === b.time) return a.index - b.index;
        return a.time === null ? 1 : -1;
      }
      return b.time - a.time || a.index - b.index;
    })
    .map((x) => x.event);
}
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed } from "vue";
import { UiTag } from "../tag";
import { UiRelativeTime } from "../relative-time";
import "./timeline.scss";

const props = withDefaults(
  defineProps<{
    /** The events, in any order: the timeline sorts them newest first. */
    events?: TimelineEvent[];
    /**
     * Status history instead of dated events: items keep the order given, each
     * with a tone marker (colour plus icon). When set, `events` is ignored.
     */
    items?: TimelineItem[];
    /** With `items`: `compact` renders one inline marker per item (tooltip + accessible name). */
    variant?: TimelineVariant;
    /** `absolute` writes the date; `relative` writes its age (`3d`) with the date as tooltip. */
    dateFormat?: TimelineDateFormat;
    /** Locale for absolute dates. Defaults to the browser's. */
    locale?: string;
    /** Options for absolute dates, passed to `Intl.DateTimeFormat`. */
    dateOptions?: Intl.DateTimeFormatOptions;
    /** Writes an absolute date yourself ("31-10"). Wins over `locale` / `dateOptions`. */
    formatDate?: (date: Date) => string;
    /** Clock for relative dates, injectable so tests are deterministic. */
    now?: Date;
    /** Suffixes for relative dates, for a page that is not in English. */
    units?: RelativeUnits;
    /** Accessible name of the list. */
    label?: string;
    /** Shown when there are no events. */
    emptyText?: string;
  }>(),
  {
    events: () => [],
    items: undefined,
    variant: "list",
    dateFormat: "absolute",
    locale: undefined,
    dateOptions: () => ({ dateStyle: "medium" }),
    formatDate: undefined,
    now: undefined,
    units: undefined,
    label: () => useOnyxLocale().timelineLabel,
    emptyText: () => useOnyxLocale().timelineEmptyText,
  },
);

defineSlots<{
  /** The body of one event. Replaces `body`. */
  event?: (props: { event: TimelineEvent; index: number }) => unknown;
  /** With `items`: replaces the title / time / meta of one item. */
  item?: (props: { item: TimelineItem }) => unknown;
  /** Replaces the empty text. */
  empty?: () => unknown;
}>();

const sorted = computed(() =>
  sortNewestFirst(props.events).map((event, index) => {
    const date = toDate(event.date);
    return { event, index, date, key: event.id ?? `${index}:${event.title}` };
  }),
);

/** Glyph per tone, so the state is not told by colour alone (WCAG 1.4.1). */
const TONE_ICONS: Record<TimelineTone, string> = {
  success: "✓",
  warning: "⚠",
  danger: "✕",
  info: "ℹ",
  muted: "•",
};
const statusMode = computed(() => props.items !== undefined);
const compact = computed(() => props.variant === "compact");
function icon(item: TimelineItem): string {
  return TONE_ICONS[item.tone ?? "muted"];
}
function statusClasses(item: TimelineItem) {
  return [
    "ui-timeline__status",
    `ui-timeline__status--${item.tone ?? "muted"}`,
    { "ui-timeline__status--active": !!item.active },
  ];
}

const formatter = computed(() => new Intl.DateTimeFormat(props.locale, props.dateOptions));

function absolute(date: Date): string {
  return props.formatDate ? props.formatDate(date) : formatter.value.format(date);
}
</script>

<template>
  <!--
    An ordered list, because the order is the content: newest first, and the
    story reads differently in any other order.
  -->
  <ol
    v-if="statusMode"
    :class="['ui-timeline', 'ui-timeline--status', { 'ui-timeline--compact': compact }]"
    :aria-label="label"
  >
    <li
      v-for="item in items"
      :key="item.id"
      class="ui-timeline__step"
      :aria-current="item.active ? 'step' : undefined"
    >
      <span
        v-if="compact"
        :class="statusClasses(item)"
        role="img"
        :title="item.title"
        :aria-label="item.title"
      />
      <template v-else>
        <span :class="statusClasses(item)" aria-hidden="true">{{ icon(item) }}</span>
        <div class="ui-timeline__step-body">
          <slot name="item" :item="item">
            <div class="ui-timeline__head">
              <span class="ui-timeline__title">{{ item.title }}</span>
              <span v-if="item.time" class="ui-timeline__date">{{ item.time }}</span>
            </div>
            <div v-if="item.meta" class="ui-timeline__body">{{ item.meta }}</div>
          </slot>
        </div>
      </template>
    </li>
  </ol>
  <ol v-else-if="sorted.length" class="ui-timeline" :aria-label="label">
    <li v-for="item in sorted" :key="item.key" class="ui-timeline__event">
      <span class="ui-timeline__marker" aria-hidden="true" />
      <div class="ui-timeline__head">
        <template v-if="item.date">
          <UiRelativeTime
            v-if="dateFormat === 'relative'"
            class="ui-timeline__date"
            :date="item.date"
            :now="now ?? new Date()"
            :units="units"
            :stale-after-days="Number.POSITIVE_INFINITY"
          />
          <time v-else class="ui-timeline__date" :datetime="item.date.toISOString()">{{
            absolute(item.date)
          }}</time>
        </template>
        <span v-else class="ui-timeline__date">—</span>
        <span class="ui-timeline__title">{{ item.event.title }}</span>
        <UiTag
          v-if="item.event.tag"
          class="ui-timeline__tag"
          :variant="item.event.tagTone ?? 'neutral'"
          appearance="outline"
          >{{ item.event.tag }}</UiTag
        >
      </div>
      <div v-if="$slots.event || item.event.body" class="ui-timeline__body">
        <slot name="event" :event="item.event" :index="item.index">{{ item.event.body }}</slot>
      </div>
    </li>
  </ol>
  <p v-else class="ui-timeline__empty">
    <slot name="empty">{{ emptyText }}</slot>
  </p>
</template>
