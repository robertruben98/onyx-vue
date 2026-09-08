<script setup lang="ts">
import "./nav-rail.scss";

withDefaults(
  defineProps<{
    /** Accessible name for the navigation region. */
    label?: string;
  }>(),
  {
    label: "Sections",
  },
);
</script>

<template>
  <nav class="ui-nav-rail" :aria-label="label">
    <slot />
  </nav>
</template>
