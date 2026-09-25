<script setup lang="ts">
import { ref } from "vue";
import { UiInput } from "../input";
import "./filter-bar.scss";

/**
 * The strip under a page's top bar: a search box, then filter chips, then
 * whatever else narrows the list (a range, a "clear", a "hidden by settings"
 * notice).
 *
 * It grows instead of scrolling. Thirteen chips do not fit on one line at
 * 1680px and six do not fit at 1000; a second row costs 30px, a horizontal
 * scrollbar hides the chips nobody then finds.
 *
 * `focusSearch()` is exposed for the `/` shortcut every console page has.
 */
withDefaults(
  defineProps<{
    /** Placeholder of the search box. */
    searchPlaceholder?: string;
    /** Accessible name of the search box. */
    searchLabel?: string;
    /** Hides the search box, for a bar of chips only. */
    showSearch?: boolean;
    /** Accessible name of the bar. */
    label?: string;
  }>(),
  {
    searchPlaceholder: "filter",
    searchLabel: "Filter",
    showSearch: true,
    label: "Filters",
  },
);

/** The search text (`v-model:search`). */
const search = defineModel<string>("search", { default: "" });

const input = ref<InstanceType<typeof UiInput> | null>(null);

function focusSearch(): void {
  input.value?.focus();
}

defineExpose({ focusSearch });
</script>

<template>
  <div class="ui-filter-bar" role="search" :aria-label="label">
    <UiInput
      v-if="showSearch"
      ref="input"
      v-model="search"
      class="ui-filter-bar__search"
      type="search"
      size="sm"
      :placeholder="searchPlaceholder"
      :aria-label="searchLabel"
    />
    <span v-if="showSearch && $slots.default" class="ui-filter-bar__rule" aria-hidden="true" />
    <div v-if="$slots.default" class="ui-filter-bar__chips"><slot /></div>
    <div v-if="$slots.trailing" class="ui-filter-bar__trailing"><slot name="trailing" /></div>
  </div>
</template>
