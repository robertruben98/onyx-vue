<script setup lang="ts">
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, ref, useId, useSlots } from "vue";
import { useForwardedAttrs } from "../../internal/forward-attrs";
import { useOnyxLocale } from "../../locale";
import "./input.scss";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "datetime-local";
export type InputSize = "sm" | "md" | "lg";
/** `pill` is the rounded search field: full radius, filled, no border, search glyph. */
export type InputVariant = "default" | "pill";
/** Built-in leading icon shortcut. */
export type InputIcon = "search";

const props = withDefaults(
  defineProps<{
    /** Native input type. */
    type?: InputType;
    /** Control size. */
    size?: InputSize;
    /** Look. `pill`: 40 px search field (rounded, filled, borderless) with a leading search glyph. */
    variant?: InputVariant;
    /** Placeholder text. */
    placeholder?: string;
    /** Visible label — when set, renders a <label> linked to the input. */
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
    /** Decorative leading icon shortcut (`search`). The `leading` slot replaces it. */
    icon?: InputIcon;
    /**
     * Shows a clear button while the value is not empty (not when disabled or
     * readonly); Escape clears too. Emits `cleared` and returns focus to the input.
     */
    clearable?: boolean;
  }>(),
  {
    type: "text",
    size: "md",
    variant: "default",
    placeholder: "",
    label: "",
    ariaLabel: "",
    invalid: false,
    disabled: false,
    readonly: false,
    fluid: false,
    icon: undefined,
    clearable: false,
  },
);

/** Emitted on every value change (in addition to v-model). */
const emit = defineEmits<{
  valueChanged: [value: string];
  /** Emitted after the clear button or Escape emptied the value. */
  cleared: [];
  /** @deprecated Use `valueChanged`; still emitted until 1.0. */
  valueChange: [value: string];
}>();

/** Two-way bound value (v-model). */
const value = defineModel<string>({ default: "" });

const messages = useOnyxLocale();
const slots = useSlots();
const uid = useId();
const inputId = `ui-input-${uid}`;

// Los atributos del consumidor van al elemento nativo, no a la envoltura
// (ver internal/forward-attrs.ts).
defineOptions({ inheritAttrs: false });
const { rootAttrs, controlAttrs, controlId, fieldInvalid } = useForwardedAttrs(inputId, { field: true });
/** Invalido por su prop o por el UiFormField que lo envuelve. */
const isInvalid = (): boolean => props.invalid || fieldInvalid();

const showGlyph = computed(
  () => !slots.leading && (props.variant === "pill" || props.icon === "search"),
);
const hasLeading = computed(() => !!slots.leading || showGlyph.value);
const canClear = computed(
  () => props.clearable && !props.disabled && !props.readonly && value.value !== "",
);
const hasTrailing = computed(() => !!slots.trailing || canClear.value);

const rootClasses = computed(() => ({
  "ui-input": true,
  "ui-input--sm": props.size === "sm",
  "ui-input--lg": props.size === "lg",
  "ui-input--pill": props.variant === "pill",
  "ui-input--invalid": isInvalid(),
  "ui-input--disabled": props.disabled,
  "ui-input--fluid": props.fluid,
  "ui-input--has-leading": hasLeading.value,
  "ui-input--has-trailing": hasTrailing.value,
}));

function handleInput(event: Event): void {
  if (props.disabled) {
    return;
  }
  const next = (event.target as HTMLInputElement).value;
  value.value = next;
  emit("valueChanged", next);
  emit("valueChange", next); // obsoleto, ver src/deprecations.ts
}
function clear(): void {
  value.value = "";
  emit("valueChanged", "");
  emit("valueChange", "");
  emit("cleared");
  elemento.value?.focus();
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && canClear.value) {
    event.preventDefault();
    clear();
  }
}
/**
 * Foco programatico. Sin esto, quien quiera enfocar la caja tiene que sacar el
 * `<input>` del DOM por su cuenta — y un `ref` sobre `<UiInput>` devuelve la
 * instancia del componente, no un elemento, asi que el intento natural
 * (`ref.querySelector("input")`) revienta con "querySelector is not a
 * function". Se expone tambien `select` porque enfocar para reescribir el
 * contenido es el caso que sigue.
 */
const elemento = ref<HTMLInputElement | null>(null);

function focus(opciones?: FocusOptions): void {
  elemento.value?.focus(opciones);
}

function select(): void {
  elemento.value?.select();
}

defineExpose({ focus, select, elemento });

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <span :class="[rootClasses, rootAttrs().class]" :style="rootAttrs().style">
    <label v-if="label" class="ui-input__label" :for="controlId()">{{
      label
    }}</label>
    <span class="ui-input__field" @click="focus()">
      <span v-if="slots.leading" class="ui-input__leading"><slot name="leading" /></span>
      <svg
        v-else-if="showGlyph"
        class="ui-input__glyph"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M9.5 16a6.27 6.27 0 0 1-4.61-1.89A6.27 6.27 0 0 1 3 9.5c0-1.82.63-3.35 1.89-4.61A6.27 6.27 0 0 1 9.5 3c1.82 0 3.35.63 4.61 1.89A6.27 6.27 0 0 1 16 9.5a6.1 6.1 0 0 1-1.3 3.8l5.6 5.6c.18.18.27.42.27.7 0 .28-.09.52-.27.7a.95.95 0 0 1-.7.27.95.95 0 0 1-.7-.27l-5.6-5.6A5.96 5.96 0 0 1 9.5 16Zm0-2c1.25 0 2.31-.44 3.19-1.31A4.34 4.34 0 0 0 14 9.5c0-1.25-.44-2.31-1.31-3.19A4.34 4.34 0 0 0 9.5 5c-1.25 0-2.31.44-3.19 1.31A4.34 4.34 0 0 0 5 9.5c0 1.25.44 2.31 1.31 3.19A4.34 4.34 0 0 0 9.5 14Z" />
      </svg>
      <input
        v-bind="controlAttrs()"
        ref="elemento"
        class="ui-input__el"
        :id="controlId()"
        :type="type"
        :value="value"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :placeholder="placeholder || undefined"
        :aria-label="!label && ariaLabel ? ariaLabel : undefined"
        :aria-invalid="isInvalid() ? 'true' : undefined"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <span v-if="hasTrailing" class="ui-input__trailing">
        <slot name="trailing" />
        <button
          v-if="canClear"
          type="button"
          class="ui-input__clear"
          :aria-label="messages.inputClearLabel"
          @click.stop="clear"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6 6.4 5Z" />
          </svg>
        </button>
      </span>
    </span>
  </span>
</template>
