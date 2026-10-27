<script setup lang="ts">
import { computed, inject } from "vue";
import { TABS_CONTEXT } from "./context";

const props = withDefaults(
  defineProps<{
    /** Trigger label shown in the tab list. */
    label: string;
    /** Whether this tab is disabled. */
    disabled?: boolean;
    /**
     * Position in the tab list. INTERNAL: `Tabs` puts it here.
     *
     * It is not a number this component can work out on its own. A counter
     * incremented on mount looks like the same thing and is not: it counts the
     * order in which the children APPEARED, and a list that grows while it is
     * on screen (a tab per result the run produces, say) mounts its children
     * in a different order than it lists them. From then on every trigger
     * opens somebody else's panel.
     */
    index?: number;
  }>(),
  {
    disabled: false,
    index: 0,
  },
);

const tabs = inject(TABS_CONTEXT, null);

const panelId = computed(() => `ui-tabpanel-${props.index}`);
const tabId = computed(() => `ui-tab-${props.index}`);

/** Whether this tab's panel is currently shown (driven by the parent). */
const active = computed(() => tabs?.isActive(props.index) ?? false);
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
