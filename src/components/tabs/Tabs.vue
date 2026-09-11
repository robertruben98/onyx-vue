<script setup lang="ts">
import { cloneVNode, computed, provide, ref, useSlots, type VNode } from "vue";
import "./tabs.scss";
import { TABS_CONTEXT, type TabRegistration, type TabsContext } from "./context";
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
  const nodes = tabNodes();
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

const context: TabsContext = {
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

/**
 * The panels, each one carrying ITS OWN position in the list.
 *
 * This is the whole point: triggers and panels are numbered from the same
 * array, in the same pass, so there is no second numbering that can drift from
 * the first. The child used to work out its own index with a counter that went
 * up on mount, which matches the slot order only while the list is fixed. Add
 * a tab to a list already on screen — a console that grows a tab per kind of
 * result the run produces — and the newcomer mounts LAST while it is listed in
 * the middle: from there on, every trigger after it opened the wrong panel,
 * silently and with the right label on top.
 *
 * It is a function and not a `computed` on purpose: caching vnodes buys
 * nothing here and a stale entry would be a panel showing the previous run.
 */
function panels(): VNode[] {
  return tabNodes().map((vnode, index) =>
    cloneVNode(vnode, { index, key: vnode.key ?? `ui-tabpanel-${index}` }),
  );
}

/** The `Tab` children of the default slot, in slot order. */
function tabNodes(): VNode[] {
  return flattenTabs(slots.default?.() ?? []);
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
      <component :is="panel" v-for="panel in panels()" :key="panel.key ?? 0" />
    </div>
  </div>
</template>
