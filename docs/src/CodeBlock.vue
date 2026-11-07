<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

const props = defineProps<{ code: string }>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

/** Clipboard API where there is one, a hidden textarea where there is not (http, old webviews). */
async function write(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

async function copy() {
  try {
    await write(props.code);
  } catch {
    return;
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => (copied.value = false), 1600);
}
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="codeblock">
    <pre class="code" tabindex="0"><code>{{ code }}</code></pre>
    <button type="button" class="codeblock__copy" @click="copy">{{ copied ? "Copied" : "Copy" }}</button>
    <span class="codeblock__status" role="status">{{ copied ? "Code copied to the clipboard" : "" }}</span>
  </div>
</template>

<style scoped>
.codeblock {
  position: relative;
  margin: 0.75rem 0;
}
.code {
  margin: 0;
  padding: 0.9rem 4.5rem 0.9rem 0.9rem;
  overflow-x: auto;
  font-family: var(--docs-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.codeblock__copy {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  min-height: 1.75rem;
  padding: 0.15rem 0.6rem;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--ui-color-text-muted);
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
}
.codeblock__copy:hover {
  color: var(--ui-color-primary);
  border-color: var(--ui-color-primary);
}
.codeblock__status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
