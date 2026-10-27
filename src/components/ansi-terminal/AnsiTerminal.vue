<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ansiClasses, createAnsiParser, type AnsiParser } from "./ansi";
import "./ansi-terminal.scss";

/**
 * The raw output of another program, coloured as it meant it: a model
 * session, a build, a test run. Live while the program runs.
 *
 * It only ever APPENDS. Output grows line by line, and repainting the whole
 * pane on every poll costs O(session) each time — three megabytes of markup
 * every second and a half on a long session. When `lines` grows, only the new
 * tail is parsed (continuing the SGR state the previous tail left open) and
 * added to the DOM. When `lines` is replaced by something that is not an
 * extension of what is shown — another session — the pane starts over.
 *
 * The text goes in through `textContent`, never as markup: this is output of
 * a program that read pull-request comments, and a comment can say anything.
 *
 * It is a `log` region with announcements off: a model streaming a thousand
 * lines would otherwise read every one of them aloud.
 *
 * `follow` keeps the end in view as output arrives. It is a model because the
 * reader decides it (a "follow" checkbox next to the pane).
 */
const props = withDefaults(
  defineProps<{
    /** The output, one entry per line. Append to it; do not rewrite it. */
    lines?: string[];
    /** The program is still running: shows a blinking caret at the end. */
    live?: boolean;
    /** Maximum height before it scrolls. */
    maxHeight?: string;
    /** Accessible name of the pane. */
    label?: string;
    /** Shown while there is no output. */
    emptyText?: string;
  }>(),
  {
    lines: () => [],
    live: false,
    maxHeight: "",
    label: "Terminal output",
    emptyText: "",
  },
);

/** Keeps the end in view as output arrives (`v-model:follow`). */
const follow = defineModel<boolean>("follow", { default: true });

const pane = ref<HTMLElement | null>(null);
const out = ref<HTMLElement | null>(null);
let parser: AnsiParser = createAnsiParser();
let shownLines: string[] = [];

function appendText(text: string): void {
  const host = out.value;
  if (!host || !text) return;
  const frag = document.createDocumentFragment();
  for (const seg of parser.feed(text)) {
    const cls = ansiClasses(seg);
    if (!cls.length) {
      frag.appendChild(document.createTextNode(seg.text));
    } else {
      const span = document.createElement("span");
      span.className = cls.join(" ");
      span.textContent = seg.text;
      frag.appendChild(span);
    }
  }
  host.appendChild(frag);
}

function isExtension(next: string[], prev: string[]): boolean {
  if (next.length < prev.length) return false;
  // Comparing the last shown line is enough to tell "grew" from "replaced";
  // comparing all of them would be the O(session) cost this avoids.
  return prev.length === 0 || next[prev.length - 1] === prev[prev.length - 1];
}

function scrollIfFollowing(): void {
  if (follow.value && pane.value) pane.value.scrollTop = pane.value.scrollHeight;
}

function sync(next: string[]): void {
  if (!out.value) return;
  if (!isExtension(next, shownLines)) {
    out.value.textContent = "";
    parser = createAnsiParser();
    shownLines = [];
  }
  const fresh = next.slice(shownLines.length);
  if (fresh.length) {
    appendText((shownLines.length ? "\n" : "") + fresh.join("\n"));
    shownLines = next.slice();
  }
  scrollIfFollowing();
}

onMounted(() => sync(props.lines));
watch(() => props.lines, (next) => sync(next), { deep: false });
// A mutated-in-place array keeps its identity; its length still changes.
watch(() => props.lines.length, () => sync(props.lines));
watch(follow, (on) => {
  if (on) scrollIfFollowing();
});

const isEmpty = computed(() => props.lines.length === 0);
const paneStyle = computed(() => (props.maxHeight ? { maxHeight: props.maxHeight } : undefined));

defineExpose({
  /** The plain text shown, escapes removed. */
  text: () => out.value?.textContent ?? "",
});
</script>

<template>
  <pre
    ref="pane"
    class="ui-ansi-terminal"
    :style="paneStyle"
    role="log"
    aria-live="off"
    :aria-label="label"
    :aria-busy="live ? 'true' : undefined"
    tabindex="0"
  ><span ref="out" class="ui-ansi-terminal__out" /><span
      v-if="isEmpty && emptyText"
      class="ui-ansi-terminal__empty"
    >{{ emptyText }}</span><span v-if="live" class="ui-ansi-terminal__caret" aria-hidden="true" /></pre>
</template>
