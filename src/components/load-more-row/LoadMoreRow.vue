<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed } from "vue";
import { UiButton } from "../button";
import "./load-more-row.scss";

const messages = useOnyxLocale();

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
const emit = defineEmits<{
  loadMoreRequested: [];
  /** @deprecated Use `loadMoreRequested`; still emitted until 1.0. */
  loadMore: [];
}>();

/**
 * A row that offers to load nothing is worse than no row: it says the list is
 * truncated when it is complete.
 */
const visible = computed(() => props.remaining > 0);

const text = computed(() => props.label || messages.loadMoreRowLabel.replace("{n}", String(props.remaining)));

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <div v-if="visible" class="ui-load-more-row">
    <UiButton size="sm" variant="secondary" :loading="loading" @clicked="(emit('loadMoreRequested'), emit('loadMore'))">
      {{ text }}
    </UiButton>
  </div>
</template>
