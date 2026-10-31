<script setup lang="ts">
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, nextTick, ref, useId } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./radio-group.scss";

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** Options to render: { label, value, disabled? }. */
    options: RadioOption[];
    /** Visible group label — rendered as a <legend>. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled — disables the whole group. */
    disabled?: boolean;
  }>(),
  {
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
  },
);

/** Two-way bound selected value (v-model). */
const value = defineModel<string>({ default: "" });

/** Emitted on every selection change. */
const emit = defineEmits<{
  valueChanged: [value: string];
  /** @deprecated Use `valueChanged`; still emitted until 1.0. */
  valueChange: [value: string];
}>();

defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs, controlId, fieldLabelId, fieldInvalid } = useForwardedAttrs(undefined, { field: true, group: true });
const isInvalid = () => props.invalid || fieldInvalid();

const uid = useId();
const name = `ui-radio-${uid}`;

const rootClasses = computed(() => ({
  "ui-radio-group": true,
  "ui-radio-group--invalid": isInvalid(),
  "ui-radio-group--disabled": props.disabled,
}));

const fieldset = ref<HTMLFieldSetElement | null>(null);

function select(optValue: string): void {
  if (props.disabled) return;
  value.value = optValue;
  emit("valueChanged", optValue);
  emit("valueChange", optValue); // obsoleto, ver src/deprecations.ts
  // Si el padre no acepta el valor, Vue no vuelve a pintar `checked` (no ha
  // cambiado) y el radio nativo se queda en la opcion rechazada. Se resincroniza.
  void nextTick(syncChecked);
}

/** Native `checked` of every radio back in line with the model. */
function syncChecked(): void {
  fieldset.value?.querySelectorAll<HTMLInputElement>(".ui-radio__el").forEach((input) => {
    input.checked = input.value === value.value;
  });
}

if (import.meta.env.DEV) useDeprecatedEvents();
</script>

<template>
  <span :class="[rootClasses, rootAttrs().class]" :style="rootAttrs().style">
    <fieldset
      :aria-labelledby="!label && !ariaLabel ? fieldLabelId() : undefined"
      v-bind="controlAttrs()"
      :id="controlId()"
      ref="fieldset"
      class="ui-radio-group__fieldset"
      role="radiogroup"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="isInvalid() ? 'true' : undefined"
    >
      <legend v-if="label" class="ui-radio-group__legend">{{ label }}</legend>
      <label v-for="opt in options" :key="opt.value" :class="['ui-radio', { 'ui-radio--labelled': !!opt.label }]">
        <input
          class="ui-radio__el"
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="value === opt.value"
          :disabled="disabled || !!opt.disabled"
          @change="select(opt.value)"
        />
        <span class="ui-radio__label">{{ opt.label }}</span>
      </label>
    </fieldset>
  </span>
</template>
