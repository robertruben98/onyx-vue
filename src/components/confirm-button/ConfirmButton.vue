<script lang="ts">
import { ref } from "vue";

/**
 * Which confirm button is armed right now, page-wide.
 *
 * One at a time on purpose: two armed buttons on the same screen mean the
 * next click confirms whichever the pointer happens to land on, which is the
 * accident a two-step button is there to prevent. Arming one disarms the rest.
 */
const armedOwner = ref<symbol | null>(null);
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import { UiButton, type ButtonSize, type ButtonVariant } from "../button";
import "./confirm-button.scss";

/**
 * A button that asks twice before doing something that cannot be taken back —
 * publishing to GitHub, closing a PR, launching a paid run.
 *
 * The first activation only arms it: the label turns into the question and the
 * button takes the armed variant. The second, within `timeout`, emits
 * `confirmed`. It disarms by itself when the time runs out, on Esc, when focus
 * leaves it, and when another confirm button on the page is armed.
 *
 * This is not a dialog on purpose. A modal for every write turns a list of
 * twenty PRs into twenty interruptions; the question sits where the finger
 * already is.
 */
const props = withDefaults(
  defineProps<{
    /** Resting label: what the button does. */
    label: string;
    /** Label while armed: the question. */
    confirmLabel?: string;
    /** Announced to assistive tech when it arms. */
    armedHint?: string;
    /** Milliseconds it stays armed. */
    timeout?: number;
    /** Resting variant. */
    variant?: ButtonVariant;
    /** Variant while armed. */
    armedVariant?: ButtonVariant;
    /** Control size. */
    size?: ButtonSize;
    /** Disabled state; also disarms. */
    disabled?: boolean;
    /** Work in flight after confirming. */
    loading?: boolean;
  }>(),
  {
    confirmLabel: "confirm?",
    armedHint: "press again to confirm",
    timeout: 6000,
    variant: "secondary",
    armedVariant: "danger",
    size: "sm",
    disabled: false,
    loading: false,
  },
);

const emit = defineEmits<{
  /** First activation: the button is now asking. */
  armed: [];
  /** Went back to rest without confirming. */
  disarmed: [];
  /** Second activation within the timeout. */
  confirmed: [];
}>();

const me = Symbol("ui-confirm-button");
let timer: ReturnType<typeof setTimeout> | undefined;

const isArmed = computed(() => armedOwner.value === me);

function disarm(): void {
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (armedOwner.value === me) {
    armedOwner.value = null;
  }
}

function arm(): void {
  armedOwner.value = me;
  if (timer) clearTimeout(timer);
  timer = setTimeout(disarm, props.timeout);
  emit("armed");
}

function onClick(): void {
  if (props.disabled || props.loading) return;
  if (isArmed.value) {
    disarm();
    emit("confirmed");
  } else {
    arm();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && isArmed.value) {
    event.stopPropagation();
    disarm();
  }
}

function onFocusOut(event: FocusEvent): void {
  const root = event.currentTarget as HTMLElement | null;
  if (root && event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
  disarm();
}

// Every way of going back to rest — timeout, Esc, blur, another button taking
// the slot — runs through here, so `disarmed` fires exactly once each time.
watch(isArmed, (now, before) => {
  if (before && !now) {
    if (timer) clearTimeout(timer);
    timer = undefined;
    emit("disarmed");
  }
});

watch(
  () => props.disabled,
  (d) => {
    if (d) disarm();
  },
);

onBeforeUnmount(disarm);

defineExpose({ disarm });
</script>

<template>
  <span
    :class="['ui-confirm-button', { 'ui-confirm-button--armed': isArmed }]"
    @keydown="onKeydown"
    @focusout="onFocusOut"
  >
    <UiButton
      :variant="isArmed ? armedVariant : variant"
      :size="size"
      :disabled="disabled"
      :loading="loading"
      @clicked="onClick"
      >{{ isArmed ? confirmLabel : label }}</UiButton
    >
    <span class="ui-confirm-button__status" aria-live="polite">{{
      isArmed ? `${confirmLabel} — ${armedHint}` : ""
    }}</span>
  </span>
</template>
