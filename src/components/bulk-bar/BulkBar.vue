<script setup lang="ts">
import { computed } from "vue";
import { UiButton } from "../button";
import "./bulk-bar.scss";

const props = withDefaults(
  defineProps<{
    /** How many rows are selected. At zero the bar does not render. */
    count: number;
    /** What is being counted, singular and plural. */
    noun?: [string, string];
    /**
     * The question that turns the bar into its confirm phase. Absent, the bar
     * offers its actions; present, it offers only confirm and cancel.
     */
    question?: string;
    /** Label of the confirm control. */
    confirmLabel?: string;
    /** Label of the cancel control. */
    cancelLabel?: string;
  }>(),
  {
    noun: () => ["selected", "selected"],
    question: "",
    confirmLabel: "confirm",
    cancelLabel: "cancel",
  },
);

const emit = defineEmits<{
  /** The confirm control was activated. */
  confirmed: [];
  /** The confirm phase was abandoned. */
  cancelled: [];
}>();

/**
 * A bar offering to act on nothing is worse than no bar: it takes a row of the
 * page to say that there is nothing to do.
 */
const visible = computed(() => props.count > 0);

const asking = computed(() => props.question.length > 0);

const countText = computed(() => {
  const word = props.count === 1 ? props.noun[0] : props.noun[1];
  return `${props.count} ${word}`;
});
</script>

<template>
  <div
    v-if="visible"
    :class="['ui-bulk-bar', { 'ui-bulk-bar--asking': asking }]"
    role="group"
    :aria-label="countText"
  >
    <span class="ui-bulk-bar__count">{{ countText }}</span>
    <!--
      La pregunta va junto al contador y no junto al boton: lo que hay que leer
      antes de confirmar es sobre CUANTAS filas actua, y esa cifra ya esta aqui.
    -->
    <span v-if="asking" class="ui-bulk-bar__question">{{ question }}</span>
    <span class="ui-bulk-bar__gap" />
    <template v-if="asking">
      <UiButton size="sm" @clicked="emit('confirmed')">{{ confirmLabel }}</UiButton>
      <UiButton size="sm" variant="secondary" @clicked="emit('cancelled')">{{
        cancelLabel
      }}</UiButton>
    </template>
    <slot v-else name="actions" />
  </div>
</template>
