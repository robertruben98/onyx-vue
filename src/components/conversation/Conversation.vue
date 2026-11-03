<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useOnyxLocale } from "../../locale";
import "./conversation.scss";

export interface ConversationItem {
  key: string;
  /** Day label of the item ("Hoy", "lunes 2 nov"). A separator is drawn whenever it changes. */
  day: string;
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
  }>(),
  { loadingOlder: false, hasOlder: false },
);
const emit = defineEmits<{ "load-older": [] }>();

const locale = useOnyxLocale();
const scroller = ref<HTMLElement | null>(null);
const unseen = ref(0);
let loadRequested = false; // latch: one load-older per load, until the parent reacts

const rows = computed(() =>
  props.items.map((item, index) => ({
    item,
    index,
    separator: index === 0 || props.items[index - 1].day !== item.day,
  })),
);

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
    if (!el || !prev.length || !next.length) {
      if (el && next.length && !prev.length) nextTick(scrollToBottom);
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
    });
  },
  { flush: "pre" },
);
</script>

<template>
  <div class="ui-conversation">
    <div ref="scroller" class="ui-conversation__scroll" role="log" tabindex="0" @scroll="onScroll">
      <template v-for="row in rows" :key="row.item.key">
        <div v-if="row.separator" class="ui-conversation__day">{{ row.item.day }}</div>
        <div class="ui-conversation__item">
          <slot name="item" :item="row.item" :index="row.index" />
        </div>
      </template>
    </div>
    <button v-if="unseen > 0" type="button" class="ui-conversation__pill" @click="scrollToBottom">
      {{ pillText }}
    </button>
  </div>
</template>
