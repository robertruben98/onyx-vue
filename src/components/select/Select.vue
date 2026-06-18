<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import "./select.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextSelectId = 0;

const props = withDefaults(
  defineProps<{
    /** Available options. */
    options?: SelectOption[];
    /** Placeholder shown when nothing is selected. */
    placeholder?: string;
    /** Accessible name for the combobox (falls back to the placeholder). */
    ariaLabel?: string;
    /** Disabled state. */
    disabled?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: "Select…",
    ariaLabel: "",
    disabled: false,
  },
);

/** Two-way bound selected value (Vue equivalent of ControlValueAccessor). */
const model = defineModel<string | null>({ default: null });

/** Emitted whenever the user picks an option. */
const emit = defineEmits<{
  change: [value: string | null];
}>();

const uid = nextSelectId++;
const listboxId = `ui-select-listbox-${uid}`;

const open = ref(false);
const activeIndex = ref(-1);

const triggerEl = ref<HTMLButtonElement | null>(null);
const listboxEl = ref<HTMLUListElement | null>(null);
const panePos = ref<{ top: number; left: number; width: number }>({
  top: 0,
  left: 0,
  width: 0,
});

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

function positionPane(): void {
  const trigger = triggerEl.value;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  panePos.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
  };
}

function openPanel(): void {
  positionPane();
  const selected = props.options.findIndex((o) => o.value === model.value);
  activeIndex.value = selected >= 0 ? selected : nextEnabled(-1, 1);
  open.value = true;
  void nextTick(() => listboxEl.value?.focus());
}

function close(): void {
  if (!open.value) return;
  open.value = false;
  // Restore focus to the trigger (focus restoration).
  triggerEl.value?.focus();
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
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    if (!open.value) openPanel();
  }
}

function onListboxKeydown(event: KeyboardEvent): void {
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
    case "Escape":
    case "Tab":
      close();
      break;
  }
}

function selectOption(index: number): void {
  const opt = props.options[index];
  if (!opt || opt.disabled) return;
  model.value = opt.value;
  emit("change", opt.value);
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
watch(isDisabled, (d) => {
  if (d && open.value) close();
});

onBeforeUnmount(() => {
  open.value = false;
});
</script>

<template>
  <div class="ui-select">
    <button
      ref="triggerEl"
      type="button"
      role="combobox"
      :class="triggerClasses"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? listboxId : undefined"
      :aria-label="ariaLabel || placeholder"
      :disabled="isDisabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span :class="valueClasses">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="ui-select__arrow" aria-hidden="true">▾</span>
    </button>

    <Teleport to="body">
      <template v-if="open">
        <!-- Backdrop: click-outside closes the panel. -->
        <div
          class="ui-select__backdrop"
          style="position: fixed; inset: 0; z-index: var(--ui-overlay-z, 1000)"
          @mousedown="close"
        ></div>
        <ul
          ref="listboxEl"
          role="listbox"
          :id="listboxId"
          class="ui-select__listbox ui-select__pane"
          tabindex="-1"
          :aria-activedescendant="activeId ?? undefined"
          :style="{
            top: panePos.top + 'px',
            left: panePos.left + 'px',
            width: panePos.width + 'px',
          }"
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
