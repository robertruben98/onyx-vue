<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import "./nav-rail.scss";

withDefaults(
  defineProps<{
    /** Accessible name for the navigation region. */
    label?: string;
  }>(),
  {
    label: () => useOnyxLocale().navRailLabel,
  },
);
</script>

<template>
  <nav class="ui-nav-rail" :aria-label="label">
    <slot />
  </nav>
</template>
