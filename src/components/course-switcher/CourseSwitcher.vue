<script setup lang="ts">
import { useOnyxLocale } from "../../locale";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import UiChipRow from "../chip-row/ChipRow.vue";
import "./course-switcher.scss";

export interface CourseSwitcherOption {
  value: string;
  /** Visible name under the tile; also the tile's accessible name. */
  label: string;
  disabled?: boolean;
}

/** Where an `#icon` slot is being drawn. */
export type CourseSwitcherIconPlace = "trigger" | "tile";

/**
 * The "which course am I on" control of a learning app: a small icon (a flag)
 * with a number beside it in the top bar, and a panel that drops down under
 * the bar with one tile per course and, below them, whatever the app wants to
 * say about the current one (a score card).
 *
 * Under `sheetBelow` the panel is a sheet across the full width, right under
 * the app bar, with the page dimmed and out of reach: `aria-modal`, focus
 * trapped inside, a tap on the dimmed page closes it. Wider, it is a popover
 * anchored to the trigger, and moving focus out of it closes it.
 *
 * Opening moves focus to the selected tile; Escape closes and hands focus back
 * to the trigger. Tiles are a roving group: one Tab stop, arrows move between
 * them. Picking a tile emits `update:modelValue` only for an enabled course
 * other than the current one, and the selected state always follows the model:
 * a parent that refuses the change keeps the old course selected.
 */
const props = withDefaults(
  defineProps<{
    /** The courses, in order. */
    options: CourseSwitcherOption[];
    /** Accessible name of the trigger, e.g. "Course: English, score 56". */
    label: string;
    /** Short text beside the trigger icon: a score, a level. */
    badge?: string | number;
    /** Accessible name of the panel. Falls back to `label`. */
    panelLabel?: string;
    /** Accessible name of the row of tiles. */
    tilesLabel?: string;
    /** Viewport width (px) under which the panel is a full-width sheet. */
    sheetBelow?: number;
    /** Closes the panel after a different course is picked. */
    closeOnSelect?: boolean;
    /** A switch is in progress: the tiles are not activatable, the panel is `aria-busy`. */
    busy?: boolean;
    /** Disables the trigger. */
    disabled?: boolean;
  }>(),
  {
    badge: undefined,
    panelLabel: "",
    tilesLabel: () => useOnyxLocale().courseSwitcherTilesLabel,
    sheetBelow: 600,
    closeOnSelect: true,
    busy: false,
    disabled: false,
  },
);

/** The current course (v-model). */
const model = defineModel<string>({ default: "" });
/** Open state (v-model:open). */
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  /** A different, enabled course was picked. */
  changed: [value: string];
  /** The panel is open and focus is inside it. */
  opened: [];
  /** The panel closed. */
  closed: [];
}>();

const uid = useId();
const panelId = `ui-course-switcher-panel-${uid}`;
const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const sheet = ref(false);
const top = ref(0);
const left = ref(0);
/** Tile that holds the single Tab stop of the row (roving tabindex). */
const active = ref("");

const current = computed(() => props.options.find((o) => o.value === model.value));
const hasBadge = computed(() => props.badge !== undefined && props.badge !== null && props.badge !== "");

let query: MediaQueryList | null = null;
function onQuery(e: MediaQueryListEvent | MediaQueryList): void {
  sheet.value = e.matches;
}
function watchWidth(): void {
  query?.removeEventListener("change", onQuery);
  query = null;
  sheet.value = false;
  if (props.sheetBelow > 0 && typeof window !== "undefined" && window.matchMedia) {
    query = window.matchMedia(`(max-width: ${props.sheetBelow - 0.02}px)`);
    onQuery(query);
    query.addEventListener("change", onQuery);
  }
}
onMounted(watchWidth);
watch(() => props.sheetBelow, watchWidth);

/**
 * El panel cae debajo de la barra de la app, no del boton: en una barra de dos
 * filas, o con el boton mas bajo que el titulo, debajo del boton quedaria
 * pegado a media barra. Sin barra alrededor, debajo del boton.
 */
function place(): void {
  const btn = trigger.value;
  if (!btn) return;
  const bar = btn.closest<HTMLElement>(".ui-app-bar, header, [role='banner']");
  const anchor = (bar ?? btn).getBoundingClientRect();
  top.value = Math.round(anchor.bottom);
  if (sheet.value) {
    left.value = 0;
    return;
  }
  const r = btn.getBoundingClientRect();
  const width = panel.value?.getBoundingClientRect().width ?? 0;
  const gutter = 8;
  const max = Math.max(gutter, window.innerWidth - width - gutter);
  left.value = Math.round(Math.min(Math.max(r.left, gutter), max));
}

const layerStyle = computed(() => ({
  "--ui-course-switcher-top": `${top.value}px`,
  "--ui-course-switcher-left": `${left.value}px`,
}));

function enabled(): CourseSwitcherOption[] {
  return props.options.filter((o) => !o.disabled);
}

function tileEl(value: string): HTMLButtonElement | null {
  return (
    [...(panel.value?.querySelectorAll<HTMLButtonElement>(".ui-course-switcher__tile") ?? [])].find(
      (b) => b.dataset.value === value,
    ) ?? null
  );
}

function toggle(): void {
  if (props.disabled) return;
  open.value = !open.value;
}

let returnFocus = true;
function close(focusTrigger = true): void {
  if (!open.value) return;
  returnFocus = focusTrigger;
  open.value = false;
}

function pick(option: CourseSwitcherOption): void {
  if (option.disabled || props.busy) return;
  active.value = option.value;
  if (option.value === model.value) {
    // Tocar el curso actual no cambia nada: se cierra, como tocar la bandera.
    close();
    return;
  }
  model.value = option.value;
  emit("changed", option.value);
  // Si el padre no acepta el valor, la ficha marcada sigue al modelo y el foco
  // vuelve a ella (mismo caso que UiSegmented en 0.6.1).
  void nextTick(() => {
    if (props.closeOnSelect && model.value === option.value) close();
    else if (model.value !== option.value) active.value = model.value;
  });
}

function onTileKey(event: KeyboardEvent): void {
  const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const list = enabled();
  if (list.length === 0) return;
  event.preventDefault();
  const at = list.findIndex((o) => o.value === active.value);
  let next = at < 0 ? 0 : at;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (next + 1) % list.length;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (next - 1 + list.length) % list.length;
  else if (event.key === "Home") next = 0;
  else next = list.length - 1;
  active.value = list[next].value;
  const el = tileEl(active.value);
  el?.focus();
  el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Lo siguiente enfocable despues del boton en la pagina (el panel vive al final de body). */
function focusAfterTrigger(): void {
  const btn = trigger.value;
  if (!btn) return;
  const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) =>
      !panel.value?.contains(el) &&
      el.getAttribute("tabindex") !== "-1" &&
      (el as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility?.() !== false,
  );
  const next = all.find((el) => btn.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !btn.contains(el));
  (next ?? btn).focus();
}

function onPanelKey(event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  // Las fichas que no tienen la parada de Tab (tabindex -1, roving) no cuentan.
  const items = [...(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
    (el) => el.getAttribute("tabindex") !== "-1",
  );
  const first = items[0];
  const last = items[items.length - 1];
  const now = document.activeElement;
  const atStart = !first || now === first || now === panel.value;
  const atEnd = !last || now === last;
  if (!sheet.value) {
    // Popover: el panel esta al final de body, asi que salir con Tab llevaria el
    // foco fuera de la pagina. Se cierra y el foco sigue en el orden del boton.
    if (event.shiftKey && atStart) {
      event.preventDefault();
      close();
    } else if (!event.shiftKey && atEnd) {
      event.preventDefault();
      close(false);
      void nextTick(focusAfterTrigger);
    }
    return;
  }
  // Hoja de movil: el foco no sale del panel mientras esta abierto.
  if (items.length === 0) {
    event.preventDefault();
    panel.value?.focus();
    return;
  }
  if (event.shiftKey && atStart) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && atEnd) {
    event.preventDefault();
    first.focus();
  }
}

/** Popover: cuando el foco sale del panel (Tab mas alla del final), se cierra. */
function onPanelFocusOut(event: FocusEvent): void {
  if (sheet.value) return;
  const to = event.relatedTarget as Node | null;
  if (!to || panel.value?.contains(to)) return;
  close(false);
}

function onDocKey(event: KeyboardEvent): void {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    close();
  }
}

function onResize(): void {
  place();
}

watch(
  open,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      returnFocus = true;
      active.value = current.value && !current.value.disabled ? current.value.value : enabled()[0]?.value ?? "";
      place();
      document.addEventListener("keydown", onDocKey, true);
      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onResize, { capture: true, passive: true });
      void nextTick(() => {
        place();
        const el = tileEl(active.value);
        (el ?? panel.value)?.focus();
        el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        emit("opened");
      });
    } else if (!isOpen && wasOpen) {
      document.removeEventListener("keydown", onDocKey, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      if (returnFocus) trigger.value?.focus();
      returnFocus = true;
      emit("closed");
    }
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  query?.removeEventListener("change", onQuery);
  document.removeEventListener("keydown", onDocKey, true);
  window.removeEventListener("resize", onResize);
  window.removeEventListener("scroll", onResize, true);
});

const rootClasses = computed(() => ({
  "ui-course-switcher": true,
  "ui-course-switcher--open": open.value,
}));

const layerClasses = computed(() => ({
  "ui-course-switcher__layer": true,
  "ui-course-switcher__layer--sheet": sheet.value,
}));

defineExpose({ close, toggle });
</script>

<template>
  <div :class="rootClasses">
    <button
      ref="trigger"
      type="button"
      class="ui-course-switcher__trigger"
      :aria-label="label"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="panelId"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="ui-course-switcher__trigger-icon" aria-hidden="true">
        <slot v-if="current" name="icon" :option="current" :selected="true" place="trigger">
          <span class="ui-course-switcher__fallback">{{ current.label.slice(0, 2) }}</span>
        </slot>
      </span>
      <span v-if="hasBadge" class="ui-course-switcher__badge" aria-hidden="true">{{ badge }}</span>
      <slot name="trigger-extra" />
    </button>

    <Teleport to="body">
      <div v-if="open" :class="layerClasses" :style="layerStyle">
        <div class="ui-course-switcher__backdrop" @click="close()" />
        <div
          :id="panelId"
          ref="panel"
          class="ui-course-switcher__panel"
          role="dialog"
          tabindex="-1"
          :aria-modal="sheet ? 'true' : undefined"
          :aria-label="panelLabel || label"
          :aria-busy="busy ? 'true' : undefined"
          @keydown="onPanelKey"
          @focusout="onPanelFocusOut"
        >
          <UiChipRow overflow="scroll" :label="tilesLabel" class="ui-course-switcher__tiles">
            <button
              v-for="opt in options"
              :key="opt.value"
              type="button"
              :data-value="opt.value"
              :class="[
                'ui-course-switcher__tile',
                { 'ui-course-switcher__tile--selected': opt.value === model },
              ]"
              :aria-pressed="opt.value === model ? 'true' : 'false'"
              :aria-current="opt.value === model ? 'true' : undefined"
              :aria-disabled="busy && !opt.disabled ? 'true' : undefined"
              :disabled="opt.disabled"
              :tabindex="opt.value === active ? 0 : -1"
              @click="pick(opt)"
              @keydown="onTileKey"
              @focus="active = opt.value"
            >
              <span class="ui-course-switcher__tile-icon" aria-hidden="true">
                <slot name="icon" :option="opt" :selected="opt.value === model" place="tile">
                  <span class="ui-course-switcher__fallback">{{ opt.label.slice(0, 2) }}</span>
                </slot>
              </span>
              <span class="ui-course-switcher__tile-label">{{ opt.label }}</span>
            </button>
          </UiChipRow>
          <div v-if="$slots.detail" class="ui-course-switcher__detail">
            <slot name="detail" :option="current" :close="close" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
