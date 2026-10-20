<script lang="ts">
/** How an action turned out. */
export type LogResult = "ok" | "error" | "pending";

/** One entry of the activity log. */
export interface LogLine {
  /** Already formatted by the consumer — the log does not own a clock. */
  time: string;
  /** What was attempted. */
  action: string;
  /** How it turned out. */
  result?: LogResult;
  /** What came back. Falls back to the result when absent. */
  detail?: string;
}
</script>

<script setup lang="ts">
import "./log-lines.scss";

withDefaults(
  defineProps<{
    /** The entries, newest first. */
    lines: LogLine[];
    /** Shown when nothing has happened yet. */
    emptyText?: string;
    /** Accessible name for the list. */
    label?: string;
  }>(),
  {
    emptyText: "(no activity recorded)",
    label: "Activity",
  },
);
</script>

<template>
  <!--
    An ordered list, because the order is the content: these entries are
    newest-first and reading them in any other order tells a different story.
  -->
  <ol v-if="lines.length" class="ui-log-lines" :aria-label="label">
    <li v-for="(line, index) in lines" :key="index" class="ui-log-lines__line">
      <span class="ui-log-lines__time">{{ line.time }}</span>
      <span class="ui-log-lines__action">{{ line.action }}</span>
      <span
        :class="[
          'ui-log-lines__result',
          `ui-log-lines__result--${line.result ?? 'pending'}`,
        ]"
        >{{ line.detail || line.result || "" }}</span
      >
    </li>
  </ol>
  <p v-else class="ui-log-lines__empty">{{ emptyText }}</p>
</template>
