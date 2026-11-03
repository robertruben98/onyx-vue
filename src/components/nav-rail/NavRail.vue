<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import "./nav-rail.scss";

withDefaults(
  defineProps<{
    /** Accessible name for the navigation region. */
    label?: string;
    /**
     * `default` is the console rail of labelled rows; `icons` is the 64 px strip of
     * round icon buttons of a messaging app (entries take an `icon`).
     */
    variant?: "default" | "icons";
  }>(),
  {
    label: () => useOnyxLocale().navRailLabel,
    variant: "default",
  },
);
</script>

<template>
  <nav
    class="ui-nav-rail"
    :class="{ 'ui-nav-rail--icons': variant === 'icons' }"
    :aria-label="label"
  >
    <slot />
    <!-- Icons variant: pinned to the bottom (settings, profile). -->
    <div v-if="$slots.footer" class="ui-nav-rail__footer">
      <slot name="footer" />
    </div>
  </nav>
</template>
