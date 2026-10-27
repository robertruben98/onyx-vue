<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import "./segmented.scss";

export interface SegmentedOption {
  value: string;
  label: string;
  /**
   * Shorter label for when the full ones do not fit on one line (fluid only):
   * "Interview" for "1 · Interview" on a phone. The full label stays the
   * accessible name.
   */
  short?: string;
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
    /**
     * Takes the full width and shares it equally. Labels stay on one line;
     * when they do not fit, the options' `short` labels are used, then a
     * compact step (smaller text, less padding), and only if that does not fit
     * either does a label wrap onto a second line, at spaces only (phones).
     */
    fluid?: boolean;
  }>(),
  { ariaLabel: "", size: "md", disabled: false, fluid: false },
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

/**
 * Fluid: una etiqueta partida en dos lineas ("1 ·" / "Interview") se lee mal.
 * Se mide: primero las etiquetas enteras en una linea; si alguna no cabe, las
 * cortas; si tampoco, las mismas en compacto (letra pequena, sin apenas margen);
 * y solo si tampoco, se deja partir. Se vuelve a medir al cambiar el ancho.
 */
const fit = ref<"full" | "short" | "compact" | "wrap">("full");
const root = ref<HTMLElement | null>(null);
const hasShort = computed(() => props.options.some((o) => o.short));
function overflows(): boolean {
  const labels = root.value?.querySelectorAll<HTMLElement>(".ui-segmented__label") ?? [];
  return [...labels].some((l) => l.scrollWidth > l.clientWidth + 1);
}
async function measure(): Promise<void> {
  if (!props.fluid || !root.value) return;
  fit.value = "full";
  await nextTick();
  if (!overflows()) return;
  if (hasShort.value) {
    fit.value = "short";
    await nextTick();
    if (!overflows()) return;
  }
  fit.value = "compact";
  await nextTick();
  if (!overflows()) return;
  fit.value = "wrap";
}
let observer: ResizeObserver | null = null;
let lastWidth = -1;
onMounted(() => {
  if (!props.fluid) return;
  void measure();
  if (typeof ResizeObserver !== "undefined" && root.value) {
    // Solo los cambios de ANCHO: el alto cambia al partir, y medir por eso daria vueltas.
    observer = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w !== lastWidth) { lastWidth = w; void measure(); }
    });
    observer.observe(root.value);
  }
});
onBeforeUnmount(() => observer?.disconnect());
watch(() => props.options.map((o) => o.label + (o.short ?? "")).join("|"), () => void measure());

const shown = (opt: SegmentedOption) => (fit.value !== "full" && opt.short ? opt.short : opt.label);
/**
 * Al partir, solo en los espacios: el navegador tambien parte tras un guion
 * ("Role-" / "play"), y eso solo lo evita el guion que no se parte (U+2011).
 */
const painted = (opt: SegmentedOption) => (fit.value === "wrap" ? shown(opt).replace(/-/g, "\u2011") : shown(opt));

const rootClasses = computed(() => [
  "ui-segmented",
  `ui-segmented--${props.size}`,
  {
    "ui-segmented--disabled": props.disabled,
    "ui-segmented--fluid": props.fluid,
    "ui-segmented--compact": props.fluid && (fit.value === "compact" || fit.value === "wrap"),
    "ui-segmented--wrap": props.fluid && fit.value === "wrap",
  },
]);

function select(value: string): void {
  if (props.disabled || value === model.value) return;
  model.value = value;
  emit("changed", value);
  // El padre puede no aceptar el valor (una guarda que se queda donde estaba).
  // Entonces Vue no vuelve a pintar `checked`, porque no ha cambiado, y el radio
  // nativo se queda marcado en la opcion rechazada: el resaltado dice la vieja y
  // volver a tocar la nueva no dispara `change`. Se resincroniza con el modelo.
  void nextTick(syncChecked);
}

/** Native `checked` of every radio back in line with the model. */
function syncChecked(): void {
  root.value?.querySelectorAll<HTMLInputElement>(".ui-segmented__el").forEach((input) => {
    input.checked = input.value === model.value;
  });
}
</script>

<template>
  <div ref="root" :class="rootClasses" role="radiogroup" :aria-label="ariaLabel || undefined">
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
        :aria-label="painted(opt) !== opt.label ? opt.label : undefined"
        @change="select(opt.value)"
      />
      <span class="ui-segmented__label" :title="shown(opt) !== opt.label ? opt.label : undefined">{{ painted(opt) }}</span>
    </label>
  </div>
</template>
