<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import "./dialog.scss";

export type DialogSize = "sm" | "md" | "lg";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** Heading text; labels the dialog via `aria-labelledby`. */
    heading?: string;
    /** Accessible name used when no `heading` is provided. */
    ariaLabel?: string;
    /** Accessible name for the close button. */
    closeLabel?: string;
    /** Whether pressing Esc closes the dialog. */
    closeOnEsc?: boolean;
    /** Whether clicking the backdrop closes the dialog. */
    closeOnBackdrop?: boolean;
    /** Panel size. */
    size?: DialogSize;
  }>(),
  {
    heading: "",
    ariaLabel: "",
    closeLabel: "Close",
    closeOnEsc: true,
    closeOnBackdrop: true,
    size: "md",
  },
);

/** Open state. Two-way bindable via `v-model:open`. */
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  /** Emitted after the dialog is attached. */
  opened: [];
  /** Emitted after the dialog is detached. */
  closed: [];
}>();

/** Stable id wiring the title to `aria-labelledby`. */
const headingId = `ui-dialog-title-${nextId++}`;

const panel = ref<HTMLElement | null>(null);
// Element to restore focus to when the dialog closes.
let previouslyFocused: HTMLElement | null = null;

const panelClasses = computed(() => ({
  "ui-dialog__panel": true,
  "ui-dialog__panel--sm": props.size === "sm",
  "ui-dialog__panel--lg": props.size === "lg",
}));

const labelledBy = computed(() => (props.heading ? headingId : undefined));
const ariaLabelAttr = computed(() =>
  !props.heading ? props.ariaLabel || undefined : undefined,
);

function close(): void {
  open.value = false;
}

function onBackdropPointer(event: MouseEvent): void {
  // Only a click on the backdrop itself (not bubbling from the panel) closes.
  if (event.target === event.currentTarget && props.closeOnBackdrop) {
    close();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.closeOnEsc) {
    event.preventDefault();
    close();
    return;
  }
  if (event.key === "Tab") {
    trapTab(event);
  }
}

// --- Hand-rolled focus trap (no deps; mirrors CDK cdkTrapFocus autoCapture) --
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusable(): HTMLElement[] {
  const root = panel.value;
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function trapTab(event: KeyboardEvent): void {
  const items = focusable();
  if (items.length === 0) {
    // Keep focus on the panel itself.
    event.preventDefault();
    panel.value?.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey) {
    if (active === first || active === panel.value || !panel.value?.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function captureInitialFocus(): void {
  const items = focusable();
  if (items.length > 0) {
    items[0].focus();
  } else {
    panel.value?.focus();
  }
}

watch(
  open,
  (isOpen, wasOpen) => {
    // `wasOpen` is undefined on the immediate (initial) run; treat the
    // dialog mounted already-open the same as a false -> true transition so
    // focus capture and the `opened` event still fire.
    if (isOpen && !wasOpen) {
      previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      nextTick(() => {
        captureInitialFocus();
        emit("opened");
      });
    } else if (!isOpen && wasOpen) {
      // Restore focus to the trigger that opened the dialog.
      previouslyFocused?.focus();
      previouslyFocused = null;
      emit("closed");
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="ui-dialog">
    <Teleport to="body">
      <div
        v-if="open"
        class="ui-dialog__backdrop"
        @click="onBackdropPointer"
      >
        <div
          ref="panel"
          :class="panelClasses"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="labelledBy"
          :aria-label="ariaLabelAttr"
          @keydown="onKeydown"
        >
          <div class="ui-dialog__header">
            <h2 v-if="heading" class="ui-dialog__title" :id="headingId">
              {{ heading }}
            </h2>
            <button
              type="button"
              class="ui-dialog__close"
              :aria-label="closeLabel"
              @click="close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="ui-dialog__body">
            <slot />
          </div>

          <div class="ui-dialog__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
