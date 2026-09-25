<script setup lang="ts">
import { UiDisclosure } from "../disclosure";
import type { ChartLegendItem, ChartTable } from "./chart-kit";

/**
 * The parts every chart shares around its SVG: the legend above, the tooltip
 * and the table twin below. Internal — rendered by UiBarChart and UiBarList,
 * not exported.
 *
 * Which part is drawn is chosen by `part`, so each chart can put the legend
 * before its SVG and the table after it without two components.
 */
defineProps<{
  part: "legend" | "tip" | "table";
  legend?: ChartLegendItem[];
  tip?: { text: string; x: number; y: number } | null;
  table?: ChartTable | null;
  tableSummary?: string;
}>();

const tableOpen = defineModel<boolean>("tableOpen", { default: false });
</script>

<template>
  <div v-if="part === 'legend' && legend && legend.length" class="ui-chart__legend">
    <span v-for="k in legend" :key="k.label" class="ui-chart__key">
      <i :class="['ui-chart__swatch', `ui-chart--${k.tone}`]" aria-hidden="true" />{{ k.label }}
    </span>
  </div>
  <Teleport v-else-if="part === 'tip'" to="body">
    <div
      v-if="tip"
      class="ui-chart__tip"
      role="status"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
    >{{ tip.text }}</div>
  </Teleport>
  <UiDisclosure
    v-else-if="part === 'table' && table && table.rows.length"
    v-model:open="tableOpen"
    class="ui-chart__twin"
    :summary="tableSummary || 'data'"
    :bordered="false"
  >
    <table class="ui-chart__table">
      <thead>
        <tr>
          <th v-for="(h, i) in table.headers" :key="i" :class="{ 'ui-chart__num': i > 0 }" scope="col">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in table.rows" :key="r">
          <td v-for="(c, i) in row" :key="i" :class="{ 'ui-chart__num': i > 0 }">{{ c }}</td>
        </tr>
      </tbody>
    </table>
  </UiDisclosure>
</template>
