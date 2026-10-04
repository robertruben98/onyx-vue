<script setup lang="ts">
import { computed, useId } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./switch.scss";

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
const emit = defineEmits<{
  checkedChanged: [value: boolean];
  /** @deprecated Use `checkedChanged`; still emitted until 1.0. */
  checkedChange: [value: boolean];
}>();

const uid = useId();
const inputId = `ui-switch-${uid}`;

// Los atributos del consumidor van al elemento nativo, no a la envoltura
// (ver internal/forward-attrs.ts).
defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs, controlId } = useForwardedAttrs(inputId);

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
  emit("checkedChanged", value);
  emit("checkedChange", value); // obsoleto, ver src/deprecations.ts
}
</script>

<template>
  <span :class="[rootClasses, rootAttrs().class]" :style="rootAttrs().style">
    <label class="ui-switch__wrap" :for="controlId()">
      <span class="ui-switch__control">
        <input
          v-bind="controlAttrs()"
          class="ui-switch__el"
          type="checkbox"
          role="switch"
          :id="controlId()"
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
