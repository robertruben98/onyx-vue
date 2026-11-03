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
    /** Only for `draft`: shows a copy button that copies this text. */
    copyText?: string;
    /** Label of the copy button. Defaults to the locale catalog ("Copy", "Copiar" in Spanish). */
    copyLabel?: string;
  }>(),
  {
    author: "",
    variant: undefined,
    copyText: "",
    copyLabel: () => useOnyxLocale().messageBubbleCopyLabel,
  },
);
const kind = computed<MessageBubbleVariant>(() => props.variant ?? "message");

const emit = defineEmits<{ copied: [] }>();
const slots = useSlots();

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
    :class="['ui-message-bubble', `ui-message-bubble--${direction}`, `ui-message-bubble--${kind}`]"
    :data-direction="direction"
    :data-variant="kind"
  >
    <span v-if="author" class="ui-message-bubble__author">{{ author }}</span>
    <div v-if="slots.media" class="ui-message-bubble__media"><slot name="media" /></div>
    <div v-if="slots.default" class="ui-message-bubble__text"><slot /></div>
    <div v-if="slots.meta" class="ui-message-bubble__meta"><slot name="meta" /></div>
    <div v-if="slots.footer" class="ui-message-bubble__footer"><slot name="footer" /></div>
    <div class="ui-message-bubble__bottom">
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
