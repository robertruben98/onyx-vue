<script setup lang="ts">
import { computed } from "vue";
import "./group-header.scss";

const props = withDefaults(
  defineProps<{
    /** Short name identifying the group. */
    name: string;
    /** Long form, pushed to the far end and hidden on narrow viewports. */
    full?: string;
    /** Makes the whole band activatable. Renders a real button. */
    interactive?: boolean;
  }>(),
  {
    full: "",
    interactive: false,
  },
);

/** Emitted when an interactive header is activated. */
const emit = defineEmits<{ selected: [] }>();

const rootClasses = computed(() => ({
  "ui-group-header": true,
  "ui-group-header--interactive": props.interactive,
}));

function activate(): void {
  if (props.interactive) emit("selected");
}
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :class="rootClasses"
    :type="interactive ? 'button' : undefined"
    @click="activate"
  >
    <span class="ui-group-header__name">{{ name }}</span>
    <span v-if="$slots.marks" class="ui-group-header__marks"><slot name="marks" /></span>
    <span v-if="full" class="ui-group-header__full">{{ full }}</span>
  </component>
</template>
