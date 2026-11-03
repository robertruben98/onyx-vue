<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useOnyxLocale } from "../../locale";
import "./week-blocks.scss";

export interface WeekBlocksBlock {
  /** Start, in minutes of the day. */
  start: number;
  /** End, in minutes of the day. */
  end: number;
  title: string;
  detail?: string;
  tone?: "success" | "neutral";
}

export interface WeekBlocksDay {
  /** Stable key of the column, matched against `today`. */
  key: string;
  label: string;
  blocks: WeekBlocksBlock[];
  /** Shown instead of blocks when the day has none. */
  note?: string;
}

const props = withDefaults(
  defineProps<{
    days: WeekBlocksDay[];
    /** First minute shown, default 08:00. */
    start?: number;
    /** Last minute shown, default 20:00. */
    end?: number;
    /** Key of today's column, highlighted. */
    today?: string;
    /** `auto` switches to a list when the container is narrower than 640 px. */
    layout?: "auto" | "columns" | "list";
  }>(),
  { start: 480, end: 1200, today: undefined, layout: "auto" },
);

const NARROW_PX = 640;
const messages = useOnyxLocale();

const root = ref<HTMLElement | null>(null);
// 0 = not measured (no ResizeObserver, jsdom, hidden): columns.
const width = ref(0);
let observer: ResizeObserver | undefined;

onMounted(() => {
  const el = root.value;
  if (props.layout !== "auto" || !el || typeof ResizeObserver === "undefined") return;
  width.value = el.getBoundingClientRect().width;
  observer = new ResizeObserver((entries) => {
    width.value = entries[0]?.contentRect.width ?? el.getBoundingClientRect().width;
  });
  observer.observe(el);
});
onBeforeUnmount(() => observer?.disconnect());

const mode = computed<"columns" | "list">(() => {
  if (props.layout !== "auto") return props.layout;
  return width.value > 0 && width.value < NARROW_PX ? "list" : "columns";
});

const span = computed(() => Math.max(props.end - props.start, 1));
const fmt = (n: number) => `${Math.round(n * 1e4) / 1e4}%`;
const clock = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const range = (b: WeekBlocksBlock) => `${clock(b.start)}–${clock(b.end)}`;

const hours = computed(() => {
  const first = Math.ceil(props.start / 60);
  const last = Math.floor(props.end / 60);
  return Array.from({ length: Math.max(last - first + 1, 0) }, (_, i) => {
    const minute = (first + i) * 60;
    return { minute, top: fmt(((minute - props.start) / span.value) * 100), text: String(first + i).padStart(2, "0") };
  });
});

const columns = computed(() =>
  props.days.map((d) => ({
    ...d,
    isToday: d.key === props.today,
    // Blocks wholly outside start..end (or empty) are dropped; the rest are clipped.
    placed: d.blocks.filter((b) => b.end > b.start && b.end > props.start && b.start < props.end).map((b) => {
      const from = Math.max(b.start, props.start);
      const to = Math.min(b.end, props.end);
      return {
        ...b,
        text: range(b),
        tip: [range(b), b.title, b.detail].filter(Boolean).join(" · "),
        top: fmt(((from - props.start) / span.value) * 100),
        height: fmt((Math.max(to - from, 0) / span.value) * 100),
      };
    }),
  })),
);
</script>

<template>
  <div ref="root" :style="{ '--ui-week-blocks-days': days.length }" :class="['ui-week-blocks', `ui-week-blocks--${mode}`]" :aria-label="messages.weekBlocksLabel" role="group">
    <template v-if="mode === 'columns'">
      <div class="ui-week-blocks__gutter" aria-hidden="true">
        <span class="ui-week-blocks__gutter-head" />
        <div class="ui-week-blocks__gutter-body">
          <span v-for="h in hours" :key="h.minute" class="ui-week-blocks__hour" :style="{ top: h.top }">{{ h.text }}</span>
        </div>
      </div>
      <div
        v-for="c in columns"
        :key="c.key"
        :class="['ui-week-blocks__column', { 'ui-week-blocks__column--today': c.isToday }]"
        :aria-current="c.isToday ? 'date' : undefined"
        role="group"
        :aria-label="c.label"
      >
        <div class="ui-week-blocks__head">{{ c.label }}</div>
        <div class="ui-week-blocks__body">
          <span
            v-for="h in hours"
            :key="h.minute"
            class="ui-week-blocks__gridline"
            :style="{ top: h.top }"
            aria-hidden="true"
          />
          <ul v-if="c.placed.length" class="ui-week-blocks__blocks">
            <li
              v-for="(b, i) in c.placed"
              :key="i"
              :class="['ui-week-blocks__block', `ui-week-blocks__block--${b.tone ?? 'success'}`]"
              :style="{ top: b.top, height: b.height }"
              :title="b.tip"
            >
              <span class="ui-week-blocks__sr">{{ b.text }} </span>
              <span class="ui-week-blocks__title">{{ b.title }}</span>
              <span v-if="b.detail" class="ui-week-blocks__detail">{{ b.detail }}</span>
            </li>
          </ul>
          <p v-else-if="c.note" class="ui-week-blocks__note">{{ c.note }}</p>
        </div>
      </div>
    </template>
    <template v-else>
      <section
        v-for="c in columns"
        :key="c.key"
        :class="['ui-week-blocks__day', { 'ui-week-blocks__day--today': c.isToday }]"
        :aria-current="c.isToday ? 'date' : undefined"
      >
        <h3 class="ui-week-blocks__day-label">{{ c.label }}</h3>
        <ul v-if="c.placed.length" class="ui-week-blocks__rows">
          <li v-for="(b, i) in c.placed" :key="i" class="ui-week-blocks__row">
            <span :class="['ui-week-blocks__dot', `ui-week-blocks__block--${b.tone ?? 'success'}`]" aria-hidden="true" />
            {{ [b.text, b.title, b.detail].filter(Boolean).join(" · ") }}
          </li>
        </ul>
        <p v-else-if="c.note" class="ui-week-blocks__note">{{ c.note }}</p>
      </section>
    </template>
  </div>
</template>
