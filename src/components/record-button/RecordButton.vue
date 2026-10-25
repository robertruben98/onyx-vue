<script setup lang="ts">
import { computed } from "vue";
import "./record-button.scss";

export type RecordButtonSize = "md" | "lg";

/**
 * The big record toggle of a voice answer: idle, recording and busy.
 *
 * It is a toggle button: `aria-pressed` is true while recording, so a screen
 * reader says "Record my answer, toggle button, pressed" instead of relying on
 * the red colour. Recording pulses (a static halo under reduced motion); busy
 * shows a spinner and sets `aria-busy` while the recording is processed.
 *
 * The level meter and the timer go in the `meter` and `detail` slots. Both are
 * hidden from assistive tech: a name that changes every second or with every
 * syllable is noise; announce what matters (time nearly up, nothing heard)
 * from a status region instead.
 */
const props = withDefaults(
  defineProps<{
    /** Recording right now. Drives `aria-pressed` and the recording look. */
    recording?: boolean;
    /** Processing the recording: spinner, `aria-busy`, not activatable. */
    busy?: boolean;
    /** Not activatable. */
    disabled?: boolean;
    /** Visible label and accessible name. */
    label?: string;
    /** Visible label while recording (e.g. "Stop"). Defaults to `label`. */
    recordingLabel?: string;
    /** Visible label while busy (e.g. "Transcribing…"). Defaults to `label`. */
    busyLabel?: string;
    /** `lg` (56px, the main action of a screen) or `md` (a control tall). */
    size?: RecordButtonSize;
    /** Full width of the container. */
    block?: boolean;
  }>(),
  {
    recording: false,
    busy: false,
    disabled: false,
    label: "Record",
    recordingLabel: undefined,
    busyLabel: undefined,
    size: "lg",
    block: false,
  },
);

/** Emitted on activation with the state the button is moving TO. */
const emit = defineEmits<{ toggled: [recording: boolean] }>();

const text = computed(() => {
  if (props.busy) return props.busyLabel ?? props.label;
  if (props.recording) return props.recordingLabel ?? props.label;
  return props.label;
});

const rootClasses = computed(() => ({
  "ui-record-button": true,
  "ui-record-button--recording": props.recording && !props.busy,
  "ui-record-button--busy": props.busy,
  "ui-record-button--md": props.size === "md",
  "ui-record-button--block": props.block,
}));

function activate(): void {
  if (props.busy || props.disabled) return;
  emit("toggled", !props.recording);
}
</script>

<template>
  <button
    type="button"
    :class="rootClasses"
    :aria-pressed="recording ? 'true' : 'false'"
    :aria-busy="busy ? 'true' : undefined"
    :disabled="disabled || busy"
    @click="activate"
  >
    <span v-if="busy" class="ui-record-button__spinner" aria-hidden="true"></span>
    <span v-else class="ui-record-button__icon" aria-hidden="true">
      <slot name="icon" :recording="recording">
        <svg v-if="recording" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
        <svg v-else viewBox="0 0 24 24" class="ui-record-button__mic">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
        </svg>
      </slot>
    </span>
    <span class="ui-record-button__label">{{ text }}</span>
    <span v-if="$slots.detail" class="ui-record-button__detail" aria-hidden="true"><slot name="detail" /></span>
    <span v-if="$slots.meter && recording && !busy" class="ui-record-button__meter" aria-hidden="true"
      ><slot name="meter"
    /></span>
  </button>
</template>
