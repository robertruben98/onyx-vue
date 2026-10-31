<script lang="ts">
export type ProfileHeaderVariant = "plain" | "card";
</script>

<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, useId } from "vue";
import { UiAvatar, type AvatarRingTone, type AvatarSize } from "../avatar";
import "./profile-header.scss";

/**
 * The identity hero of a profile page: the avatar on the left, the name as a
 * heading, a subtitle (the course, with a flag through `#subtitle`), actions,
 * and a row of 2–4 compact stats under it (`#stats`: UiStatCard `size="sm"`,
 * or plain items).
 *
 * It answers to its own width, not the viewport's (a container query): under
 * 26rem the avatar, name and actions stack and centre, so it fits a 360px phone
 * and a narrow column alike. The stats take two columns there and share the row
 * when there is room.
 *
 * The avatar can carry a progress ring (the level, say): the `ring*` props pass
 * through to UiAvatar.
 */
const props = withDefaults(
  defineProps<{
    /** The person's name. Rendered as the heading. */
    name: string;
    /** Heading level of the name. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** One line under the name. The `#subtitle` slot replaces it. */
    subtitle?: string;
    /** Avatar image; initials (on a gradient, by default) when missing or broken. */
    avatarSrc?: string;
    avatarSize?: AvatarSize;
    /** Initials on the name's gradient instead of the neutral fill. */
    avatarGradient?: boolean;
    /** Progress ring around the avatar (see UiAvatar `ringValue`). `null` draws none. */
    ringValue?: number | null;
    ringMax?: number;
    ringTone?: AvatarRingTone;
    ringGradient?: boolean;
    /** Accessible name of the ring; unset, the ring is decorative. */
    ringLabel?: string;
    /** `plain` sits on the page; `card` has a surface, radius and padding. */
    variant?: ProfileHeaderVariant;
    /** Accessible name of the stats group. */
    statsLabel?: string;
  }>(),
  {
    headingLevel: 2,
    subtitle: "",
    avatarSrc: "",
    avatarSize: "xl",
    avatarGradient: true,
    ringValue: null,
    ringMax: 100,
    ringTone: "primary",
    ringGradient: false,
    ringLabel: "",
    variant: "plain",
    statsLabel: () => useOnyxLocale().profileHeaderStatsLabel,
  },
);

const headingId = `ui-profile-header-${useId()}`;
const heading = computed(() => `h${props.headingLevel}`);
</script>

<template>
  <div :class="['ui-profile-header', `ui-profile-header--${variant}`]">
    <div class="ui-profile-header__identity">
      <div class="ui-profile-header__avatar">
        <slot name="avatar">
          <!-- The name is the heading right beside it: the avatar would only repeat it. -->
          <UiAvatar
            :name="name"
            alt=""
            :src="avatarSrc"
            :size="avatarSize"
            :gradient="avatarGradient"
            :ring-value="ringValue"
            :ring-max="ringMax"
            :ring-tone="ringTone"
            :ring-gradient="ringGradient"
            :ring-label="ringLabel"
          />
        </slot>
      </div>
      <div class="ui-profile-header__text">
        <component :is="heading" :id="headingId" class="ui-profile-header__name">{{ name }}</component>
        <p v-if="$slots.subtitle || subtitle" class="ui-profile-header__subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="ui-profile-header__actions"><slot name="actions" /></div>
    </div>
    <div v-if="$slots.stats" class="ui-profile-header__stats" role="group" :aria-label="statsLabel">
      <slot name="stats" />
    </div>
  </div>
</template>
