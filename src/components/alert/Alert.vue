<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, ref } from "vue";
import "./alert.scss";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "danger";
export type AlertAppearance = "boxed" | "band";
export type AlertLive = "polite" | "assertive" | "off";

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
    /**
     * How a screen reader announces the alert. `polite` is `role="status"`,
     * `assertive` is `role="alert"`, and `off` is a static `role="note"` for
     * hints that are on the page from the start and should not be announced.
     * Unset, it follows the variant: `danger` is assertive, the rest polite.
     */
    live?: AlertLive;
  }>(),
  {
    variant: "info",
    appearance: "boxed",
    title: "",
    dismissible: false,
    dismissLabel: () => useOnyxLocale().alertDismissLabel,
    live: undefined,
  },
);

/** Emitted when the alert is dismissed. */
const emit = defineEmits<{ dismissed: [] }>();

/** Whether the alert has been dismissed (drives [hidden]). */
const hidden = ref(false);

/** `live` decides; unset, danger -> assertive (alert) and others -> polite (status). */
const role = computed(() => {
  if (props.live === "off") return "note";
  if (props.live === "assertive") return "alert";
  if (props.live === "polite") return "status";
  return props.variant === "danger" ? "alert" : "status";
});

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
      <span class="ui-alert__icon" aria-hidden="true">
        <slot name="icon">
          <svg class="ui-alert__icon-svg" viewBox="0 0 24 24" focusable="false">
            <template v-if="variant === 'success'">
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12.5 2.8 2.8L16 9.5" />
            </template>
            <template v-else-if="variant === 'warning'">
              <path d="M12 3.5 21.5 20h-19z" />
              <path d="M12 10v4.5M12 17.4v.1" />
            </template>
            <template v-else-if="variant === 'danger'">
              <circle cx="12" cy="12" r="9" />
              <path d="m9 9 6 6M15 9l-6 6" />
            </template>
            <template v-else>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5M12 7.6v.1" />
            </template>
          </svg>
        </slot>
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
        <svg class="ui-alert__close-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  </div>
</template>
