<script setup lang="ts">
import { computed } from "vue";
import "./switch.scss";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** Visible label — when set, renders next to the control. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled state — a disabled switch never emits `checkedChange`. */
    disabled?: boolean;
  }>(),
  {
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
  },
);

/** Two-way checked state (v-model). */
const checked = defineModel<boolean>({ default: false });

/** Emitted on every change (in addition to the v-model update). */
const emit = defineEmits<{ checkedChange: [value: boolean] }>();

const inputId = `ui-switch-${nextId++}`;

const rootClasses = computed(() => ({
  "ui-switch": true,
  "ui-switch--invalid": props.invalid,
  "ui-switch--disabled": props.disabled,
}));

function handleChange(event: Event): void {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  const value = (event.target as HTMLInputElement).checked;
  checked.value = value;
  emit("checkedChange", value);
}
</script>

<template>
  <span :class="rootClasses">
    <label class="ui-switch__wrap" :for="inputId">
      <span class="ui-switch__control">
        <input
          class="ui-switch__el"
          type="checkbox"
          role="switch"
          :id="inputId"
          :checked="checked"
          :disabled="disabled"
          :aria-label="!label && ariaLabel ? ariaLabel : undefined"
          :aria-invalid="invalid ? 'true' : undefined"
          @change="handleChange"
        />
        <span class="ui-switch__track" aria-hidden="true"></span>
      </span>
      <span v-if="label" class="ui-switch__label">{{ label }}</span>
    </label>
  </span>
</template>
