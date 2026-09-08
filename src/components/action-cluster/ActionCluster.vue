<script setup lang="ts">
import { computed } from "vue";
import "./action-cluster.scss";

const props = withDefaults(
  defineProps<{
    /** Accessible name for the group of actions. */
    label: string;
    /**
     * Dim until hovered or focused. Turn it off for a cluster that is not
     * inside a dense list.
     */
    quiet?: boolean;
    /**
     * Force the revealed state — for a row the consumer knows is selected or
     * under the keyboard cursor.
     */
    revealed?: boolean;
  }>(),
  {
    quiet: true,
    revealed: false,
  },
);

const rootClasses = computed(() => ({
  "ui-action-cluster": true,
  "ui-action-cluster--quiet": props.quiet && !props.revealed,
}));
</script>

<template>
  <div :class="rootClasses" role="group" :aria-label="label">
    <slot />
  </div>
</template>
