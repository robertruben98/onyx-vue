<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref } from "vue";
import { useOnyxLocale } from "../../locale";
import { NAV_RAIL_KEY } from "./context";
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

const root = ref<HTMLElement | null>(null);
let observer: MutationObserver | null = null;

/**
 * Bring the active entry into view. The rail scrolls on its own (`height: 100vh`),
 * so on a short screen the entry the page loaded on can sit out of sight.
 * `nearest` makes it a no-op when the entry is already visible; the scroll is
 * never smooth, so `prefers-reduced-motion` is respected by construction.
 */
function scrollToActive(): void {
  const el = root.value?.querySelector<HTMLElement>('[aria-current="page"]');
  if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest" });
}
provide(NAV_RAIL_KEY, { scrollToActive });

onMounted(() => {
  scrollToActive();
  if (typeof MutationObserver !== "undefined" && root.value) {
    // The active entry changing means `aria-current` moved.
    observer = new MutationObserver(() => void nextTick(scrollToActive));
    observer.observe(root.value, { attributes: true, attributeFilter: ["aria-current"], subtree: true });
  }
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <nav
    ref="root"
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
