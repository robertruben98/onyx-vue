<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { diffFileStats, parseUnifiedDiff, type DiffFile, type DiffHunk, type DiffLine } from "./parse-diff";
import "./diff-view.scss";

/**
 * A unified diff, one block per file, read-only.
 *
 * Each file has a header that folds it (the path, `+N −M`, an optional
 * subject) and its hunks with both line numbers. The view owns nothing about
 * what a line *means* to the page: a page that comments on lines puts its
 * button in `#line-actions` and its comment or editor in `#line-after`, and the
 * diff underneath stays the same one every other page shows.
 *
 * Big diffs: every line is a plain row with no per-line state, and each hunk is
 * laid out only when it scrolls near the screen (`content-visibility: auto`),
 * so a 2000-line diff costs its DOM nodes and not their layout.
 */
const props = withDefaults(
  defineProps<{
    /** A unified diff as text. Ignored when `files` is given. */
    diff?: string;
    /** Files already parsed. Wins over `diff`. */
    files?: DiffFile[] | null;
    /** Start with every file folded. */
    collapsed?: boolean;
    /** Show the old and new line numbers. */
    lineNumbers?: boolean;
    /** Accessible name of the whole diff. */
    label?: string;
    /** Shown when there are no files. */
    emptyText?: string;
    /** Shown inside a binary file. */
    binaryText?: string;
  }>(),
  {
    diff: "",
    files: null,
    collapsed: false,
    lineNumbers: true,
    label: "Diff",
    emptyText: "No changes",
    binaryText: "Binary file",
  },
);

const emit = defineEmits<{
  /** A file was folded (`open` false) or unfolded. */
  toggled: [file: DiffFile, open: boolean];
}>();

defineSlots<{
  /** At the end of a line, shown on hover and on focus within it. */
  "line-actions"?: (props: { file: DiffFile; hunk: DiffHunk; line: DiffLine }) => unknown;
  /** Under a line, full width: a comment, an editor. */
  "line-after"?: (props: { file: DiffFile; hunk: DiffHunk; line: DiffLine }) => unknown;
  /** In a file's header, after the stats and outside the fold button. */
  "file-actions"?: (props: { file: DiffFile }) => unknown;
  /** Replaces the empty text. */
  empty?: () => unknown;
}>();

const parsed = computed<DiffFile[]>(() => props.files ?? (props.diff ? parseUnifiedDiff(props.diff) : []));

const uid = `ui-diff-view-${useId()}`;

/** The files, keyed by position and path: two patches can touch the same path. */
const entries = computed(() =>
  parsed.value.map((file, i) => ({ file, key: `${i}:${file.file}`, stats: diffFileStats(file), bodyId: `${uid}-${i}` })),
);

const folded = ref(new Set<string>());

// A new diff starts from `collapsed` again: the fold state of the old one
// pointed at files that may not be there any more.
watch(
  () => [entries.value.map((e) => e.key).join("\n"), props.collapsed] as const,
  () => {
    folded.value = new Set(props.collapsed ? entries.value.map((e) => e.key) : []);
  },
  { immediate: true },
);

function isOpen(key: string): boolean {
  return !folded.value.has(key);
}

function toggle(key: string, file: DiffFile): void {
  const next = new Set(folded.value);
  const open = next.has(key);
  if (open) next.delete(key);
  else next.add(key);
  folded.value = next;
  emit("toggled", file, open);
}

const SIGN = { add: "+", del: "-", ctx: " " } as const;

function statsLabel(s: { added: number; removed: number }): string {
  return `${s.added} added, ${s.removed} removed`;
}
</script>

<template>
  <section v-if="entries.length" class="ui-diff-view" :aria-label="label">
    <section
      v-for="e in entries"
      :key="e.key"
      class="ui-diff-view__file"
      :class="{ 'ui-diff-view__file--folded': !isOpen(e.key) }"
      :aria-label="e.file.file"
    >
      <header class="ui-diff-view__header">
        <button
          type="button"
          class="ui-diff-view__toggle"
          :aria-expanded="isOpen(e.key)"
          :aria-controls="e.bodyId"
          @click="toggle(e.key, e.file)"
        >
          <span class="ui-diff-view__chevron" aria-hidden="true" />
          <code class="ui-diff-view__path">{{ e.file.file }}</code>
        </button>
        <span class="ui-diff-view__stats" :aria-label="statsLabel(e.stats)" role="img">
          <span class="ui-diff-view__stat--add" aria-hidden="true">+{{ e.stats.added }}</span> <span class="ui-diff-view__stat--del" aria-hidden="true">−{{ e.stats.removed }}</span>
        </span>
        <span v-if="e.file.subject" class="ui-diff-view__subject">{{ e.file.subject }}</span>
        <span v-if="$slots['file-actions']" class="ui-diff-view__file-actions">
          <slot name="file-actions" :file="e.file" />
        </span>
      </header>
      <div v-show="isOpen(e.key)" :id="e.bodyId" class="ui-diff-view__body">
        <p v-if="e.file.binary" class="ui-diff-view__note">{{ binaryText }}</p>
        <div v-for="(h, j) in e.file.hunks" :key="j" class="ui-diff-view__hunk">
          <div class="ui-diff-view__line ui-diff-view__line--hunk">
            <template v-if="lineNumbers">
              <span class="ui-diff-view__num" aria-hidden="true" /><span class="ui-diff-view__num" aria-hidden="true" />
            </template>
            <span class="ui-diff-view__text">{{ h.header }}</span>
          </div>
          <template v-for="(l, k) in h.lines" :key="k">
            <div class="ui-diff-view__line" :class="`ui-diff-view__line--${l.kind}`">
              <template v-if="lineNumbers">
                <span class="ui-diff-view__num">{{ l.old ?? "" }}</span><span class="ui-diff-view__num">{{ l.new ?? "" }}</span>
              </template>
              <span class="ui-diff-view__text"><span class="ui-diff-view__sign">{{ SIGN[l.kind] }}</span>{{ l.text }}</span>
              <span v-if="$slots['line-actions']" class="ui-diff-view__actions">
                <slot name="line-actions" :file="e.file" :hunk="h" :line="l" />
              </span>
            </div>
            <slot name="line-after" :file="e.file" :hunk="h" :line="l" />
          </template>
        </div>
      </div>
    </section>
  </section>
  <p v-else class="ui-diff-view__empty">
    <slot name="empty">{{ emptyText }}</slot>
  </p>
</template>
