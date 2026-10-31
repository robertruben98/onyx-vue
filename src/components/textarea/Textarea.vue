<script setup lang="ts">
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, ref, useId } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import "./textarea.scss";

const props = withDefaults(
  defineProps<{
    /** Number of visible text rows. */
    rows?: number;
    /** Placeholder text. */
    placeholder?: string;
    /** Visible label — when set, renders a <label> linked to the control. */
    label?: string;
    /** Accessible name when no visible label is provided. */
    ariaLabel?: string;
    /** Invalid state — reflected via aria-invalid and styling. */
    invalid?: boolean;
    /** Disabled state. */
    disabled?: boolean;
    /**
     * Read-only: the value can be read, selected and copied but not edited,
     * and keeps the normal text colour. Use it for "your answer" after a check;
     * `disabled` greys the text out.
     */
    readonly?: boolean;
    /**
     * Takes the full width of its container (block, `width: 100%`) instead of
     * sitting inline at its intrinsic width.
     */
    fluid?: boolean;
  }>(),
  {
    rows: 3,
    placeholder: "",
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
    readonly: false,
    fluid: false,
  },
);

/** Two-way bound value (v-model). */
const model = defineModel<string>({ default: "" });

/** Emitted on every value change (in addition to v-model). */
const emit = defineEmits<{
  valueChanged: [value: string];
  /** @deprecated Use `valueChanged`; still emitted until 1.0. */
  valueChange: [value: string];
}>();

const uid = useId();
const inputId = `ui-textarea-${uid}`;

// Los atributos del consumidor van al elemento nativo, no a la envoltura
// (ver internal/forward-attrs.ts).
defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs, controlId, fieldInvalid } = useForwardedAttrs(inputId, { field: true });
/** Invalido por su prop o por el UiFormField que lo envuelve. */
const isInvalid = (): boolean => props.invalid || fieldInvalid();

const rootClasses = computed(() => ({
  "ui-textarea": true,
  "ui-textarea--invalid": isInvalid(),
  "ui-textarea--disabled": props.disabled,
  "ui-textarea--fluid": props.fluid,
}));

const touched = ref(false);

function handleInput(event: Event): void {
  if (props.disabled) {
    return;
  }
  const value = (event.target as HTMLTextAreaElement).value;
  model.value = value;
  emit("valueChanged", value);
  emit("valueChange", value); // obsoleto, ver src/deprecations.ts
}

function handleBlur(): void {
  touched.value = true;
}

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <span :class="[rootClasses, rootAttrs().class]" :style="rootAttrs().style">
    <label v-if="label" class="ui-textarea__label" :for="controlId()">{{
      label
    }}</label>
    <textarea
      v-bind="controlAttrs()"
      class="ui-textarea__el"
      :id="controlId()"
      :rows="rows"
      :value="model"
      :disabled="disabled"
      :readonly="readonly || undefined"
      :placeholder="placeholder || undefined"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
      :aria-invalid="isInvalid() ? 'true' : undefined"
      @input="handleInput"
      @blur="handleBlur"
    ></textarea>
  </span>
</template>
