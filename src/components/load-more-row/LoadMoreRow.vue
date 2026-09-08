<script setup lang="ts">
import { computed } from "vue";
import { UiButton } from "../button";
import "./load-more-row.scss";

const props = withDefaults(
  defineProps<{
    /** How many rows are still hidden. At zero or below the row does not render. */
    remaining: number;
    /** Overrides the generated label. */
    label?: string;
    /** Shows the button busy and suppresses further activation. */
    loading?: boolean;
  }>(),
  {
    label: "",
    loading: false,
  },
);

/** Emitted when the user asks for the rest. */
const emit = defineEmits<{ loadMore: [] }>();

/**
 * A row that offers to load nothing is worse than no row: it says the list is
 * truncated when it is complete.
 */
const visible = computed(() => props.remaining > 0);

const text = computed(() => props.label || `show the remaining ${props.remaining}`);
</script>

<template>
  <div v-if="visible" class="ui-load-more-row">
    <UiButton size="sm" variant="secondary" :loading="loading" @clicked="emit('loadMore')">
      {{ text }}
    </UiButton>
  </div>
</template>
