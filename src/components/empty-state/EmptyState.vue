<script setup lang="ts">
import { computed, useSlots } from "vue";
import { UiButton } from "../button";
import "./empty-state.scss";

export type EmptyStateRole = "region" | "status";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** ARIA role. Use `status` when the empty state appears dynamically and should be announced. */
    role?: EmptyStateRole;
    /** Accessible name used instead of the title slot when provided. */
    ariaLabel?: string;
    /** Disables both actions and exposes `aria-disabled` on the root. */
    disabled?: boolean;
  }>(),
  {
    role: "region",
    ariaLabel: "",
    disabled: false,
  },
);

/** Emitted when the primary action is activated. */
/** Emitted when the secondary action is activated. */
const emit = defineEmits<{
  primaryAction: [event: MouseEvent];
  secondaryAction: [event: MouseEvent];
}>();

const slots = useSlots();

const uid = nextId++;
const titleId = `ui-empty-state-title-${uid}`;
const descriptionId = `ui-empty-state-description-${uid}`;

const hasVisual = computed(() => !!slots.icon || !!slots.illustration);
const hasDescription = computed(() => !!slots.description);
const hasPrimary = computed(() => !!slots.primaryAction);
const hasSecondary = computed(() => !!slots.secondaryAction);
const hasActions = computed(() => hasPrimary.value || hasSecondary.value);

/**
 * An explicit name wins; otherwise the title labels the region. Pointing
 * `aria-describedby` at a description that was never given is the wart this
 * port fixes — the Angular original always renders the paragraph.
 */
const labelledBy = computed(() => (props.ariaLabel ? undefined : titleId));
const describedBy = computed(() => (hasDescription.value ? descriptionId : undefined));
</script>

<template>
  <div
    class="ui-empty-state"
    :class="{ 'ui-empty-state--disabled': disabled }"
    :role="role"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-atomic="role === 'status' ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div v-if="hasVisual" class="ui-empty-state__visual" aria-hidden="true">
      <slot name="icon"><slot name="illustration" /></slot>
    </div>

    <div class="ui-empty-state__content">
      <h2 :id="titleId" class="ui-empty-state__title"><slot name="title" /></h2>
      <p v-if="hasDescription" :id="descriptionId" class="ui-empty-state__description">
        <slot name="description" />
      </p>
    </div>

    <div v-if="hasActions" class="ui-empty-state__actions">
      <UiButton
        v-if="hasPrimary"
        variant="primary"
        :disabled="disabled"
        @clicked="(e) => emit('primaryAction', e)"
      >
        <slot name="primaryAction" />
      </UiButton>
      <UiButton
        v-if="hasSecondary"
        variant="secondary"
        :disabled="disabled"
        @clicked="(e) => emit('secondaryAction', e)"
      >
        <slot name="secondaryAction" />
      </UiButton>
    </div>
  </div>
</template>
