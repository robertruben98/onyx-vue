<script setup lang="ts">
import { computed } from "vue";
import { useToast, type ToastMessage } from "./toast-store";
import "./toast.scss";

/**
 * Where `useToast().show()` messages appear. Mount one per page.
 *
 * Two live regions and not one: a toast that says something failed is
 * `role="alert"` and interrupts, the rest are `role="status"` and wait their
 * turn. The regions are always in the DOM — a live region that is inserted
 * together with its text is not announced by most screen readers.
 *
 * A toast holds still while focus or the pointer is inside it, so its action
 * ("Undo") can be reached with the keyboard without the toast timing out
 * under it. When a button of the toast closes it, focus goes back to where it
 * came from instead of falling to the top of the page.
 */
withDefaults(
  defineProps<{
    /** Accessible name of the dismiss button on each toast. */
    dismissLabel?: string;
  }>(),
  { dismissLabel: "Dismiss" },
);

const { toasts, dismiss, pause, resume, act } = useToast();

const polite = computed(() => toasts.filter((t) => t.tone !== "danger"));
const assertive = computed(() => toasts.filter((t) => t.tone === "danger"));

const regions = computed(() => [
  { role: "alert", items: assertive.value },
  { role: "status", items: polite.value },
]);

/** Toasts held by focus and by the pointer; a toast resumes when both leave. */
const focused = new Set<number>();
const hovered = new Set<number>();
/** Where focus came from when it entered a toast, to give it back on close. */
const returnTo = new Map<number, HTMLElement>();

function hold(set: Set<number>, id: number): void {
  set.add(id);
  pause(id);
}

function release(set: Set<number>, id: number): void {
  set.delete(id);
  if (!focused.has(id) && !hovered.has(id)) resume(id);
}

function onFocusIn(t: Readonly<ToastMessage>, event: FocusEvent): void {
  const from = event.relatedTarget;
  const box = event.currentTarget as HTMLElement;
  if (from instanceof HTMLElement && !box.contains(from) && !returnTo.has(t.id)) returnTo.set(t.id, from);
  hold(focused, t.id);
}

function onFocusOut(t: Readonly<ToastMessage>, event: FocusEvent): void {
  const box = event.currentTarget as HTMLElement;
  if (event.relatedTarget instanceof Node && box.contains(event.relatedTarget)) return;
  returnTo.delete(t.id);
  release(focused, t.id);
}

/** Closes a toast from one of its own buttons, then gives focus back. */
function close(t: Readonly<ToastMessage>, run: (id: number) => void): void {
  const target = returnTo.get(t.id);
  focused.delete(t.id);
  hovered.delete(t.id);
  returnTo.delete(t.id);
  run(t.id);
  if (target?.isConnected) target.focus();
}
</script>

<template>
  <Teleport to="body">
    <div class="ui-toast-host">
      <div v-for="region in regions" :key="region.role" :role="region.role" class="ui-toast-host__region">
        <div
          v-for="t in region.items"
          :key="t.id"
          :class="['ui-toast', `ui-toast--${t.tone}`]"
          @focusin="onFocusIn(t, $event)"
          @focusout="onFocusOut(t, $event)"
          @mouseenter="hold(hovered, t.id)"
          @mouseleave="release(hovered, t.id)"
        >
          <span class="ui-toast__message">{{ t.message }}</span>
          <button v-if="t.action" type="button" class="ui-toast__action" @click="close(t, act)">
            {{ t.action.label }}
          </button>
          <button type="button" class="ui-toast__dismiss" :aria-label="dismissLabel" @click="close(t, dismiss)">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
