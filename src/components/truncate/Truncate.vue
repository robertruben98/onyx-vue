<script setup lang="ts">
import { computed } from "vue";
import "./truncate.scss";

const props = withDefaults(
  defineProps<{
    /** The text, which is also the default tooltip. */
    text: string;
    /** Lines to keep before clamping. */
    lines?: number;
    /** Overrides the tooltip when the full text is not the useful thing to show. */
    title?: string;
  }>(),
  {
    lines: 1,
    title: "",
  },
);

const single = computed(() => props.lines <= 1);

const rootClasses = computed(() => ({
  "ui-truncate": true,
  "ui-truncate--single": single.value,
  "ui-truncate--clamped": !single.value,
}));

const rootStyle = computed(() =>
  single.value ? undefined : { "--ui-truncate-lines": String(props.lines) },
);
</script>

<template>
  <span :class="rootClasses" :style="rootStyle" :title="title || text">{{ text }}</span>
</template>
