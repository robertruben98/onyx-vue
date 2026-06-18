<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from "vue";
import "./checkbox.scss";

export type CheckboxSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    /** Control size. */
    size?: CheckboxSize;
    /** Visible label — when set, renders next to the control. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Indeterminate (tri-state) — visual dash, not a checked value. */
    indeterminate?: boolean;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled state — a disabled checkbox never emits events. */
    disabled?: boolean;
    /** Tab order of the native control (set to -1 inside roving-tabindex grids). */
    tabindex?: number;
  }>(),
  {
    size: "md",
    label: "",
    ariaLabel: "",
    indeterminate: false,
    invalid: false,
    disabled: false,
    tabindex: 0,
  },
);

/** Two-way bound checked value (v-model). */
const checked = defineModel<boolean>({ default: false });

/** Emitted on every change (in addition to v-model). */
const emit = defineEmits<{ checkedChange: [value: boolean] }>();

const box = ref<HTMLInputElement | null>(null);

// `indeterminate` is a DOM property, not an attribute — it must be synced
// imperatively. A function ref applies the current value the moment the native
// input is patched in (synchronously, during render), so it is correct on first
// paint without waiting for a post-render flush. The watcher then keeps it in
// sync on subsequent prop changes.
function setBox(el: Element | ComponentPublicInstance | null): void {
  box.value = el as HTMLInputElement | null;
  if (box.value) box.value.indeterminate = props.indeterminate;
}

watch(
  () => props.indeterminate,
  (ind) => {
    if (box.value) box.value.indeterminate = ind;
  },
);

const inputId = `ui-checkbox-${nextCheckboxId++}`;

const rootClasses = computed(() => ({
  "ui-checkbox": true,
  "ui-checkbox--sm": props.size === "sm",
  "ui-checkbox--lg": props.size === "lg",
  "ui-checkbox--invalid": props.invalid,
  "ui-checkbox--disabled": props.disabled,
}));

function handleChange(event: Event): void {
  if (props.disabled) return;
  const value = (event.target as HTMLInputElement).checked;
  checked.value = value;
  emit("checkedChange", value);
}
</script>

<script lang="ts">
// Module-scoped counter for stable, unique per-instance ids.
let nextCheckboxId = 0;
</script>

<template>
  <span :class="rootClasses">
    <label class="ui-checkbox__wrap" :for="inputId">
      <input
        :ref="setBox"
        class="ui-checkbox__el"
        type="checkbox"
        :id="inputId"
        :tabindex="tabindex"
        :checked="checked"
        :disabled="disabled"
        :aria-label="!label && ariaLabel ? ariaLabel : undefined"
        :aria-invalid="invalid ? 'true' : undefined"
        @change="handleChange"
      />
      <span v-if="label" class="ui-checkbox__label">{{ label }}</span>
    </label>
  </span>
</template>
