<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useOnyxLocale } from "../../locale";
import "./message-bubble.scss";

export type MessageBubbleDirection = "in" | "out";
export type MessageBubbleVariant = "message" | "draft" | "context";

const props = withDefaults(
  defineProps<{
    /** `in` aligns to the start, `out` to the end. */
    direction: MessageBubbleDirection;
    /** Sender name, shown in groups and rooms. */
    author?: string;
    /** Time of the message, already formatted. */
    time: string;
    /** `draft` is a suggestion not sent yet; `context` is older, dimmed and smaller. */
    variant?: MessageBubbleVariant;
    /** First bubble of a run: renders the WhatsApp tail on the outer top corner and squares that corner. */
    tail?: boolean;
    /** Only for `draft`: shows a copy button that copies this text. */
    copyText?: string;
    /** Label of the copy button. Defaults to the locale catalog ("Copy", "Copiar" in Spanish). */
    copyLabel?: string;
  }>(),
  {
    author: "",
    variant: undefined,
    tail: false,
    copyText: "",
    copyLabel: () => useOnyxLocale().messageBubbleCopyLabel,
  },
);
const slots = useSlots();
const kind = computed<MessageBubbleVariant>(() => props.variant ?? "message");

// The time rides inline at the end of the text (spacer technique) when the bubble is a plain text
// message; with meta lines, a footer, a copy button or no text it sits in its own bottom row.
const inlineTime = computed(
  () => !!slots.default && !slots.meta && !slots.footer && !(kind.value === "draft" && props.copyText),
);

const emit = defineEmits<{ copied: [] }>();

async function copy() {
  try {
    await navigator.clipboard.writeText(props.copyText);
  } catch {
    return; // nothing was copied, so nothing is announced
  }
  emit("copied");
}
</script>

<template>
  <div
    :class="['ui-message-bubble', `ui-message-bubble--${direction}`, `ui-message-bubble--${kind}`, { 'ui-message-bubble--tail': tail }]"
    :data-direction="direction"
    :data-variant="kind"
  >
    <svg
      v-if="tail"
      class="ui-message-bubble__tail"
      viewBox="0 0 8 13"
      width="8"
      height="13"
      aria-hidden="true"
      focusable="false"
    >
      <path class="ui-message-bubble__tail-shadow" d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z" />
      <path fill="currentColor" d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z" />
    </svg>
    <span v-if="author" class="ui-message-bubble__author">{{ author }}</span>
    <div v-if="slots.media" class="ui-message-bubble__media"><slot name="media" /></div>
    <div v-if="slots.default" class="ui-message-bubble__text">
      <span class="ui-message-bubble__content"><slot /></span>
      <template v-if="inlineTime">
        <span class="ui-message-bubble__spacer" aria-hidden="true">{{ time }}</span>
        <span class="ui-message-bubble__time ui-message-bubble__time--inline">{{ time }}</span>
      </template>
    </div>
    <div v-if="slots.meta" class="ui-message-bubble__meta"><slot name="meta" /></div>
    <div v-if="slots.footer" class="ui-message-bubble__footer"><slot name="footer" /></div>
    <div v-if="!inlineTime" class="ui-message-bubble__bottom">
      <button
        v-if="kind === 'draft' && copyText"
        type="button"
        class="ui-message-bubble__copy"
        @click="copy"
      >
        {{ copyLabel }}
      </button>
      <span class="ui-message-bubble__time">{{ time }}</span>
    </div>
  </div>
</template>
