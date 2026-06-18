<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
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
const emit = defineEmits<{ "toggle": [open: boolean] }>();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

let restoreFocusEl: HTMLElement | null = null;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusable(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === panel,
  );
}

function position(): void {
  const trigger = triggerRef.value;
  const panel = panelRef.value;
  if (!trigger || !panel) return;
  const r = trigger.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  let top = 0;
  let left = 0;
  switch (props.placement) {
    case "top":
      top = r.top - p.height;
      left = r.left;
      break;
    case "left":
      top = r.top;
      left = r.left - p.width;
      break;
    case "right":
      top = r.top;
      left = r.right;
      break;
    case "bottom":
    default:
      top = r.bottom;
      left = r.left;
      break;
  }
  panelStyle.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px` };
}

function toggle(): void {
  open.value = !open.value;
}

/** Close the popover programmatically. */
function close(): void {
  if (open.value) open.value = false;
}

function onBackdropClick(): void {
  close();
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }
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
  emit("toggle", isOpen);
  if (isOpen) {
    restoreFocusEl = document.activeElement as HTMLElement | null;
    nextTick(() => {
      position();
      // cdkTrapFocusAutoCapture + cdkFocusInitial: focus the panel, then first.
      const items = focusable();
      (items[0] ?? panelRef.value)?.focus();
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
    });
  } else {
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
    restoreFocusEl?.focus?.();
    restoreFocusEl = null;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", position);
  window.removeEventListener("scroll", position, true);
});

const rootClasses = computed(() => ({ "ui-popover": true }));

defineExpose({ open, close, toggle });
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
