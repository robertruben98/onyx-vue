<script setup lang="ts">
import { computed, inject, nextTick, provide, ref, useId, watch } from "vue";
import { UiTriStateCount, type TriStateTone } from "../tri-state-count";
import { NAV_RAIL_GROUP_KEY, NAV_RAIL_KEY } from "./context";
import "./nav-rail.scss";

const props = withDefaults(
  defineProps<{
    /** Heading for the group. */
    label: string;
    /** The heading becomes a button that folds the group's entries. */
    collapsible?: boolean;
    /**
     * Key under which the open state is kept in `localStorage` (used as is, so
     * prefix it if the origin is shared). Storage that is blocked or throws is
     * ignored: the group still renders and folds.
     */
    storageKey?: string;
    /** What is waiting inside, shown on the heading only while the group is folded. */
    count?: number | null;
    /** Semantic tone of that count. */
    countTone?: TriStateTone;
  }>(),
  {
    collapsible: false,
    storageKey: "",
    count: null,
    countTone: "neutral",
  },
);

/** Whether the entries are shown (`v-model:open`, open by default). */
const open = defineModel<boolean>("open", { default: true });

const rail = inject(NAV_RAIL_KEY, null);
const bodyId = `ui-nav-rail-group-${useId()}`;

function readStored(): boolean | null {
  if (!props.storageKey) return null;
  try {
    const v = window.localStorage.getItem(props.storageKey);
    return v === "1" ? true : v === "0" ? false : null;
  } catch {
    return null;
  }
}
function writeStored(v: boolean): void {
  if (!props.storageKey) return;
  try {
    window.localStorage.setItem(props.storageKey, v ? "1" : "0");
  } catch {
    /* storage blocked or full: the state just is not remembered */
  }
}

if (props.collapsible) {
  const stored = readStored();
  if (stored !== null && stored !== open.value) open.value = stored;
}

// Entries tell the group when they are the active one, so a folded group that
// holds the page you are on opens by itself. Their DOM stays mounted while
// folded (`v-show`), which is what lets them report.
const activeIds = ref(new Set<symbol>());
const hasActive = computed(() => activeIds.value.size > 0);
provide(NAV_RAIL_GROUP_KEY, {
  reportActive(id, active) {
    const next = new Set(activeIds.value);
    if (active) next.add(id);
    else next.delete(id);
    activeIds.value = next;
  },
});

watch(
  hasActive,
  (has) => {
    if (props.collapsible && has && !open.value) {
      open.value = true;
      void nextTick(() => rail?.scrollToActive());
    }
  },
  { flush: "sync" },
);

watch(open, (v) => {
  if (props.collapsible) writeStored(v);
});

const showCount = computed(() => props.collapsible && !open.value && props.count !== null);

function toggle(): void {
  open.value = !open.value;
}
</script>

<template>
  <div class="ui-nav-rail__group" :class="{ 'ui-nav-rail__group--folded': collapsible && !open }">
    <div class="ui-nav-rail__group-head">
      <button
        v-if="collapsible"
        type="button"
        class="ui-nav-rail__group-toggle"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="bodyId"
        @click="toggle"
      >
        <span class="ui-nav-rail__group-chevron" aria-hidden="true" />
        <span class="ui-nav-rail__group-label">{{ label }}</span>
        <UiTriStateCount
          v-if="showCount"
          class="ui-nav-rail__group-count"
          :value="count"
          :tone="countTone"
          :label="label"
        />
      </button>
      <span v-else class="ui-nav-rail__group-label">{{ label }}</span>
      <!--
        El control del grupo vive en su cabecera y no encima del rail: lo que
        ordena es esta lista, y ponerlo mas arriba lo desliga de lo que cambia.
      -->
      <slot name="trailing" />
    </div>
    <div v-if="collapsible" v-show="open" :id="bodyId" class="ui-nav-rail__group-body">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>
