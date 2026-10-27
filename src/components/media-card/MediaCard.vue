<script setup lang="ts">
import { computed, ref, useSlots, watch } from "vue";
import { avatarGradientIndex } from "../avatar/Avatar.vue";
import "./media-card.scss";

/**
 * A thing best known by its picture: a series by its poster, a book by its
 * cover, an album by its sleeve. The image leads at a fixed aspect ratio, so a
 * grid of them lines up whatever size each file is; the title, a subtitle, the
 * card's own details and its actions sit below.
 *
 * The image loads lazily — a grid of 150 posters fetches the ones on screen —
 * and a missing or broken one becomes the title's initials on the colour
 * gradient UiAvatar gives the same name, so the grid keeps its shape.
 */
const props = withDefaults(
  defineProps<{
    /** What the card is. Its heading, and the image's alt text unless `alt` says otherwise. */
    title: string;
    /** Image URL. Empty draws the initials placeholder. */
    src?: string;
    /** Alternative text of the image. Defaults to `title`; `""` marks it decorative. */
    alt?: string;
    /** A second line under the title: an original title, an author, a year. */
    subtitle?: string;
    /** Makes the title a link. */
    href?: string;
    /** `target` of the title link; `_blank` adds `rel="noopener"`. */
    target?: string;
    /** Width / height of the image box, as CSS `aspect-ratio`: `2 / 3` is a poster, `1` a sleeve, `16 / 9` a still. */
    ratio?: string;
    /** Heading element of the title, to fit the page's outline. */
    titleTag?: "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  }>(),
  {
    src: "",
    alt: undefined,
    subtitle: "",
    href: "",
    target: undefined,
    ratio: "2 / 3",
    titleTag: "h3",
  },
);

const slots = useSlots();

const failed = ref(false);
// A new image gets its own chance to load.
watch(() => props.src, () => { failed.value = false; });
const showImage = computed(() => !!props.src && !failed.value);

const altText = computed(() => props.alt ?? props.title);

const initials = computed(() => {
  const words = props.title.trim().split(/\s+/).filter((w) => /\w/.test(w));
  return words.slice(0, 2).map((w) => w.match(/\w/)?.[0] ?? "").join("").toUpperCase();
});
const gradient = computed(() => `ui-media-card__placeholder--gradient-${avatarGradientIndex(props.title)}`);

const rel = computed(() => (props.target === "_blank" ? "noopener" : undefined));
</script>

<template>
  <article class="ui-media-card">
    <div class="ui-media-card__media" :style="{ aspectRatio: ratio }">
      <img
        v-if="showImage"
        class="ui-media-card__image"
        :src="src"
        :alt="altText"
        loading="lazy"
        decoding="async"
        @error="failed = true"
      />
      <span
        v-else
        :class="['ui-media-card__placeholder', gradient]"
        :role="altText ? 'img' : undefined"
        :aria-label="altText || undefined"
        :aria-hidden="altText ? undefined : 'true'"
      ><span aria-hidden="true">{{ initials }}</span></span>
      <div v-if="slots.badges" class="ui-media-card__badges"><slot name="badges" /></div>
    </div>
    <div class="ui-media-card__body">
      <component :is="titleTag" class="ui-media-card__title">
        <a v-if="href" :href="href" :target="target" :rel="rel">{{ title }}</a>
        <template v-else>{{ title }}</template>
      </component>
      <p v-if="subtitle" class="ui-media-card__subtitle">{{ subtitle }}</p>
      <div v-if="slots.default" class="ui-media-card__details"><slot /></div>
    </div>
    <div v-if="slots.actions" class="ui-media-card__actions"><slot name="actions" /></div>
  </article>
</template>
