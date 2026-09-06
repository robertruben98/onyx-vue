<script setup lang="ts">
import { computed, ref } from "vue";
import "./alert.scss";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "danger";
export type AlertAppearance = "boxed" | "band";

const props = withDefaults(
  defineProps<{
    /** Visual variant (semantic role). */
    variant?: AlertVariant;
    /**
     * Layout. `boxed` is a self-contained card; `band` is full-bleed, square,
     * and separated from what follows by a rule — the console pages' notice.
     * Orthogonal to `variant`, which stays semantic.
     */
    appearance?: AlertAppearance;
    /** Optional bold title rendered above the content. */
    title?: string;
    /** Whether a dismiss (close) button is shown. */
    dismissible?: boolean;
    /** Accessible name for the dismiss button. */
    dismissLabel?: string;
  }>(),
  {
    variant: "info",
    appearance: "boxed",
    title: "",
    dismissible: false,
    dismissLabel: "Dismiss",
  },
);

/** Emitted when the alert is dismissed. */
const emit = defineEmits<{ dismissed: [] }>();

/** Whether the alert has been dismissed (drives [hidden]). */
const hidden = ref(false);

/** danger -> assertive (alert); others -> polite (status). */
const role = computed(() => (props.variant === "danger" ? "alert" : "status"));

const rootClasses = computed(() => ({
  "ui-alert": true,
  "ui-alert--neutral": props.variant === "neutral",
  "ui-alert--info": props.variant === "info",
  "ui-alert--success": props.variant === "success",
  "ui-alert--warning": props.variant === "warning",
  "ui-alert--danger": props.variant === "danger",
  "ui-alert--boxed": props.appearance === "boxed",
  "ui-alert--band": props.appearance === "band",
}));

function dismiss(): void {
  hidden.value = true;
  emit("dismissed");
}
</script>

<template>
  <div :class="rootClasses" :hidden="hidden || undefined">
    <div class="ui-alert__el" :role="role">
      <span v-if="$slots.icon" class="ui-alert__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
      <div class="ui-alert__body">
        <p v-if="title" class="ui-alert__title">{{ title }}</p>
        <div class="ui-alert__content"><slot /></div>
      </div>
      <span v-if="$slots.action" class="ui-alert__action">
        <slot name="action" />
      </span>
      <button
        v-if="dismissible"
        type="button"
        class="ui-alert__close"
        :aria-label="dismissLabel"
        @click="dismiss"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>
