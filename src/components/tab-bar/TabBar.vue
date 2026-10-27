<script lang="ts">
/** One destination of the bar. */
export interface TabBarItem {
  /** Stable identity; `activeId` names one of these. */
  id: string;
  /** Visible name. */
  label: string;
  /** Where it goes. Rendered as a real link, so it opens in a new tab like any other. */
  href: string;
  /** A short glyph above the label (an emoji, a single character). Decorative. */
  icon?: string;
  /** How many things are waiting behind it: queued jobs, unread items. Hidden at 0. */
  count?: number | null;
  /** Something is running behind it right now. Takes precedence over `count`. */
  live?: boolean;
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import "./tab-bar.scss";

/**
 * The navigation a phone keeps under the thumb.
 *
 * A rail of ten links does not fit across a 360px screen, and stacked on top of
 * the page it pushes the content a full screen down. So under `hideAbove` the
 * first `visible` destinations sit in a bar fixed to the bottom and the rest go
 * behind "More", a sheet that opens upwards.
 *
 * The bar is router-agnostic: every entry is a real `<a href>`, and `itemClicked`
 * fires on a plain click so a single-page app can `preventDefault()` and push
 * the route itself. A click with a modifier key is left to the browser.
 */
const props = withDefaults(
  defineProps<{
    /** Every destination, in order. */
    items: TabBarItem[];
    /** The destination the page is showing. */
    activeId?: string;
    /** How many destinations sit in the bar before "More" takes the rest. */
    visible?: number;
    /** Name of the overflow button. */
    moreLabel?: string;
    /** Glyph of the overflow button. */
    moreIcon?: string;
    /** Accessible name of the navigation landmark. */
    label?: string;
    /**
     * Viewport width (px) from which the bar is not rendered at all: on a wide
     * screen the page has its own navigation. `0` renders it at every width.
     */
    hideAbove?: number;
    /** Spoken name of the `live` marker. */
    liveLabel?: string;
  }>(),
  {
    activeId: "",
    visible: 4,
    moreLabel: "More",
    moreIcon: "☰",
    label: "Main",
    hideAbove: 640,
    liveLabel: "running",
  },
);

const emit = defineEmits<{
  /** A plain click on a destination. Call `event.preventDefault()` to route it yourself. */
  itemClicked: [item: TabBarItem, event: MouseEvent];
}>();

const sheetId = `ui-tab-bar-sheet-${useId()}`;
const root = ref<HTMLElement | null>(null);
const moreButton = ref<HTMLButtonElement | null>(null);
const open = ref(false);
const shown = ref(props.hideAbove <= 0);
let query: MediaQueryList | null = null;

// Five slots fit; a sixth does not. When everything fits there is no "More":
// a menu holding one link is a link behind an extra tap.
const overflowing = computed(() => props.items.length > props.visible + 1);
const inBar = computed(() =>
  overflowing.value ? props.items.slice(0, props.visible) : props.items,
);
const inSheet = computed(() =>
  overflowing.value ? props.items.slice(props.visible) : [],
);
// When the page is one of the hidden destinations, "More" is where you are.
const moreActive = computed(() => inSheet.value.some((i) => i.id === props.activeId));

function onQuery(e: MediaQueryListEvent | MediaQueryList): void {
  shown.value = !e.matches;
}

function watchWidth(): void {
  query?.removeEventListener("change", onQuery);
  query = null;
  shown.value = true;
  if (props.hideAbove > 0 && typeof window !== "undefined" && window.matchMedia) {
    query = window.matchMedia(`(min-width: ${props.hideAbove}px)`);
    onQuery(query);
    query.addEventListener("change", onQuery);
  }
}

function onClick(item: TabBarItem, e: MouseEvent): void {
  open.value = false;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  emit("itemClicked", item, e);
}

function close(refocus: boolean): void {
  if (!open.value) return;
  open.value = false;
  if (refocus) moreButton.value?.focus();
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") close(true);
}
function onPointer(e: Event): void {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close(false);
}

// Read the width now, not on mount: the first render already has to know
// whether the bar exists, or a phone sees the page jump when it appears.
watchWidth();
watch(shown, (v) => { if (!v) open.value = false; });
watch(() => props.hideAbove, watchWidth);
watch(() => props.activeId, () => { open.value = false; });
onMounted(() => {
  document.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onPointer);
});
onBeforeUnmount(() => {
  query?.removeEventListener("change", onQuery);
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("pointerdown", onPointer);
});

const countText = (n: number | null | undefined): string =>
  n && n > 0 ? (n > 99 ? "99+" : String(n)) : "";
</script>

<template>
  <template v-if="shown">
    <!-- Holds the bar's height in the flow, so the end of the page is not under it. -->
    <div class="ui-tab-bar__spacer" aria-hidden="true" />
    <nav ref="root" class="ui-tab-bar" :aria-label="label">
      <ul v-if="open" :id="sheetId" class="ui-tab-bar__sheet">
        <li v-for="item in inSheet" :key="item.id">
          <a
            :href="item.href"
            class="ui-tab-bar__sheet-link"
            :class="{ 'ui-tab-bar__sheet-link--active': item.id === activeId }"
            :aria-current="item.id === activeId ? 'page' : undefined"
            @click="onClick(item, $event)"
          >
            <span>{{ item.label }}</span>
            <span v-if="item.live" class="ui-tab-bar__live" role="img" :aria-label="liveLabel" />
            <span v-else-if="countText(item.count)" class="ui-tab-bar__count">{{
              countText(item.count)
            }}</span>
          </a>
        </li>
      </ul>

      <ul class="ui-tab-bar__items">
        <li v-for="item in inBar" :key="item.id" class="ui-tab-bar__slot">
          <a
            :href="item.href"
            class="ui-tab-bar__item"
            :class="{ 'ui-tab-bar__item--active': item.id === activeId }"
            :aria-current="item.id === activeId ? 'page' : undefined"
            @click="onClick(item, $event)"
          >
            <span v-if="item.icon" class="ui-tab-bar__icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="ui-tab-bar__label">{{ item.label }}</span>
            <span v-if="item.live" class="ui-tab-bar__live" role="img" :aria-label="liveLabel" />
            <span v-else-if="countText(item.count)" class="ui-tab-bar__count">{{
              countText(item.count)
            }}</span>
          </a>
        </li>
        <li v-if="overflowing" class="ui-tab-bar__slot">
          <button
            ref="moreButton"
            type="button"
            class="ui-tab-bar__item"
            :class="{ 'ui-tab-bar__item--active': open || moreActive }"
            :aria-expanded="open ? 'true' : 'false'"
            :aria-controls="sheetId"
            @click="open = !open"
          >
            <span class="ui-tab-bar__icon" aria-hidden="true">{{ moreIcon }}</span>
            <span class="ui-tab-bar__label">{{ moreLabel }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </template>
</template>
