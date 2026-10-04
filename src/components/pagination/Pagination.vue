<script setup lang="ts">
import { computed } from "vue";
import { UiButton } from "../button";
import "./pagination.scss";

const props = withDefaults(
  defineProps<{
    /** Number of pages. */
    pageCount: number;
    /** Pages shown on each side of the current one. */
    siblings?: number;
    /** Accessible name of the navigation. */
    label?: string;
  }>(),
  { siblings: 1, label: "Pagination" },
);

/** The current page, from 1 (v-model:page). */
const page = defineModel<number>("page", { default: 1 });

const emit = defineEmits<{ pageChanged: [page: number] }>();

const count = computed(() => Math.max(0, Math.floor(props.pageCount)));
const current = computed(() => Math.min(Math.max(1, Math.floor(page.value)), Math.max(1, count.value)));

/**
 * First, last and the current page with its siblings; a gap where pages are
 * skipped. A gap that would hide a single page shows the page instead: "…"
 * standing for one number saves nothing and hides where you can go.
 */
const items = computed<(number | "gap")[]>(() => {
  const n = count.value;
  if (n === 0) return [];
  const s = Math.max(0, Math.floor(props.siblings));
  const pages = new Set<number>([1, n]);
  for (let p = current.value - s; p <= current.value + s; p++) if (p >= 1 && p <= n) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) out.push("gap");
    out.push(p);
  });
  return out;
});

function go(target: number): void {
  if (target < 1 || target > count.value || target === current.value) return;
  page.value = target;
  emit("pageChanged", target);
}
</script>

<template>
  <nav v-if="count > 0" class="ui-pagination" :aria-label="label">
    <ul class="ui-pagination__list">
      <li>
        <UiButton
          variant="text"
          size="sm"
          aria-label="Previous page"
          :disabled="current <= 1"
          @clicked="go(current - 1)"
          >‹</UiButton
        >
      </li>
      <li v-for="(item, i) in items" :key="item === 'gap' ? `gap-${i}` : item">
        <span v-if="item === 'gap'" class="ui-pagination__gap" aria-hidden="true">…</span>
        <UiButton
          v-else
          :variant="item === current ? 'primary' : 'text'"
          size="sm"
          :aria-label="`Page ${item}`"
          :aria-current="item === current ? 'page' : undefined"
          @clicked="go(item)"
          >{{ item }}</UiButton
        >
      </li>
      <li>
        <UiButton
          variant="text"
          size="sm"
          aria-label="Next page"
          :disabled="current >= count"
          @clicked="go(current + 1)"
          >›</UiButton
        >
      </li>
    </ul>
  </nav>
</template>
