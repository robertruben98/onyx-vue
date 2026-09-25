<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "./toast-store";
import "./toast.scss";

/**
 * Where `useToast().show()` messages appear. Mount one per page.
 *
 * Two live regions and not one: a toast that says something failed is
 * `role="alert"` and interrupts, the rest are `role="status"` and wait their
 * turn. The regions are always in the DOM — a live region that is inserted
 * together with its text is not announced by most screen readers.
 */
withDefaults(
  defineProps<{
    /** Accessible name of the dismiss button on each toast. */
    dismissLabel?: string;
  }>(),
  { dismissLabel: "Dismiss" },
);

const { toasts, dismiss } = useToast();

const polite = computed(() => toasts.filter((t) => t.tone !== "danger"));
const assertive = computed(() => toasts.filter((t) => t.tone === "danger"));
</script>

<template>
  <Teleport to="body">
    <div class="ui-toast-host">
      <div role="alert" class="ui-toast-host__region">
        <div v-for="t in assertive" :key="t.id" class="ui-toast ui-toast--danger">
          <span class="ui-toast__message">{{ t.message }}</span>
          <button type="button" class="ui-toast__dismiss" :aria-label="dismissLabel" @click="dismiss(t.id)">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
      <div role="status" class="ui-toast-host__region">
        <div v-for="t in polite" :key="t.id" :class="['ui-toast', `ui-toast--${t.tone}`]">
          <span class="ui-toast__message">{{ t.message }}</span>
          <button type="button" class="ui-toast__dismiss" :aria-label="dismissLabel" @click="dismiss(t.id)">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
