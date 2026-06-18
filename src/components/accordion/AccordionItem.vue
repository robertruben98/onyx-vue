<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { ACCORDION_HOST, type AccordionItemRef } from "./accordion-host";
import "./accordion-item.scss";

let nextItemId = 0;

/**
 * A single collapsible section. Renders a header button (`aria-expanded` +
 * `aria-controls`) and a `role=region` panel. Coordinated by `UiAccordion`.
 */
const props = withDefaults(
  defineProps<{
    /** Header text. */
    heading: string;
    /** Whether the item is disabled. */
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const host = inject(ACCORDION_HOST, null);

/** Expanded state (managed by the parent accordion). */
const expanded = ref(false);

const selfRef: AccordionItemRef = { expanded };

const uid = nextItemId++;
const headerId = `ui-accordion-header-${uid}`;
const panelId = `ui-accordion-panel-${uid}`;

onMounted(() => host?.register(selfRef));
onBeforeUnmount(() => host?.unregister(selfRef));

function toggle(): void {
  if (props.disabled) return;
  host?.toggleItem(selfRef);
}
</script>

<template>
  <div
    class="ui-accordion-item"
    :class="{ 'ui-accordion-item--expanded': expanded }"
  >
    <h3 class="ui-accordion-item__heading">
      <button
        type="button"
        class="ui-accordion-item__trigger"
        :id="headerId"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="toggle"
      >
        <span class="ui-accordion-item__label">{{ heading }}</span>
        <span class="ui-accordion-item__icon" aria-hidden="true">›</span>
      </button>
    </h3>
    <div
      class="ui-accordion-item__panel"
      role="region"
      :id="panelId"
      :aria-labelledby="headerId"
      :hidden="!expanded"
    >
      <div class="ui-accordion-item__body"><slot /></div>
    </div>
  </div>
</template>
