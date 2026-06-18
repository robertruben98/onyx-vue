<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import "./tooltip.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

let nextTooltipId = 0;

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
const emit = defineEmits<{ toggle: [shown: boolean] }>();

const triggerRef = ref<HTMLElement | null>(null);
const paneRef = ref<HTMLElement | null>(null);
const shown = ref(false);
const paneStyle = ref<Record<string, string>>({});

const id = `ui-tooltip-${nextTooltipId++}`;

/** Only shown when there is text to display (mirrors the Angular guard). */
const canShow = computed(() => !!props.text);

function position(): void {
  const trigger = triggerRef.value;
  const pane = paneRef.value;
  if (!trigger || !pane) return;
  const r = trigger.getBoundingClientRect();
  const p = pane.getBoundingClientRect();
  let top = 0;
  let left = 0;
  // `align: "center"` on the cross-axis, matching the Angular overlay config.
  switch (props.placement) {
    case "bottom":
      top = r.bottom;
      left = r.left + r.width / 2 - p.width / 2;
      break;
    case "left":
      top = r.top + r.height / 2 - p.height / 2;
      left = r.left - p.width;
      break;
    case "right":
      top = r.top + r.height / 2 - p.height / 2;
      left = r.right;
      break;
    case "top":
    default:
      top = r.top - p.height;
      left = r.left + r.width / 2 - p.width / 2;
      break;
  }
  paneStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  };
}

function show(): void {
  if (shown.value || !canShow.value) return;
  shown.value = true;
}

function hide(): void {
  if (!shown.value) return;
  shown.value = false;
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") hide();
}

watch(shown, (isShown, was) => {
  if (isShown === was) return;
  emit("toggle", isShown);
  if (isShown) {
    triggerRef.value?.setAttribute("aria-describedby", id);
    nextTick(() => {
      position();
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
    });
  } else {
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
    triggerRef.value?.removeAttribute("aria-describedby");
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", position);
  window.removeEventListener("scroll", position, true);
});

const rootClasses = computed(() => ({ "ui-tooltip-host": true }));

defineExpose({ show, hide, shown });
</script>

<template>
  <span
    :class="rootClasses"
    ref="triggerRef"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown="onTriggerKeydown"
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
