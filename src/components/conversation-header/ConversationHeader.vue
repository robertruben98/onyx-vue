<script setup lang="ts">
import { computed } from "vue";
import { UiAvatar } from "../avatar";
import "./conversation-header.scss";

/**
 * The header of an open conversation: a 64 px bar with a leading slot (the
 * back arrow on a phone), the avatar, the name with a subtitle stacked under
 * it, and an actions slot on the right. It sits on top of the wallpaper with a
 * soft shadow instead of a border line.
 */
const props = withDefaults(
  defineProps<{
    /** Contact or group name. Rendered as the heading. */
    name?: string;
    /** Line under the name: "online", a member list, "Message yourself". */
    subtitle?: string;
    /** Avatar image URL; without it the avatar shows initials. */
    avatarSrc?: string;
    /** Initials on a gradient picked from the name. */
    avatarGradient?: boolean;
    /** Heading level of the name; `0` renders plain text. */
    headingLevel?: 0 | 1 | 2 | 3;
  }>(),
  { name: "", subtitle: "", avatarSrc: "", avatarGradient: true, headingLevel: 2 },
);

const nameTag = computed(() => (props.headingLevel === 0 ? "span" : `h${props.headingLevel}`));
</script>

<template>
  <header class="ui-conversation-header">
    <div v-if="$slots.leading" class="ui-conversation-header__leading"><slot name="leading" /></div>
    <div class="ui-conversation-header__avatar">
      <slot name="avatar">
        <UiAvatar :src="avatarSrc" :name="name" size="md" :gradient="avatarGradient" />
      </slot>
    </div>
    <div class="ui-conversation-header__text">
      <slot name="title">
        <component :is="nameTag" v-if="name" class="ui-conversation-header__name">{{ name }}</component>
      </slot>
      <slot name="subtitle">
        <span v-if="subtitle" class="ui-conversation-header__subtitle">{{ subtitle }}</span>
      </slot>
    </div>
    <div v-if="$slots.actions" class="ui-conversation-header__actions"><slot name="actions" /></div>
  </header>
</template>
