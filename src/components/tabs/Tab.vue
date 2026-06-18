<script setup lang="ts">
import { computed, inject, onBeforeUnmount } from "vue";
import { TABS_CONTEXT } from "./context";

withDefaults(
  defineProps<{
    /** Trigger label shown in the tab list. */
    label: string;
    /** Whether this tab is disabled. */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const tabs = inject(TABS_CONTEXT, null);

// The parent owns id assignment (in mount order) so panel ids line up with the
// slot-derived triggers. A standalone counter here would drift across renders
// and never match the trigger's `aria-controls`.
const handle = tabs?.register() ?? null;

const panelId = handle?.panelId ?? "";
const tabId = handle?.tabId ?? "";

onBeforeUnmount(() => handle?.unregister());

/** Whether this tab's panel is currently shown (driven by the parent). */
const active = computed(() => handle?.isActive() ?? false);
</script>

<template>
  <div
    role="tabpanel"
    :id="panelId"
    :aria-labelledby="tabId"
    :hidden="!active || undefined"
  >
    <slot />
  </div>
</template>
