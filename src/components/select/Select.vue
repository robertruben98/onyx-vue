<script setup lang="ts">
import { useOverlay } from "../../internal/useOverlay";
import { useOnyxLocale } from "../../locale";
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./select.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** Available options. */
    options?: SelectOption[];
    /** Placeholder shown when nothing is selected. */
    placeholder?: string;
    /** Accessible name for the combobox (placeholder fallback only without a field label). */
    ariaLabel?: string;
    /**
     * Id of an element that names the combobox, e.g. the label of a
     * `UiFieldRow`. Wins over `ariaLabel`: a visible label is the better name.
     */
    ariaLabelledby?: string;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: () => useOnyxLocale().selectPlaceholder,
    ariaLabel: "",
    ariaLabelledby: "",
    disabled: false,
  },
);

/** Two-way bound selected value (Vue equivalent of ControlValueAccessor). */
const model = defineModel<string | null>({ default: null });

/** Emitted whenever the user picks an option. */
const emit = defineEmits<{
  changed: [value: string | null];
  /** @deprecated Use `changed`; still emitted until 1.0. */
  change: [value: string | null];
}>();

const uid = useId();

// Los atributos del consumidor van al elemento nativo, no a la envoltura
// (ver internal/forward-attrs.ts).
defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs, controlId, fieldLabelId } = useForwardedAttrs(undefined, { field: true });
const listboxId = `ui-select-listbox-${uid}`;

const open = ref(false);
const activeIndex = ref(-1);

const triggerEl = ref<HTMLButtonElement | null>(null);
const listboxEl = ref<HTMLUListElement | null>(null);
const { style: paneStyle, close, onBackdrop } = useOverlay({
  kind: "select", open, trigger: triggerEl, panel: listboxEl,
  onOpened: () => {
    listboxEl.value?.focus();
    scrollActiveIntoView();
  },
});

const moreAbove = ref(false);
const moreBelow = ref(false);
let resizeObserver: ResizeObserver | undefined;

function updateScrollHints(): void {
  const list = listboxEl.value;
  moreAbove.value = !!list && list.scrollTop > 1;
  moreBelow.value = !!list && list.scrollHeight - list.clientHeight - list.scrollTop > 1;
}

// Scroll only the list, not the dialog or page containing the trigger.
function scrollActiveIntoView(): void {
  const list = listboxEl.value;
  const option = list?.children[activeIndex.value] as HTMLElement | undefined;
  if (list && option) {
    const bounds = list.getBoundingClientRect();
    const item = option.getBoundingClientRect();
    const top = bounds.top + list.clientTop;
    const bottom = top + list.clientHeight;
    if (item.top < top) list.scrollTop -= top - item.top;
    else if (item.bottom > bottom) list.scrollTop += item.bottom - bottom;
  }
  updateScrollHints();
}

watch(listboxEl, (list) => {
  resizeObserver?.disconnect();
  if (list && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(updateScrollHints);
    resizeObserver.observe(list);
    for (const option of list.children) resizeObserver.observe(option);
  }
  updateScrollHints();
}, { flush: "post" });
watch(() => props.options, async () => {
  await nextTick();
  if (open.value) scrollActiveIntoView();
}, { deep: true });
onBeforeUnmount(() => resizeObserver?.disconnect());

let search = "";
let lastTypedAt = 0;
const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
function resetSearch(): void { search = ""; }

function typeAhead(event: KeyboardEvent): boolean {
  const now = Date.now();
  if (now - lastTypedAt > 500) resetSearch();
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing ||
      Array.from(event.key).length !== 1 || (event.key === " " && !search)) return false;
  event.preventDefault();
  const key = normalize(event.key);
  const repeated = search === key;
  search = repeated ? key : search + key;
  lastTypedAt = now;
  const current = open.value ? activeIndex.value
    : props.options.findIndex((option) => option.value === model.value);
  // A continued prefix includes the current match; a new letter starts after it.
  const start = search.length > key.length ? current : current + 1;
  for (let offset = 0; offset < props.options.length; offset++) {
    const index = ((start + offset) % props.options.length + props.options.length) % props.options.length;
    const option = props.options[index];
    if (!option.disabled && normalize(option.label).startsWith(search)) {
      activeIndex.value = index;
      if (open.value) void nextTick(scrollActiveIntoView);
      else selectOption(index);
      break;
    }
  }
  return true;
}

const isDisabled = computed(() => props.disabled);

const selectedLabel = computed(
  () => props.options.find((o) => o.value === model.value)?.label ?? "",
);

function optionId(index: number): string {
  return `ui-select-option-${uid}-${index}`;
}

const activeId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : null,
);

/** First enabled option index walking `step` from `from`, wrapping. */
function nextEnabled(from: number, step: number): number {
  const opts = props.options;
  const n = opts.length;
  if (!n) return -1;
  for (let k = 1; k <= n; k++) {
    const i = (((from + step * k) % n) + n) % n;
    if (!opts[i].disabled) return i;
  }
  return from;
}

function openPanel(): void {
  resetSearch();
  const selected = props.options.findIndex((o) => o.value === model.value);
  activeIndex.value = selected >= 0 ? selected : nextEnabled(-1, 1);
  open.value = true;
}

function toggle(): void {
  if (isDisabled.value) return;
  if (open.value) {
    close();
  } else {
    openPanel();
  }
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (isDisabled.value) return;
  if (typeAhead(event)) return;
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    if (!open.value) openPanel();
  }
}

function onListboxKeydown(event: KeyboardEvent): void {
  if (typeAhead(event)) return;
  resetSearch();
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      activeIndex.value = nextEnabled(activeIndex.value, 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      activeIndex.value = nextEnabled(activeIndex.value, -1);
      break;
    case "Home":
      event.preventDefault();
      activeIndex.value = nextEnabled(-1, 1);
      break;
    case "End":
      event.preventDefault();
      activeIndex.value = nextEnabled(props.options.length, -1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      selectOption(activeIndex.value);
      break;
    case "Tab":
      close();
      break;
  }
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    void nextTick(scrollActiveIntoView);
  }
}

function selectOption(index: number): void {
  const opt = props.options[index];
  if (!opt || opt.disabled) return;
  model.value = opt.value;
  emit("changed", opt.value);
  emit("change", opt.value); // obsoleto, ver src/deprecations.ts
  close();
}

// Minimal focus trap: keep focus within the listbox while open. The listbox is
// the only focusable element in the panel, so any focus leaving it (other than
// the trigger restore on close) bounces back.
function onPaneFocusOut(event: FocusEvent): void {
  if (!open.value) return;
  const next = event.relatedTarget as Node | null;
  if (next && listboxEl.value?.contains(next)) return;
  // Defer so a programmatic close()/trigger-focus isn't fought.
  void nextTick(() => {
    if (open.value) listboxEl.value?.focus();
  });
}

const triggerClasses = computed(() => ({
  "ui-select__trigger": true,
  "ui-select__trigger--open": open.value,
}));

const valueClasses = computed(() => ({
  "ui-select__value": true,
  "ui-select__value--placeholder": !selectedLabel.value,
}));

// Close if disabled becomes true while open.
watch(open, resetSearch);
watch(isDisabled, (d) => {
  if (d && open.value) close();
});

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <div :class="['ui-select', rootAttrs().class]" :style="rootAttrs().style">
    <button
      v-bind="controlAttrs()"
      :id="controlId()"
      ref="triggerEl"
      type="button"
      role="combobox"
      :class="triggerClasses"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? listboxId : undefined"
      :aria-labelledby="ariaLabelledby || undefined"
      :aria-label="ariaLabelledby ? undefined : ariaLabel || (fieldLabelId() ? undefined : placeholder)"
      :disabled="isDisabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
      @blur="resetSearch"
    >
      <span :class="valueClasses">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="ui-select__arrow" aria-hidden="true">▾</span>
    </button>

    <Teleport to="body">
      <template v-if="open">
        <!-- Backdrop: click-outside closes the panel. -->
        <div class="ui-select__backdrop" @mousedown="onBackdrop"></div>
        <ul
          ref="listboxEl"
          role="listbox"
          :id="listboxId"
          class="ui-select__listbox ui-select__pane"
          :class="{
            'ui-select__listbox--more-above': moreAbove,
            'ui-select__listbox--more-below': moreBelow,
          }"
          @scroll="updateScrollHints"
          tabindex="-1"
          :aria-activedescendant="activeId ?? undefined"
          :style="paneStyle"
          @keydown="onListboxKeydown"
          @focusout="onPaneFocusOut"
        >
          <li
            v-for="(opt, i) in options"
            :key="opt.value"
            role="option"
            :id="optionId(i)"
            class="ui-select__option"
            :class="{
              'ui-select__option--active': i === activeIndex,
              'ui-select__option--selected': opt.value === model,
            }"
            :aria-selected="opt.value === model ? 'true' : 'false'"
            :aria-disabled="opt.disabled ? 'true' : undefined"
            @click="selectOption(i)"
            @mouseenter="!opt.disabled && (activeIndex = i)"
          >
            {{ opt.label }}
          </li>
        </ul>
      </template>
    </Teleport>
  </div>
</template>
