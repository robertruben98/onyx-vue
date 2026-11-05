<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed } from "vue";
import { UiButton } from "../button";
import { UiSelect } from "../select";
import "./pagination.scss";

const messages = useOnyxLocale();

const props = withDefaults(
  defineProps<{
    /**
     * Number of pages. Optional when `total` and `pageSize` are given: it is
     * then `ceil(total / pageSize)`.
     */
    pageCount?: number;
    /**
     * Items in the whole list. With `pageSize` it shows the range summary
     * ("1–20 of 43", locale `paginationRange`), announced on page change.
     */
    total?: number;
    /** Page sizes offered in a compact select (needs `v-model:page-size`). */
    pageSizeOptions?: number[];
    /** Pages shown on each side of the current one. */
    siblings?: number;
    /** Accessible name of the navigation. */
    label?: string;
  }>(),
  {
    pageCount: undefined,
    total: undefined,
    pageSizeOptions: () => [],
    siblings: 1,
    label: () => useOnyxLocale().paginationLabel,
  },
);

/** The current page, from 1 (v-model:page). */
const page = defineModel<number>("page", { default: 1 });

/** Items per page (v-model:page-size). Unset, there is no range summary. */
const pageSize = defineModel<number | undefined>("pageSize", { default: undefined });

const emit = defineEmits<{ pageChanged: [page: number] }>();

const size = computed(() => (pageSize.value && pageSize.value > 0 ? Math.floor(pageSize.value) : 0));
const total = computed(() => (props.total !== undefined && props.total >= 0 ? Math.floor(props.total) : undefined));

const count = computed(() => {
  if (props.pageCount !== undefined) return Math.max(0, Math.floor(props.pageCount));
  if (total.value !== undefined && size.value) return Math.ceil(total.value / size.value);
  return 0;
});
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

/** "1–20 of 43"; null without `total` and `pageSize`. */
const range = computed(() => {
  if (total.value === undefined || !size.value) return null;
  const from = total.value === 0 ? 0 : (current.value - 1) * size.value + 1;
  const to = Math.min(current.value * size.value, total.value);
  return messages.paginationRange
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total.value));
});

const sizeOptions = computed(() =>
  props.pageSizeOptions.filter((n) => n > 0).map((n) => ({ value: String(n), label: String(n) })),
);

/**
 * Cambiar el tamano de pagina mantiene a la vista el primer elemento que se
 * estaba viendo: la pagina nueva es la que lo contiene.
 */
function changeSize(value: string | null): void {
  const next = Number(value);
  if (!next || next === size.value) return;
  const firstShown = (current.value - 1) * (size.value || next);
  pageSize.value = next;
  const target = Math.floor(firstShown / next) + 1;
  if (target !== current.value) {
    page.value = target;
    emit("pageChanged", target);
  }
}

function go(target: number): void {
  if (target < 1 || target > count.value || target === current.value) return;
  page.value = target;
  emit("pageChanged", target);
}
</script>

<template>
  <nav v-if="count > 0" class="ui-pagination" :class="{ 'ui-pagination--extras': range || sizeOptions.length }" :aria-label="label">
    <p v-if="range" class="ui-pagination__range" aria-live="polite">{{ range }}</p>
    <ul class="ui-pagination__list">
      <li>
        <UiButton
          variant="text"
          size="sm"
          :aria-label="messages.previousPage"
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
          :aria-label="messages.page.replace('{page}', String(item))"
          :aria-current="item === current ? 'page' : undefined"
          @clicked="go(item)"
          >{{ item }}</UiButton
        >
      </li>
      <li>
        <UiButton
          variant="text"
          size="sm"
          :aria-label="messages.nextPage"
          :disabled="current >= count"
          @clicked="go(current + 1)"
          >›</UiButton
        >
      </li>
    </ul>
    <div v-if="sizeOptions.length" class="ui-pagination__size">
      <UiSelect
        :model-value="size ? String(size) : null"
        :options="sizeOptions"
        :aria-label="messages.paginationPageSizeLabel"
        @changed="changeSize"
      />
    </div>
  </nav>
</template>
