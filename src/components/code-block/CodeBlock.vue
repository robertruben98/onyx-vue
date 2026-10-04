<script setup lang="ts">
import { canonicalTone } from "../../internal/tone";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { UiSpinner } from "../spinner";
import "./code-block.scss";

/**
 * Monospaced output in a box: an HTTP response, the tail of a log, a prompt.
 *
 * `followTail` is for logs, which are read from the end: the box scrolls to the
 * bottom when the text grows — but only if the reader was already at the
 * bottom. Someone who scrolled up to read an error keeps their place when the
 * next line arrives; yanking them down is how a log becomes unreadable.
 *
 * The box is focusable when it can scroll, so it can be scrolled with the
 * keyboard.
 */
const props = withDefaults(
  defineProps<{
    /** The text. */
    text?: string;
    /** Maximum height before it scrolls, e.g. `20rem`. */
    maxHeight?: string;
    /** Keeps the end in view while the reader is at the end. */
    followTail?: boolean;
    /** Wraps long lines instead of scrolling sideways. */
    wrap?: boolean;
    /** Shown while there is no text. */
    emptyText?: string;
    /** Shows a spinner instead of the text. */
    loading?: boolean;
    /** Accessible name of the box. */
    label?: string;
    /** Semantic tone of the text, e.g. `danger` for an error body. */
    /** `default` is the deprecated name of `neutral`. */
    tone?: "neutral" | "muted" | "danger" | "default";
  }>(),
  {
    text: "",
    maxHeight: "",
    followTail: false,
    wrap: true,
    emptyText: "",
    loading: false,
    label: "",
    tone: "neutral",
  },
);

/** El tono con los nombres antiguos (`ok`, `warn`, `default`) ya traducidos. */
const tone = computed(() => canonicalTone(props.tone));

const box = ref<HTMLElement | null>(null);
let pinned = true;

function atEnd(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 4;
}

function onScroll(): void {
  if (box.value) pinned = atEnd(box.value);
}

async function toEnd(): Promise<void> {
  await nextTick();
  if (box.value && props.followTail && pinned) box.value.scrollTop = box.value.scrollHeight;
}

watch(() => [props.text, props.loading], toEnd);
onMounted(toEnd);

const rootClasses = computed(() => ({
  "ui-code-block": true,
  "ui-code-block--nowrap": !props.wrap,
  [`ui-code-block--${tone.value}`]: tone.value !== "neutral",
}));

const rootStyle = computed(() => (props.maxHeight ? { maxHeight: props.maxHeight } : undefined));

defineExpose({
  /** Scrolls to the end and re-pins the box to it. */
  scrollToEnd(): void {
    pinned = true;
    void toEnd();
  },
});
</script>

<template>
  <pre
    ref="box"
    :class="rootClasses"
    :style="rootStyle"
    :role="label ? 'region' : undefined"
    :aria-label="label || undefined"
    :aria-busy="loading ? 'true' : undefined"
    tabindex="0"
    @scroll="onScroll"
  ><UiSpinner v-if="loading" size="sm" /><template v-else-if="text">{{ text }}</template><span
      v-else-if="emptyText"
      class="ui-code-block__empty"
    >{{ emptyText }}</span><slot v-else /></pre>
</template>
