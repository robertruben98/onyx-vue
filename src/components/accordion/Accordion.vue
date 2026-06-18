<script setup lang="ts">
import { provide } from "vue";
import {
  ACCORDION_HOST,
  type AccordionHost,
  type AccordionItemRef,
} from "./accordion-host";
import "./accordion.scss";

/**
 * Vertical stack of collapsible sections. Single-open by default; set `multi`
 * to allow several open at once. Projects `UiAccordionItem` children via the
 * default slot.
 */
const props = withDefaults(
  defineProps<{
    /** Allow multiple items to be expanded simultaneously. */
    multi?: boolean;
  }>(),
  { multi: false },
);

const items = new Set<AccordionItemRef>();

const host: AccordionHost = {
  register(item) {
    items.add(item);
  },
  unregister(item) {
    items.delete(item);
  },
  toggleItem(item) {
    const willExpand = !item.expanded.value;
    if (!props.multi && willExpand) {
      items.forEach((i) => {
        if (i !== item) i.expanded.value = false;
      });
    }
    item.expanded.value = willExpand;
  },
};

provide(ACCORDION_HOST, host);
</script>

<template>
  <div class="ui-accordion">
    <slot />
  </div>
</template>
