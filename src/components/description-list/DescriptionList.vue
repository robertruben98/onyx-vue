<script lang="ts">
/** One term and its value. */
export interface DescriptionItem {
  /** What the value is. Also the key of its override slot. */
  term: string;
  /** The value, already formatted. */
  value: string | number | null | undefined;
  /** Semantic tone of the value. */
  tone?: "default" | "muted" | "success" | "warning" | "danger";
  /** Tooltip for the value: the full path, the raw timestamp. */
  title?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./description-list.scss";

/**
 * Terms and values in a grid: the facts of a service, a run, an agent.
 *
 * A real `<dl>`, so a screen reader announces each value with its term.
 * Values wrap anywhere — they are paths and ids more often than prose — and an
 * empty value renders as an em dash, because a blank cell reads as "not
 * loaded" rather than "nothing".
 *
 * `columns: 'auto'` fits as many 16rem columns as the width allows; a number
 * fixes them (collapsing to one on a phone).
 */
const props = withDefaults(
  defineProps<{
    /** The pairs, in reading order. */
    items: DescriptionItem[];
    /** Columns of pairs. */
    columns?: number | "auto";
    /** Tighter rows. */
    dense?: boolean;
    /** Draws a rule under every pair. */
    ruled?: boolean;
    /** What an empty value shows. */
    emptyValue?: string;
  }>(),
  { columns: "auto", dense: false, ruled: true, emptyValue: "—" },
);

const rootClasses = computed(() => ({
  "ui-description-list": true,
  "ui-description-list--dense": props.dense,
  "ui-description-list--ruled": props.ruled,
}));

const rootStyle = computed(() =>
  props.columns === "auto"
    ? undefined
    : { "--ui-description-list-columns": String(props.columns) },
);

function shown(v: DescriptionItem["value"]): string {
  return v === null || v === undefined || v === "" ? props.emptyValue : String(v);
}
</script>

<template>
  <dl
    :class="[rootClasses, { 'ui-description-list--fixed': columns !== 'auto' }]"
    :style="rootStyle"
  >
    <div v-for="item in items" :key="item.term" class="ui-description-list__pair">
      <dt class="ui-description-list__term">{{ item.term }}</dt>
      <dd
        :class="['ui-description-list__value', `ui-description-list__value--${item.tone ?? 'default'}`]"
        :title="item.title || undefined"
      >
        <slot :name="`value-${item.term}`" :item="item">{{ shown(item.value) }}</slot>
      </dd>
    </div>
  </dl>
</template>
