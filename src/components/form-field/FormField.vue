<script setup lang="ts">
import { computed, useId } from "vue";
import { provideField } from "../../internal/field-context";
import "./form-field.scss";

const props = withDefaults(
  defineProps<{
    /** What the field is. */
    label: string;
    /** A hint under the control, always visible. */
    help?: string;
    /** What is wrong with the value. Non-empty marks the field invalid. */
    error?: string;
    /** Marks the field required (an asterisk; pass `required` to the control too). */
    required?: boolean;
  }>(),
  { help: "", error: "", required: false },
);

/**
 * The label, the hint and the error, wired to the control: the library's form
 * controls pick up the field's `id` (the label points at it), the ids of the
 * hint and the error for `aria-describedby`, and whether it is invalid or
 * required, without a single binding. The slot hands over the same values for
 * any other control. A screen reader reads the hint and the error with the
 * field instead of never finding them.
 */
const base = `ui-form-field-${useId()}`;
const id = `${base}-control`;
const helpId = `${base}-help`;
const errorId = `${base}-error`;

const invalid = computed(() => props.error !== "");
const describedBy = computed(
  () => [props.help ? helpId : "", invalid.value ? errorId : ""].filter(Boolean).join(" ") || undefined,
);

// El control de dentro (UiInput, UiSelect, UiTextarea, UiDateInput, UiCheckbox,
// UiSwitch, UiSlider) recoge esto solo; el slot lo sigue dando para cualquier
// otro control o para quien prefiera escribirlo.
provideField({ id, describedBy, invalid, required: computed(() => props.required) });
</script>

<template>
  <div :class="['ui-form-field', { 'ui-form-field--invalid': invalid }]">
    <label class="ui-form-field__label" :for="id">
      {{ label }}<span v-if="required" class="ui-form-field__required" aria-hidden="true"> *</span>
    </label>
    <slot :id="id" :describedBy="describedBy" :invalid="invalid" :required="required" />
    <p v-if="help" :id="helpId" class="ui-form-field__help">{{ help }}</p>
    <p v-if="invalid" :id="errorId" class="ui-form-field__error">{{ error }}</p>
  </div>
</template>
