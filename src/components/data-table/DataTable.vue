<script setup lang="ts" generic="T">
import { computed, ref, watch, nextTick } from "vue";
import UiCheckbox from "../checkbox/Checkbox.vue";
import "./data-table.scss";

export type RowKey = string | number;
export type CellAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";
export type DataTableMode = "paginated" | "virtual";
export type SelectionMode = "none" | "single" | "multiple";

/** One level of the (multi-)column sort. */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Column definition for the DataTable. */
export interface DataTableColumn<T> {
  /** Unique id (sort state, header id; also the scoped-slot name `cell-<id>`). */
  id: string;
  /** Header label. */
  header: string;
  /**
   * Field accessor for the cell's text value.
   *
   * Typed as a plain string (not `keyof T`) on purpose: using `keyof T` here
   * makes `DataTableColumn` invariant in `T`, which breaks assigning a
   * `DataTableColumn<Concrete>[]` to a `DataTableColumn<unknown>[]` — exactly
   * what happens when the component is rendered without an explicit generic
   * instantiation (e.g. in tests). Prefer the typed `value(row)` accessor when
   * you want `keyof`-level safety.
   */
  field?: string;
  /**
   * Computed value accessor (alternative to `field`).
   *
   * Method syntax (bivariant) keeps the column covariant in `T`.
   */
  value?(row: T): unknown;
  /** Horizontal alignment. */
  align?: CellAlign;
  /** CSS track size for this column (e.g. '8rem', 'minmax(0,2fr)'). */
  width?: string;
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** Sort key accessor; defaults to the `value`/`field` value. */
  sortAccessor?(row: T): string | number;
}

const props = withDefaults(
  defineProps<{
    /** Column definitions. */
    columns: DataTableColumn<T>[];
    /** Row data (all rows; processed client-side). */
    rows?: T[];
    /**
     * Row identity: a field name or a function. Defaults to `row.id`.
     *
     * Accepts any string (in addition to `keyof T`) so the prop stays usable
     * when the component is rendered without an explicit generic
     * instantiation (e.g. in tests), where `T` widens to `unknown`.
     */
    rowKey?: keyof T | (string & {}) | ((row: T) => RowKey);
    /** Loading state. */
    loading?: boolean;
    /** Text shown when there are no rows. */
    emptyText?: string;
    /** Accessible name for the grid. */
    caption?: string;
    /** Allow additive multi-column sort via Shift+click. */
    multiSort?: boolean;
    /** Layout mode: paginated footer vs virtual scroll. */
    mode?: DataTableMode;
    /** Options for the rows-per-page control. */
    pageSizeOptions?: number[];
    /** Row selection mode. */
    selectable?: SelectionMode;
    /** Row height in px (virtual scroll item size). */
    rowHeight?: number;
    /** Virtual scroll viewport height (CSS length). */
    viewportHeight?: string;
    /** Max height for paginated mode; enables internal scroll with sticky header. */
    maxHeight?: string;
  }>(),
  {
    rows: () => [],
    rowKey: undefined,
    loading: false,
    emptyText: "No data",
    caption: "",
    multiSort: false,
    mode: "paginated",
    pageSizeOptions: () => [10, 25, 50],
    selectable: "none",
    rowHeight: 44,
    viewportHeight: "400px",
    maxHeight: "",
  },
);

/** Active sort levels. Two-way bindable via v-model:sort. */
const sort = defineModel<SortState[]>("sort", { default: () => [] });
/** Current page (0-based). Two-way bindable via v-model:pageIndex. */
const pageIndex = defineModel<number>("pageIndex", { default: 0 });
/** Rows per page. Two-way bindable via v-model:pageSize. */
const pageSize = defineModel<number>("pageSize", { default: 10 });
/** Selected row keys. Two-way bindable via v-model:selected. */
const selected = defineModel<Set<RowKey>>("selected", {
  default: () => new Set(),
});

const root = ref<HTMLElement | null>(null);

// ----------------------------------------------------------------------------
// Value / sort helpers
// ----------------------------------------------------------------------------
function cellValue(col: DataTableColumn<T>, row: T): unknown {
  if (col.value) return col.value(row);
  if (col.field != null) return (row as Record<string, unknown>)[col.field];
  return "";
}

function rowKeyOf(row: T): RowKey {
  const key = props.rowKey;
  if (typeof key === "function") return key(row);
  if (key != null) {
    return (row as Record<string, unknown>)[key as string] as RowKey;
  }
  return (row as { id?: RowKey }).id ?? JSON.stringify(row);
}

function sortValue(col: DataTableColumn<T>, row: T): unknown {
  if (col.sortAccessor) return col.sortAccessor(row);
  return cellValue(col, row);
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/** Rows after applying the active sort. */
const sorted = computed<T[]>(() => {
  const s = sort.value;
  const rows = props.rows;
  if (!s.length) return rows;
  const cols = new Map(props.columns.map((c) => [c.id, c]));
  return [...rows].sort((a, b) => {
    for (const level of s) {
      const col = cols.get(level.columnId);
      if (!col) continue;
      const cmp = compare(sortValue(col, a), sortValue(col, b));
      if (cmp !== 0) return level.direction === "asc" ? cmp : -cmp;
    }
    return 0;
  });
});

const total = computed(() => sorted.value.length);
const pageCount = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value)),
);
const currentPage = computed(() =>
  Math.min(Math.max(0, pageIndex.value), pageCount.value - 1),
);

/** Rows currently rendered (sorted, then paged in paginated mode). */
const visibleRows = computed<T[]>(() => {
  if (props.mode === "virtual") return sorted.value;
  const start = currentPage.value * pageSize.value;
  return sorted.value.slice(start, start + pageSize.value);
});

const showFooter = computed(
  () => props.mode === "paginated" && !props.loading && total.value > 0,
);
const rangeStart = computed(() =>
  total.value ? currentPage.value * pageSize.value + 1 : 0,
);
const rangeEnd = computed(() =>
  Math.min((currentPage.value + 1) * pageSize.value, total.value),
);

/** CSS grid track template derived from column widths (+ selection column). */
const templateColumns = computed(() => {
  const tracks = props.columns.map((c) => c.width ?? "minmax(0, 1fr)");
  if (props.selectable !== "none") {
    tracks.unshift("var(--ui-data-table-select-col-width)");
  }
  return tracks.join(" ");
});

const colCount = computed(
  () => props.columns.length + (props.selectable !== "none" ? 1 : 0),
);

const ariaRowCount = computed(() => props.rows.length + 1);

// ----------------------------------------------------------------------------
// Selection
// ----------------------------------------------------------------------------
const allKeys = computed<RowKey[]>(() => sorted.value.map((r) => rowKeyOf(r)));
const allSelected = computed(() => {
  const keys = allKeys.value;
  const sel = selected.value;
  return keys.length > 0 && keys.every((k) => sel.has(k));
});
const someSelected = computed(() => {
  const keys = allKeys.value;
  const sel = selected.value;
  const hit = keys.filter((k) => sel.has(k)).length;
  return hit > 0 && hit < keys.length;
});

function isSelected(row: T): boolean {
  return selected.value.has(rowKeyOf(row));
}

function toggleRow(row: T, checked: boolean): void {
  const key = rowKeyOf(row);
  if (props.selectable === "single") {
    selected.value = checked ? new Set([key]) : new Set();
    return;
  }
  const next = new Set(selected.value);
  if (checked) next.add(key);
  else next.delete(key);
  selected.value = next;
}

function toggleAll(checked: boolean): void {
  selected.value = checked ? new Set(allKeys.value) : new Set();
}

// ----------------------------------------------------------------------------
// Sorting
// ----------------------------------------------------------------------------
function sortDirectionOf(col: DataTableColumn<T>): SortDirection | null {
  return sort.value.find((s) => s.columnId === col.id)?.direction ?? null;
}

function ariaSort(
  col: DataTableColumn<T>,
): "ascending" | "descending" | "none" | undefined {
  if (!col.sortable) return undefined;
  const dir = sortDirectionOf(col);
  return dir ? (dir === "asc" ? "ascending" : "descending") : "none";
}

function toggleSort(col: DataTableColumn<T>, event: MouseEvent): void {
  if (!col.sortable) return;
  const additive = props.multiSort && event.shiftKey;
  const current = sort.value;
  const dir = sortDirectionOf(col);
  const next: SortState | null =
    dir === null
      ? { columnId: col.id, direction: "asc" }
      : dir === "asc"
        ? { columnId: col.id, direction: "desc" }
        : null;
  if (additive) {
    const without = current.filter((s) => s.columnId !== col.id);
    sort.value = next ? [...without, next] : without;
  } else {
    sort.value = next ? [next] : [];
  }
}

// ----------------------------------------------------------------------------
// Pagination
// ----------------------------------------------------------------------------
function prevPage(): void {
  pageIndex.value = Math.max(0, currentPage.value - 1);
}
function nextPage(): void {
  pageIndex.value = Math.min(pageCount.value - 1, currentPage.value + 1);
}
function changePageSize(event: Event): void {
  const size = Number((event.target as HTMLSelectElement).value);
  pageSize.value = size;
  pageIndex.value = 0;
}

// ----------------------------------------------------------------------------
// Virtual scroll (hand-rolled windowing — no deps)
// ----------------------------------------------------------------------------
const viewport = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewportClientHeight = ref(0);
const OVERSCAN = 4;

function onViewportScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop;
}

watch(viewport, (el) => {
  viewportClientHeight.value = el ? el.clientHeight : 0;
});

const virtualStart = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - OVERSCAN),
);
const virtualCount = computed(() => {
  const h = viewportClientHeight.value || parseFloat(props.viewportHeight) || 0;
  return Math.ceil(h / props.rowHeight) + OVERSCAN * 2;
});
const virtualEnd = computed(() =>
  Math.min(sorted.value.length, virtualStart.value + virtualCount.value),
);
/** The windowed slice rendered in virtual mode, with their absolute indices. */
const virtualRows = computed(() =>
  sorted.value
    .slice(virtualStart.value, virtualEnd.value)
    .map((row, i) => ({ row, index: virtualStart.value + i })),
);
const virtualTotalHeight = computed(() => sorted.value.length * props.rowHeight);
const virtualOffset = computed(() => virtualStart.value * props.rowHeight);

// ----------------------------------------------------------------------------
// Roving 2D keyboard grid navigation (row 0 = header)
// ----------------------------------------------------------------------------
const activeCell = ref<{ row: number; col: number }>({ row: 0, col: 0 });

// Reset roving focus to the first header cell when the row set or layout
// changes so indices never go stale (mirrors the Angular effect()).
watch(
  () => [sorted.value, currentPage.value, props.mode, props.selectable],
  () => {
    activeCell.value = { row: 0, col: 0 };
  },
);

function isActiveCell(row: number, col: number): boolean {
  const a = activeCell.value;
  return a.row === row && a.col === col;
}

function dataColOf(ci: number): number {
  return props.selectable !== "none" ? ci + 1 : ci;
}

function pageJump(): number {
  return props.mode === "paginated" ? pageSize.value : 10;
}

function scrollIndexIntoView(index: number): void {
  const vp = viewport.value;
  if (!vp) return;
  const top = index * props.rowHeight;
  const bottom = top + props.rowHeight;
  if (top < vp.scrollTop) vp.scrollTop = top;
  else if (bottom > vp.scrollTop + vp.clientHeight)
    vp.scrollTop = bottom - vp.clientHeight;
}

function focusCell(row: number, col: number): void {
  const el = root.value;
  if (!el) return;
  const sel = `[data-row="${row}"][data-col="${col}"]`;
  const found = () => el.querySelector<HTMLElement>(sel);
  const cell = found();
  if (cell) {
    cell.focus();
    return;
  }
  // Virtual mode: bring the row into view, then focus (best-effort).
  if (props.mode === "virtual" && row > 0) {
    scrollIndexIntoView(row - 1);
    nextTick(() => found()?.focus());
  }
}

function activateCell(): void {
  const { row, col } = activeCell.value;
  const cell = root.value?.querySelector<HTMLElement>(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  cell
    ?.querySelector<HTMLElement>('button, input, a, [role="checkbox"]')
    ?.click();
  // Keep focus on the cell (roving tabindex) rather than the inner control.
  cell?.focus();
}

function onGridKeydown(event: KeyboardEvent): void {
  const a = activeCell.value;
  const rowMax = visibleRows.value.length; // header = 0, data rows = 1..N
  const colMax = colCount.value - 1;
  let { row, col } = a;
  switch (event.key) {
    case "ArrowRight":
      col = Math.min(colMax, col + 1);
      break;
    case "ArrowLeft":
      col = Math.max(0, col - 1);
      break;
    case "ArrowDown":
      row = Math.min(rowMax, row + 1);
      break;
    case "ArrowUp":
      row = Math.max(0, row - 1);
      break;
    case "Home":
      col = 0;
      if (event.ctrlKey) row = 0;
      break;
    case "End":
      col = colMax;
      if (event.ctrlKey) row = rowMax;
      break;
    case "PageDown":
      row = Math.min(rowMax, row + pageJump());
      break;
    case "PageUp":
      row = Math.max(0, row - pageJump());
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      activateCell();
      return;
    default:
      return;
  }
  event.preventDefault();
  activeCell.value = { row, col };
  focusCell(row, col);
}
</script>

<template>
  <span ref="root" class="ui-data-table">
    <div
      class="ui-dt__grid"
      role="grid"
      :aria-label="caption || undefined"
      :aria-rowcount="ariaRowCount"
      :aria-colcount="colCount"
      :aria-busy="loading ? 'true' : undefined"
      :style="{
        maxHeight: maxHeight || undefined,
        overflowY: maxHeight ? 'auto' : undefined,
      }"
      @keydown="onGridKeydown"
    >
      <!-- Header row -->
      <div
        class="ui-dt__head"
        role="row"
        aria-rowindex="1"
        :style="{ gridTemplateColumns: templateColumns }"
      >
        <div
          v-if="selectable !== 'none'"
          role="columnheader"
          class="ui-dt__th ui-dt__cell--select"
          data-row="0"
          data-col="0"
          :tabindex="isActiveCell(0, 0) ? 0 : -1"
        >
          <UiCheckbox
            v-if="selectable === 'multiple'"
            aria-label="Select all rows"
            :tabindex="-1"
            :model-value="allSelected"
            :indeterminate="someSelected"
            @update:model-value="toggleAll($event)"
          />
        </div>

        <div
          v-for="(col, ci) in columns"
          :key="col.id"
          role="columnheader"
          class="ui-dt__th"
          :class="{
            'ui-dt__cell--center': col.align === 'center',
            'ui-dt__cell--end': col.align === 'end',
          }"
          :aria-sort="ariaSort(col)"
          data-row="0"
          :data-col="dataColOf(ci)"
          :tabindex="isActiveCell(0, dataColOf(ci)) ? 0 : -1"
        >
          <button
            v-if="col.sortable"
            type="button"
            class="ui-dt__sort"
            tabindex="-1"
            @click="toggleSort(col, $event)"
          >
            <span>{{ col.header }}</span>
            <span class="ui-dt__sort-icon" aria-hidden="true">
              <template v-if="sortDirectionOf(col) === 'asc'">↑</template>
              <template v-else-if="sortDirectionOf(col) === 'desc'">↓</template>
              <template v-else>↕</template>
            </span>
          </button>
          <template v-else>{{ col.header }}</template>
        </div>
      </div>

      <!-- Body -->
      <div class="ui-dt__body" :role="mode === 'virtual' ? undefined : 'rowgroup'">
        <div v-if="loading" class="ui-dt__status" role="status">Loading…</div>

        <div v-else-if="!visibleRows.length" class="ui-dt__status">
          {{ emptyText }}
        </div>

        <!-- Virtual scroll (hand-rolled windowing) -->
        <div
          v-else-if="mode === 'virtual'"
          ref="viewport"
          class="ui-dt__viewport"
          role="rowgroup"
          :style="{ height: viewportHeight }"
          @scroll="onViewportScroll"
        >
          <div :style="{ height: virtualTotalHeight + 'px', position: 'relative' }">
            <div :style="{ transform: 'translateY(' + virtualOffset + 'px)' }">
              <div
                v-for="item in virtualRows"
                :key="rowKeyOf(item.row)"
                role="row"
                class="ui-dt__tr"
                :aria-rowindex="item.index + 2"
                :aria-selected="
                  selectable !== 'none' ? isSelected(item.row) : undefined
                "
                :class="{
                  'ui-dt__tr--selected':
                    selectable !== 'none' && isSelected(item.row),
                }"
                :style="{
                  height: rowHeight + 'px',
                  gridTemplateColumns: templateColumns,
                }"
              >
                <div
                  v-if="selectable !== 'none'"
                  role="gridcell"
                  class="ui-dt__td ui-dt__cell--select"
                  :data-row="item.index + 1"
                  data-col="0"
                  :tabindex="isActiveCell(item.index + 1, 0) ? 0 : -1"
                >
                  <UiCheckbox
                    aria-label="Select row"
                    :tabindex="-1"
                    :model-value="isSelected(item.row)"
                    @update:model-value="toggleRow(item.row, $event)"
                  />
                </div>
                <div
                  v-for="(col, ci) in columns"
                  :key="col.id"
                  role="gridcell"
                  class="ui-dt__td"
                  :class="{
                    'ui-dt__cell--center': col.align === 'center',
                    'ui-dt__cell--end': col.align === 'end',
                  }"
                  :data-row="item.index + 1"
                  :data-col="dataColOf(ci)"
                  :tabindex="isActiveCell(item.index + 1, dataColOf(ci)) ? 0 : -1"
                >
                  <slot
                    :name="'cell-' + col.id"
                    :row="item.row"
                    :value="cellValue(col, item.row)"
                  >
                    {{ cellValue(col, item.row) }}
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginated rows -->
        <template v-else>
          <div
            v-for="(row, i) in visibleRows"
            :key="rowKeyOf(row)"
            role="row"
            class="ui-dt__tr"
            :aria-rowindex="i + 2"
            :aria-selected="selectable !== 'none' ? isSelected(row) : undefined"
            :class="{
              'ui-dt__tr--selected': selectable !== 'none' && isSelected(row),
            }"
            :style="{ gridTemplateColumns: templateColumns }"
          >
            <div
              v-if="selectable !== 'none'"
              role="gridcell"
              class="ui-dt__td ui-dt__cell--select"
              :data-row="i + 1"
              data-col="0"
              :tabindex="isActiveCell(i + 1, 0) ? 0 : -1"
            >
              <UiCheckbox
                aria-label="Select row"
                :tabindex="-1"
                :model-value="isSelected(row)"
                @update:model-value="toggleRow(row, $event)"
              />
            </div>
            <div
              v-for="(col, ci) in columns"
              :key="col.id"
              role="gridcell"
              class="ui-dt__td"
              :class="{
                'ui-dt__cell--center': col.align === 'center',
                'ui-dt__cell--end': col.align === 'end',
              }"
              :data-row="i + 1"
              :data-col="dataColOf(ci)"
              :tabindex="isActiveCell(i + 1, dataColOf(ci)) ? 0 : -1"
            >
              <slot
                :name="'cell-' + col.id"
                :row="row"
                :value="cellValue(col, row)"
              >
                {{ cellValue(col, row) }}
              </slot>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer (pagination) -->
    <div v-if="showFooter" class="ui-dt__footer">
      <label class="ui-dt__page-size">
        <span>Rows per page</span>
        <select
          class="ui-dt__select"
          :value="pageSize"
          @change="changePageSize"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </label>

      <span class="ui-dt__range" aria-live="polite">
        {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
      </span>

      <div class="ui-dt__pager">
        <button
          type="button"
          class="ui-dt__page-btn"
          aria-label="Previous page"
          :disabled="currentPage === 0"
          @click="prevPage"
        >
          ‹
        </button>
        <span class="ui-dt__page-status">
          Page {{ currentPage + 1 }} of {{ pageCount }}
        </span>
        <button
          type="button"
          class="ui-dt__page-btn"
          aria-label="Next page"
          :disabled="currentPage >= pageCount - 1"
          @click="nextPage"
        >
          ›
        </button>
      </div>
    </div>
  </span>
</template>
