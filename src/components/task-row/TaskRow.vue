<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { UiCheckbox } from "../checkbox";
import { UiSpinner } from "../spinner";
import "./task-row.scss";

const props = withDefaults(
  defineProps<{
    /** Task text; it is the checkbox's accessible name. */
    text: string;
    /** Done: text struck through and dimmed. */
    done?: boolean;
    /** Secondary line, e.g. "Robert · OpenID-Payment-Seguridad · hace 2 h". */
    meta?: string;
    /** Request in flight: checkbox disabled, spinner shown. */
    busy?: boolean;
    disabled?: boolean;
  }>(),
  { done: false, meta: undefined, busy: false, disabled: false },
);

const emit = defineEmits<{ toggle: [next: boolean] }>();

const inactive = computed(() => props.busy || props.disabled);
const metaId = `ui-task-row-meta-${nextTaskRowId++}`;

const root = ref<HTMLElement | null>(null);

// The row is controlled by `done`: the browser flips the native box on click, so once the
// parent has had its chance to update `done` (next tick) the box is forced back to the prop.
function onChange(next: boolean): void {
  if (!inactive.value) emit("toggle", next);
  void nextTick(() => {
    const input = root.value?.querySelector<HTMLInputElement>("input[type=checkbox]");
    if (input) input.checked = props.done;
  });
}
</script>

<script lang="ts">
let nextTaskRowId = 0;
</script>

<template>
  <div ref="root" :class="['ui-task-row', { 'ui-task-row--done': done, 'ui-task-row--busy': busy }]" :aria-busy="busy ? 'true' : undefined">
    <UiCheckbox
      class="ui-task-row__check"
      :model-value="done"
      :label="text"
      :disabled="inactive"
      :aria-describedby="meta ? metaId : undefined"
      @update:model-value="onChange"
    />
    <UiSpinner v-if="busy" class="ui-task-row__spinner" size="sm" />
    <span v-if="meta" :id="metaId" class="ui-task-row__meta">{{ meta }}</span>
  </div>
</template>
