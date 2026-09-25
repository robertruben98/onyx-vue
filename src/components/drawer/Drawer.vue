<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import "./drawer.scss";

export type DrawerSide = "right" | "left";

/**
 * A modal side sheet: the detail of something picked from a list, opened over
 * the list without leaving it.
 *
 * It is a dialog in everything but shape — `role="dialog"`, `aria-modal`,
 * focus moved in on open, trapped while open and handed back to the trigger on
 * close, Esc and the backdrop close it — because a sheet that covers half the
 * page and lets Tab wander behind it is the bug this component exists to stop
 * rewriting.
 *
 * The body is the only part that scrolls. The heading, the toolbar (usually a
 * row of tabs) and the footer stay put, so the controls that act on what you
 * are reading never scroll away from it.
 */
const props = withDefaults(
  defineProps<{
    /** Heading text; labels the drawer via `aria-labelledby`. */
    heading?: string;
    /** Secondary line under the heading. */
    subheading?: string;
    /** Accessible name used when there is no `heading`. */
    ariaLabel?: string;
    /** Accessible name of the close button. */
    closeLabel?: string;
    /** Whether Esc closes the drawer. */
    closeOnEsc?: boolean;
    /** Whether a click on the backdrop closes the drawer. */
    closeOnBackdrop?: boolean;
    /** Edge the sheet slides in from. */
    side?: DrawerSide;
    /** Sheet width; never wider than the viewport. */
    width?: string;
  }>(),
  {
    heading: "",
    subheading: "",
    ariaLabel: "",
    closeLabel: "Close",
    closeOnEsc: true,
    closeOnBackdrop: true,
    side: "right",
    width: "",
  },
);

/** Open state. Two-way bindable via `v-model:open`. */
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  /** Emitted after the drawer is attached and focus moved into it. */
  opened: [];
  /** Emitted after the drawer is closed and focus handed back. */
  closed: [];
}>();

const uid = useId();
const headingId = `ui-drawer-title-${uid}`;

const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const hasHeading = computed(() => !!props.heading);

const panelClasses = computed(() => ({
  "ui-drawer__panel": true,
  "ui-drawer__panel--left": props.side === "left",
}));

const panelStyle = computed(() => (props.width ? { width: props.width } : undefined));

function close(): void {
  open.value = false;
}

function onBackdrop(event: MouseEvent): void {
  if (event.target === event.currentTarget && props.closeOnBackdrop) close();
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusable(): HTMLElement[] {
  const root = panel.value;
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.closeOnEsc) {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const items = focusable();
  if (items.length === 0) {
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
  } else if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  open,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      nextTick(() => {
        // The panel itself, not its first button: the first focusable thing in
        // a sheet is usually a tab or the close button, and landing on either
        // would read that control out instead of the sheet's name.
        panel.value?.focus();
        emit("opened");
      });
    } else if (!isOpen && wasOpen) {
      previouslyFocused?.focus();
      previouslyFocused = null;
      emit("closed");
    }
  },
  { immediate: true },
);

defineExpose({ close });
</script>

<template>
  <div class="ui-drawer">
    <Teleport to="body">
      <div v-if="open" class="ui-drawer__backdrop" @click="onBackdrop">
        <div
          ref="panel"
          :class="panelClasses"
          :style="panelStyle"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="hasHeading ? headingId : undefined"
          :aria-label="hasHeading ? undefined : ariaLabel || undefined"
          @keydown="onKeydown"
        >
          <div class="ui-drawer__header">
            <div class="ui-drawer__titles">
              <h2 v-if="heading" :id="headingId" class="ui-drawer__title">{{ heading }}</h2>
              <slot name="heading" />
              <p v-if="subheading" class="ui-drawer__subtitle">{{ subheading }}</p>
            </div>
            <button type="button" class="ui-drawer__close" :aria-label="closeLabel" @click="close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div v-if="$slots.toolbar" class="ui-drawer__toolbar"><slot name="toolbar" /></div>
          <div class="ui-drawer__body"><slot /></div>
          <div v-if="$slots.footer" class="ui-drawer__footer"><slot name="footer" /></div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
