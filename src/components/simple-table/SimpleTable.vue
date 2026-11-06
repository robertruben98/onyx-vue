<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import "./simple-table.scss";

export type SimpleTableAlign = "start" | "center" | "end";
export type SimpleTableTone = "success" | "warning" | "danger" | "muted";

export interface SimpleTableColumn {
  /** Field read from each row; also the `cell-<key>` slot name. */
  key: string;
  /** Header text. */
  label: string;
  /** Text alignment of the header and its cells. */
  align?: SimpleTableAlign;
  /** Monospaced cells (ports, hashes, paths). */
  mono?: boolean;
  /** Secondary text colour for the cells. */
  muted?: boolean;
  /** Drops the column (header and cells) when the viewport is narrower than this many pixels, as `UiDataTable` does. */
  hideBelow?: number;
}

const KEY_FIELD = "id";

const props = withDefaults(
  defineProps<{
    /** Column definitions. */
    columns: SimpleTableColumn[];
    /** Row data. */
    rows?: T[];
    /** Row identity: a field name or a function. Defaults to `row.id`. */
    rowKey?: string | ((row: T, index: number) => string | number);
    /** Accessible name of the scrollable region (required). */
    ariaLabel: string;
    /** Tighter cell padding. */
    dense?: boolean;
    /** Per-cell tone; return `undefined` for none. */
    tone?: (row: T, column: SimpleTableColumn) => SimpleTableTone | undefined | null;
  }>(),
  { rows: () => [], rowKey: undefined, dense: false, tone: undefined },
);

// Same source of truth as UiDataTable: the viewport width.
const viewportWidth = ref(typeof window === "undefined" ? Infinity : window.innerWidth);
function onResize(): void {
  viewportWidth.value = window.innerWidth;
}
onMounted(() => {
  if (typeof window !== "undefined") window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  if (typeof window !== "undefined") window.removeEventListener("resize", onResize);
});

const shownColumns = computed(() =>
  props.columns.filter((c) => c.hideBelow == null || viewportWidth.value >= c.hideBelow),
);

function keyOf(row: T, index: number): string | number {
  if (typeof props.rowKey === "function") return props.rowKey(row, index);
  return row[props.rowKey ?? KEY_FIELD] ?? index;
}

function cellClasses(row: T, col: SimpleTableColumn): Record<string, boolean> {
  const tone = props.tone?.(row, col);
  return {
    "ui-simple-table__cell": true,
    [`ui-simple-table__cell--${col.align ?? "start"}`]: true,
    "ui-simple-table__cell--mono": !!col.mono,
    "ui-simple-table__cell--muted": !!col.muted,
    ...(tone ? { [`ui-simple-table__cell--${tone}`]: true } : {}),
  };
}
</script>

<template>
  <div class="ui-simple-table" role="region" tabindex="0" :aria-label="ariaLabel">
    <table :class="['ui-simple-table__table', { 'ui-simple-table__table--dense': dense }]">
      <thead>
        <tr>
          <th
            v-for="col in shownColumns"
            :key="col.key"
            scope="col"
            :class="['ui-simple-table__head', `ui-simple-table__cell--${col.align ?? 'start'}`]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="rows.length">
        <tr v-for="(row, i) in rows" :key="keyOf(row, i)">
          <td v-for="col in shownColumns" :key="col.key" :class="cellClasses(row, col)">
            <slot :name="`cell-${col.key}`" :row="row" :column="col" :value="row[col.key]">{{ row[col.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!rows.length" class="ui-simple-table__empty"><slot name="empty" /></div>
  </div>
</template>
