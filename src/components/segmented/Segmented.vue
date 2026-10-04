<script setup lang="ts">
import { computed, useId } from "vue";
import "./segmented.scss";

export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export type SegmentedSize = "sm" | "md";

const props = withDefaults(
  defineProps<{
    /** The choices, in order. */
    options: SegmentedOption[];
    /** Accessible name of the group. */
    ariaLabel?: string;
    /** Control size. */
    size?: SegmentedSize;
    /** Disables the whole control. */
    disabled?: boolean;
  }>(),
  { ariaLabel: "", size: "md", disabled: false },
);

/** The selected value (v-model). */
const model = defineModel<string>({ default: "" });

const emit = defineEmits<{ changed: [value: string] }>();

/**
 * Native radios, visually turned into segments. Arrow keys, Home/End, form
 * submission and the "one of these" semantics come from the browser, which
 * a row of `aria-pressed` buttons would have to fake (gap G4: the dashboard's
 * calendar/list switch and its session picker).
 */
const name = `ui-segmented-${useId()}`;

const rootClasses = computed(() => [
  "ui-segmented",
  `ui-segmented--${props.size}`,
  { "ui-segmented--disabled": props.disabled },
]);

function select(value: string): void {
  if (props.disabled || value === model.value) return;
  model.value = value;
  emit("changed", value);
}
</script>

<template>
  <div :class="rootClasses" role="radiogroup" :aria-label="ariaLabel || undefined">
    <label
      v-for="opt in options"
      :key="opt.value"
      :class="[
        'ui-segmented__item',
        {
          'ui-segmented__item--selected': model === opt.value,
          'ui-segmented__item--disabled': disabled || opt.disabled,
        },
      ]"
    >
      <input
        class="ui-segmented__el"
        type="radio"
        :name="name"
        :value="opt.value"
        :checked="model === opt.value"
        :disabled="disabled || !!opt.disabled"
        @change="select(opt.value)"
      />
      <span class="ui-segmented__label">{{ opt.label }}</span>
    </label>
  </div>
</template>
