<script lang="ts">
/** One level of the trail. */
export interface BreadcrumbItem {
  /** What the level is called. */
  label: string;
  /** Where it goes. The last item is the current page and is never a link. */
  href?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "./breadcrumb.scss";

/**
 * Where the page sits: "servicios / SM23 / api-core".
 *
 * Levels with an `href` are real links, so middle-click and "open in new tab"
 * keep working. An app that routes in the client listens to `navigated` and
 * calls `preventDefault()` on the event it receives — the link stays a link
 * for everything else.
 */
const props = withDefaults(
  defineProps<{
    /** The trail, from the root to the current page. */
    items: BreadcrumbItem[];
    /** Accessible name of the navigation landmark. */
    label?: string;
    /** Separator glyph between levels. */
    separator?: string;
  }>(),
  { label: "Breadcrumb", separator: "/" },
);

const emit = defineEmits<{
  /** A linked level was activated. */
  navigated: [item: BreadcrumbItem, index: number, event: MouseEvent];
}>();

const lastIndex = computed(() => props.items.length - 1);
</script>

<template>
  <nav class="ui-breadcrumb" :aria-label="label">
    <ol class="ui-breadcrumb__list">
      <li v-for="(item, i) in items" :key="`${i}-${item.label}`" class="ui-breadcrumb__item">
        <a
          v-if="item.href && i !== lastIndex"
          class="ui-breadcrumb__link"
          :href="item.href"
          @click="emit('navigated', item, i, $event)"
          >{{ item.label }}</a
        >
        <span
          v-else
          :class="['ui-breadcrumb__text', { 'ui-breadcrumb__text--current': i === lastIndex }]"
          :aria-current="i === lastIndex ? 'page' : undefined"
          >{{ item.label }}</span
        >
        <span v-if="i !== lastIndex" class="ui-breadcrumb__sep" aria-hidden="true">{{ separator }}</span>
      </li>
    </ol>
  </nav>
</template>
