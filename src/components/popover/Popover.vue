<script setup lang="ts">
import { useOverlay } from "../../internal/useOverlay";
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, ref, watch } from "vue";
import "./popover.scss";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

const props = withDefaults(
  defineProps<{
    /** Preferred placement of the panel relative to the trigger. */
    placement?: PopoverPlacement;
    /** Accessible label for the popover dialog. */
    label?: string;
  }>(),
  {
    placement: "bottom",
    label: "",
  },
);

/**
 * Two-way open state (mirrors the Angular `open` signal). Defaults to closed.
 * Consumers can drive it with `v-model:open` or leave it uncontrolled.
 */
const open = defineModel<boolean>("open", { default: false });

/** Emitted whenever the open state changes (true = opened, false = closed). */
const emit = defineEmits<{
  toggled: [open: boolean];
  /** @deprecated Use `toggled`; still emitted until 1.0. */
  toggle: [open: boolean];
}>();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { style: panelStyle, close: closeOverlay, toggle: toggleOverlay, onBackdrop: onBackdropClick } = useOverlay({
  kind: "popover", open, trigger: triggerRef, panel: panelRef,
  placement: () => props.placement,
  onOpened: () => (focusable()[0] ?? panelRef.value)?.focus(),
});

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusable(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === panel,
  );
}

function toggle(): void {
  toggleOverlay();
}

/** Close the popover programmatically. */
function close(): void {
  closeOverlay();
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  // Hand-rolled focus trap.
  const items = focusable();
  if (items.length === 0) {
    event.preventDefault();
    panelRef.value?.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (event.shiftKey && (active === first || active === panelRef.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(open, (isOpen, was) => {
  if (isOpen === was) return;
  emit("toggled", isOpen);
  emit("toggle", isOpen); // obsoleto, ver src/deprecations.ts
});

const rootClasses = computed(() => ({ "ui-popover": true }));

defineExpose({ open, close, toggle });

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <span :class="rootClasses">
    <span
      ref="triggerRef"
      class="ui-popover__trigger"
      @click="toggle"
    >
      <slot name="trigger" :open="open" :toggle="toggle" :expanded="open" />
    </span>

    <Teleport to="body">
      <template v-if="open">
        <div class="ui-popover__backdrop" @click="onBackdropClick"></div>
        <div class="ui-popover__pane" :style="panelStyle">
          <div
            ref="panelRef"
            class="ui-popover__panel"
            role="dialog"
            tabindex="-1"
            :aria-label="label || undefined"
            @keydown="onPanelKeydown"
          >
            <slot name="content" :close="close" />
          </div>
        </div>
      </template>
    </Teleport>
  </span>
</template>
