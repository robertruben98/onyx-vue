<script setup lang="ts">
import { computed, provide, ref, useSlots, type VNode } from "vue";
import "./tabs.scss";
import {
  TABS_CONTEXT,
  type TabHandle,
  type TabRegistration,
  type TabsContext,
} from "./context";
import Tab from "./Tab.vue";

withDefaults(
  defineProps<{
    /** Accessible label for the tab list. */
    ariaLabel?: string;
  }>(),
  {
    ariaLabel: "",
  },
);

/** Selected tab index. Two-way bindable via `v-model:selectedIndex`. */
const selectedIndex = defineModel<number>("selectedIndex", { default: 0 });

const slots = useSlots();

/**
 * Derive the tab triggers directly from the default slot's `Tab` children.
 *
 * Reading the slot vnodes (instead of relying on async provide/inject
 * registration from the children) makes the tablist correct on the *first*
 * render, mirroring Angular's `contentChildren` which resolves synchronously.
 * With async registration the parent only re-rendered on the next tick, so the
 * spec's synchronous role queries saw an empty tablist — the root cause of all
 * 7 failures.
 */
const tabs = computed<TabRegistration[]>(() => {
  const nodes = flattenTabs(slots.default?.() ?? []);
  return nodes.map((vnode, uid) => {
    const tabProps = (vnode.props ?? {}) as {
      label?: string;
      disabled?: boolean | "";
    };
    return {
      uid,
      label: ref(tabProps.label ?? ""),
      // `disabled` may arrive as a real boolean or as a valueless boolean attr
      // (`disabled` -> `""`); both mean disabled.
      disabled: ref(tabProps.disabled === "" || tabProps.disabled === true),
      tabId: `ui-tab-${uid}`,
      panelId: `ui-tabpanel-${uid}`,
    } satisfies TabRegistration;
  });
});

// Mount-order counter. `Tab` children run their setup in slot order, so this
// index matches the slot-derived trigger index — keeping panel ids aligned
// with the triggers' `aria-controls`.
let mountIndex = 0;

const context: TabsContext = {
  register(): TabHandle {
    const index = mountIndex++;
    return {
      index,
      tabId: `ui-tab-${index}`,
      panelId: `ui-tabpanel-${index}`,
      isActive: () => index === selectedIndex.value,
      unregister: () => {},
    };
  },
  isActive(index) {
    return index === selectedIndex.value;
  },
};

provide(TABS_CONTEXT, context);

const trigger = ref<HTMLButtonElement[]>([]);

function select(index: number): void {
  if (tabs.value[index]?.disabled.value) return;
  selectedIndex.value = index;
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const last = tabs.value.length - 1;
  let target: number | null = null;
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      target = nextEnabled(index, 1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      target = nextEnabled(index, -1);
      break;
    case "Home":
      target = nextEnabled(-1, 1);
      break;
    case "End":
      target = nextEnabled(last + 1, -1);
      break;
    default:
      return;
  }
  if (target === null) return;
  event.preventDefault();
  selectedIndex.value = target;
  trigger.value[target]?.focus();
}

/** First enabled index walking `step` from `from` (exclusive), wrapping. */
function nextEnabled(from: number, step: number): number | null {
  const list = tabs.value;
  const n = list.length;
  if (!n) return null;
  for (let k = 1; k <= n; k++) {
    const i = (((from + step * k) % n) + n) % n;
    if (!list[i].disabled.value) return i;
  }
  return null;
}

/** Collect the `Tab` vnodes from the slot, flattening fragments/arrays. */
function flattenTabs(nodes: VNode[]): VNode[] {
  const out: VNode[] = [];
  for (const node of nodes) {
    if (node.type === Tab) {
      out.push(node);
    } else if (Array.isArray(node.children)) {
      out.push(...flattenTabs(node.children as VNode[]));
    }
  }
  return out;
}
</script>

<template>
  <div class="ui-tabs">
    <div class="ui-tabs__list" role="tablist" :aria-label="ariaLabel || undefined">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.tabId"
        ref="trigger"
        type="button"
        role="tab"
        class="ui-tabs__tab"
        :class="{ 'ui-tabs__tab--active': i === selectedIndex }"
        :id="tab.tabId"
        :aria-selected="i === selectedIndex"
        :aria-controls="tab.panelId"
        :tabindex="i === selectedIndex ? 0 : -1"
        :disabled="tab.disabled.value"
        @click="select(i)"
        @keydown="onKeydown($event, i)"
      >
        {{ tab.label.value }}
      </button>
    </div>
    <div class="ui-tabs__panels">
      <slot />
    </div>
  </div>
</template>
