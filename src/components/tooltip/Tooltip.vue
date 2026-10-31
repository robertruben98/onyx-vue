<script setup lang="ts">
import { useOverlay } from "../../internal/useOverlay";
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, ref, useId, watch } from "vue";
import "./tooltip.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

const props = withDefaults(
  defineProps<{
    /** Tooltip text. */
    text: string;
    /** Preferred placement. */
    placement?: TooltipPlacement;
  }>(),
  {
    placement: "top",
  },
);

/** Emitted whenever the shown state changes (true = shown, false = hidden). */
const emit = defineEmits<{
  toggled: [shown: boolean];
  /** @deprecated Use `toggled`; still emitted until 1.0. */
  toggle: [shown: boolean];
}>();

const triggerRef = ref<HTMLElement | null>(null);
const paneRef = ref<HTMLElement | null>(null);
const shown = ref(false);
const { style: paneStyle, close: closeOverlay } = useOverlay({
  kind: "tooltip", open: shown, trigger: triggerRef, panel: paneRef,
  placement: () => props.placement,
});

const uid = useId();
const id = `ui-tooltip-${uid}`;

/** Only shown when there is text to display (mirrors the Angular guard). */
const canShow = computed(() => !!props.text);

function show(): void {
  if (shown.value || !canShow.value) return;
  shown.value = true;
}

function hide(): void {
  closeOverlay();
}

watch(shown, (isShown, was) => {
  if (isShown === was) return;
  emit("toggled", isShown);
  emit("toggle", isShown); // obsoleto, ver src/deprecations.ts
  // La descripcion va al control que recibe el foco, no a la envoltura: el
  // host es `display: contents` y un lector de pantalla anuncia el boton, no el
  // span que lo rodea, asi que en el span el texto no se leia nunca.
  const target = describedTarget();
  if (isShown) {
    target?.setAttribute("aria-describedby", id);
  } else {
    target?.removeAttribute("aria-describedby");
  }
});

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** The focusable control inside the host, else its first element, else the host. */
function describedTarget(): HTMLElement | null {
  const host = triggerRef.value;
  if (!host) return null;
  if (host.matches(FOCUSABLE)) return host;
  return host.querySelector<HTMLElement>(FOCUSABLE) ?? (host.firstElementChild as HTMLElement | null) ?? host;
}

const rootClasses = computed(() => ({ "ui-tooltip-host": true }));

defineExpose({ show, hide, shown });

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <span
    :class="rootClasses"
    ref="triggerRef"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <Teleport to="body">
      <div
        v-if="shown"
        ref="paneRef"
        class="ui-tooltip__pane"
        :style="paneStyle"
      >
        <div :id="id" class="ui-tooltip" role="tooltip">{{ text }}</div>
      </div>
    </Teleport>
  </span>
</template>
