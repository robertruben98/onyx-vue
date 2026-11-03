<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useOnyxLocale } from "../../locale";
import "./conversation.scss";

export interface ConversationItem {
  key: string;
  /** Day label of the item ("Hoy", "lunes 2 nov"). A separator is drawn whenever it changes. */
  day: string;
  /** Run key (e.g. the sender). Consecutive items with the same group form a run; the slot gets `first` on its start. */
  group?: string;
}

const TOP_THRESHOLD = 200; // px from the top that asks for older items
const BOTTOM_THRESHOLD = 80; // px from the bottom that still counts as "at the bottom"

const props = withDefaults(
  defineProps<{
    items: ConversationItem[];
    /** Older items are being fetched: no further `load-older` is emitted. */
    loadingOlder?: boolean;
    /** There are older items to fetch. */
    hasOlder?: boolean;
    /** Text of the read-only composer pill. The `footer` slot replaces it. */
    composerText?: string;
  }>(),
  { loadingOlder: false, hasOlder: false },
);
const emit = defineEmits<{ "load-older": [] }>();

const locale = useOnyxLocale();
const scroller = ref<HTMLElement | null>(null);
const unseen = ref(0);
let loadRequested = false; // latch: one load-older per load, until the parent reacts

// One section per day, so the day chip sticks only while its own day is on screen.
const days = computed(() => {
  const seen = new Map<string, number>();
  const out: { day: string; key: string; rows: { item: ConversationItem; index: number; first: boolean }[] }[] = [];
  props.items.forEach((item, index) => {
    const prev = index > 0 ? props.items[index - 1] : undefined;
    const newDay = !prev || prev.day !== item.day;
    // Without a group nothing is known about runs: every item counts as the start of one.
    const first = newDay || item.group === undefined || prev?.group !== item.group;
    if (newDay) {
      // Keyed by the day label (+ occurrence for repeated labels), not by the first item: a same-day
      // prepend must not change the key and remount the whole oldest day.
      const n = seen.get(item.day) ?? 0;
      seen.set(item.day, n + 1);
      out.push({ day: item.day, key: `${item.day}#${n}`, rows: [] });
    }
    out[out.length - 1].rows.push({ item, index, first });
  });
  return out;
});

const pillText = computed(() => {
  const template = unseen.value === 1 ? locale.conversationNewMessages.one : locale.conversationNewMessages.other;
  return template.replace("{n}", String(unseen.value));
});

function distanceFromBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

function scrollToBottom() {
  const el = scroller.value;
  if (el) el.scrollTop = el.scrollHeight;
  unseen.value = 0;
}

function onScroll() {
  const el = scroller.value;
  if (!el) return;
  if (distanceFromBottom(el) <= BOTTOM_THRESHOLD) unseen.value = 0;
  if (el.scrollTop <= TOP_THRESHOLD && props.hasOlder && !props.loadingOlder && !loadRequested) {
    loadRequested = true;
    emit("load-older");
  }
}

// Content that fits the viewport never scrolls, so no scroll event would ask for older items.
// clientHeight 0 means "not laid out yet": nothing can be said about the fit.
function loadIfShort() {
  const el = scroller.value;
  if (!el || loadRequested || !props.hasOlder || props.loadingOlder) return;
  if (el.clientHeight > 0 && el.scrollHeight <= el.clientHeight) {
    loadRequested = true;
    emit("load-older");
  }
}

onMounted(() => {
  scrollToBottom(); // a conversation opens at the newest message
  loadIfShort();
});

watch(
  () => props.loadingOlder,
  (loading) => {
    if (!loading) loadRequested = false;
  },
);

// flush "pre": runs before the DOM patch, so the old geometry can still be measured.
watch(
  () => props.items,
  (next, prev) => {
    const el = scroller.value;
    if (!el || !next.length) return;
    const prevKeys = new Set(prev.map((i) => i.key));
    if (!prev.length || !next.some((i) => prevKeys.has(i.key))) {
      // empty -> filled, or a whole new list (another chat): start over at the newest message
      unseen.value = 0;
      loadRequested = false;
      nextTick(() => {
        scrollToBottom();
        loadIfShort();
      });
      return;
    }
    const oldFirst = prev[0].key;
    const oldLast = prev[prev.length - 1].key;
    const prepended = next.findIndex((i) => i.key === oldFirst) > 0;
    const appended = next[next.length - 1].key !== oldLast && next.some((i) => i.key === oldLast);
    const heightBefore = el.scrollHeight;
    const topBefore = el.scrollTop;
    const wasAtBottom = distanceFromBottom(el) <= BOTTOM_THRESHOLD;
    const added = next.length - prev.length;
    // The pill count is known now, so it renders in the same flush as the new items.
    if (appended && !wasAtBottom) unseen.value += Math.max(added, 1);
    nextTick(() => {
      if (prepended) el.scrollTop = topBefore + (el.scrollHeight - heightBefore);
      if (appended && wasAtBottom) scrollToBottom();
      loadRequested = false;
      loadIfShort();
    });
  },
  { flush: "pre" },
);
</script>

<template>
  <div class="ui-conversation">
    <div class="ui-conversation__wallpaper" aria-hidden="true" />
    <div class="ui-conversation__body">
      <div ref="scroller" class="ui-conversation__scroll" role="log" tabindex="0" @scroll="onScroll">
        <section v-for="d in days" :key="d.key" class="ui-conversation__section">
          <div class="ui-conversation__day">
            <span class="ui-conversation__day-chip">{{ d.day }}</span>
          </div>
          <div
            v-for="row in d.rows"
            :key="row.item.key"
            class="ui-conversation__item"
            :class="{ 'ui-conversation__item--first': row.first }"
          >
            <slot name="item" :item="row.item" :index="row.index" :first="row.first" />
          </div>
        </section>
      </div>
      <button v-if="unseen > 0" type="button" class="ui-conversation__pill" @click="scrollToBottom">
        {{ pillText }}
      </button>
    </div>
    <div
      v-if="$slots.footer || composerText"
      class="ui-conversation__composer"
      :class="{ 'ui-conversation__composer--readonly': !$slots.footer }"
    >
      <slot name="footer">
        <span class="ui-conversation__composer-text">{{ composerText }}</span>
      </slot>
    </div>
  </div>
</template>
