<script setup lang="ts">
import { computed } from "vue";
import UiAvatar from "../avatar/Avatar.vue";
import UiBadge from "../badge/Badge.vue";
import { useOnyxLocale } from "../../locale";
import "./chat-list-item.scss";

export type ChatListItemTagTone = "neutral" | "danger" | "success";

const props = withDefaults(
  defineProps<{
    /** Chat name. */
    title: string;
    /** Last message, cut to one line with an ellipsis. */
    preview?: string;
    /** Time of the last message, already formatted. */
    time?: string;
    /** Unread messages. 0 (or unset) shows no badge. */
    unread?: number;
    /** Short mark of the channel the chat comes from, e.g. "WA" or "RC". */
    source?: string;
    /** Label under the preview, e.g. "#ordenes". */
    tag?: string;
    /** Colour of the tag. */
    tagTone?: ChatListItemTagTone;
    /** The chat open in the conversation pane. */
    selected?: boolean;
    /** Initials shown in the avatar. Defaults to the ones of `title`. */
    avatarText?: string;
    /** Text the avatar colour is picked from; the same seed is always the same colour. Defaults to `title`. */
    avatarSeed?: string;
  }>(),
  {
    preview: "",
    time: "",
    unread: 0,
    source: "",
    tag: "",
    tagTone: "neutral",
    selected: false,
    avatarText: "",
    avatarSeed: "",
  },
);

const emit = defineEmits<{ select: [] }>();

const badgeVariant = computed(() => props.tagTone);

// Avatar derives initials from a name; letters of avatarText become "words" so
// "BS" stays "BS".
const avatarName = computed(() =>
  props.avatarText ? [...props.avatarText.trim()].slice(0, 2).join(" ") : props.title,
);

const messages = useOnyxLocale();
const unreadLabel = computed(() => messages.chatListItemUnread.replace("{n}", String(props.unread)));
const unreadText = computed(() => (props.unread > 99 ? "99+" : String(props.unread)));
</script>

<template>
  <button
    type="button"
    :class="['ui-chat-list-item', { 'ui-chat-list-item--selected': selected, 'ui-chat-list-item--unread': unread > 0 }]"
    :aria-current="selected ? 'true' : undefined"
    @click="emit('select')"
  >
    <UiAvatar
      :name="avatarName"
      :alt="''"
      tone="tinted"
      size="lg"
      :seed="avatarSeed || title"
      class="ui-chat-list-item__avatar"
    />
    <span class="ui-chat-list-item__body">
      <span class="ui-chat-list-item__row">
        <span class="ui-chat-list-item__title">{{ title }}</span>
        <span v-if="source" class="ui-chat-list-item__source">{{ source }}</span>
        <span v-if="time" class="ui-chat-list-item__time">{{ time }}</span>
      </span>
      <span class="ui-chat-list-item__row">
        <span class="ui-chat-list-item__preview">{{ preview }}</span>
        <span v-if="unread > 0" class="ui-chat-list-item__unread">
          <span aria-hidden="true">{{ unreadText }}</span>
          <span class="ui-chat-list-item__sr">{{ unreadLabel }}</span>
        </span>
      </span>
      <span v-if="tag" class="ui-chat-list-item__tag"><UiBadge :variant="badgeVariant" class="ui-chat-list-item__tag-chip">{{ tag }}</UiBadge></span>
    </span>
  </button>
</template>
