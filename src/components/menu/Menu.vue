<script setup lang="ts">
import { isDev } from "../../internal/dev";
import { useDeprecatedEvents } from "../../internal/deprecated-events";

import { computed, nextTick, ref, useId, watch } from "vue";
import "./menu.scss";

export interface MenuItem {
  /** Stable identifier for the action. */
  id?: string;
  /** Visible label. */
  label: string;
  /** Whether the item is disabled. */
  disabled?: boolean;
  /**
   * Checked state. Leave it out for a plain action (`menuitem`); set it, true
   * or false, for an option that toggles (`menuitemcheckbox` + `aria-checked`).
   */
  checked?: boolean;
}

// Sin asignar a una variable: en `<script setup>` las props llegan solas a la
// plantilla, y este binding no lo leia nadie. Solo se notaba desde fuera, al
// tipar la libreria con `noUnusedLocals`.
withDefaults(
  defineProps<{
    /** Menu items. */
    items?: MenuItem[];
    /**
     * Accessible name of the trigger (`aria-label` and `title`). Needed when the
     * slot is only a glyph, such as "⋯"; leave it out when the slot is text.
     */
    label?: string;
  }>(),
  {
    items: () => [],
    label: undefined,
  },
);

/** Emitted with the chosen item on activation. */
const emit = defineEmits<{
  itemSelected: [item: MenuItem];
  /** @deprecated Use `itemSelected`; still emitted until 1.0. */
  itemSelect: [item: MenuItem];
}>();

const uid = useId();
const menuId = `ui-menu-${uid}`;
const open = ref(false);

const triggerEl = ref<HTMLButtonElement | null>(null);
const panelEl = ref<HTMLDivElement | null>(null);

const panelStyle = ref<Record<string, string>>({});

/** Enabled menuitem buttons currently in the panel. */
function itemElements(): HTMLButtonElement[] {
  const el = panelEl.value;
  if (!el) return [];
  return Array.from(
    el.querySelectorAll<HTMLButtonElement>('.ui-menu__item:not([disabled])'),
  );
}

const EDGE = 8; // px libres hasta el borde de la ventana

/**
 * Debajo del boton y alineado a su izquierda, salvo que no quepa: entonces se
 * alinea a su derecha (un menu de cuenta en la esquina se salia de la pantalla y
 * cortaba el email) y, si tampoco cabe debajo, se abre hacia arriba.
 */
function positionPanel(): void {
  const trigger = triggerEl.value;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  const panel = panelEl.value?.getBoundingClientRect();
  const width = panel?.width ?? 0;
  const height = panel?.height ?? 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.left;
  if (left + width > vw - EDGE) left = Math.max(EDGE, Math.min(rect.right, vw - EDGE) - width);
  const top = rect.bottom + height > vh - EDGE && rect.top - height >= EDGE ? rect.top - height : rect.bottom;
  panelStyle.value = { position: "fixed", top: `${top}px`, left: `${left}px` };
}

async function openMenu(): Promise<void> {
  open.value = true;
  await nextTick();
  // Dos pasadas: hasta estar "fixed" el panel mide lo que el body (todo el ancho);
  // ya colocado mide lo suyo, y con eso se decide si cabe a la derecha.
  positionPanel();
  await nextTick();
  positionPanel();
  // El foco, cuando el panel YA esta en su sitio: antes estaba aun al final del
  // body y el navegador desplazaba la pagina hasta alli al enfocarlo.
  await nextTick();
  itemElements()[0]?.focus({ preventScroll: true });
}

function close(): void {
  if (!open.value) return;
  open.value = false;
  triggerEl.value?.focus();
}

function toggle(): void {
  if (open.value) {
    close();
  } else {
    void openMenu();
  }
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    if (!open.value) void openMenu();
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  const items = itemElements();
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLButtonElement);
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      items[(current + 1) % items.length].focus();
      break;
    case "ArrowUp":
      event.preventDefault();
      items[(current - 1 + items.length) % items.length].focus();
      break;
    case "Home":
      event.preventDefault();
      items[0].focus();
      break;
    case "End":
      event.preventDefault();
      items[items.length - 1].focus();
      break;
    case "Escape":
    case "Tab":
      close();
      break;
  }
}

function activate(item: MenuItem): void {
  if (item.disabled) return;
  emit("itemSelected", item);
  emit("itemSelect", item); // obsoleto, ver src/deprecations.ts
  close();
}

// Un item con `checked` (true o false) es una opcion que se marca, no una accion.
function isCheckable(item: MenuItem): boolean {
  return typeof item.checked === "boolean";
}

const triggerControls = computed(() => (open.value ? menuId : undefined));

// Re-position on scroll/resize while the menu is open.
function onWindowChange(): void {
  if (open.value) positionPanel();
}
watch(open, (isOpen) => {
  if (isOpen) {
    window.addEventListener("scroll", onWindowChange, true);
    window.addEventListener("resize", onWindowChange);
  } else {
    window.removeEventListener("scroll", onWindowChange, true);
    window.removeEventListener("resize", onWindowChange);
  }
});

if (isDev()) useDeprecatedEvents();
</script>

<template>
  <span class="ui-menu">
    <button
      ref="triggerEl"
      type="button"
      class="ui-menu__trigger"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="triggerControls"
      :aria-label="label || undefined"
      :title="label || undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot />
    </button>

    <Teleport to="body">
      <template v-if="open">
        <div class="ui-menu__backdrop" @click="close"></div>
        <div
          :id="menuId"
          ref="panelEl"
          role="menu"
          class="ui-menu__pane ui-menu__panel"
          :style="panelStyle"
          @keydown="onMenuKeydown"
        >
          <button
            v-for="item in items"
            :key="item.id ?? item.label"
            type="button"
            :role="isCheckable(item) ? 'menuitemcheckbox' : 'menuitem'"
            :aria-checked="isCheckable(item) ? (item.checked ? 'true' : 'false') : undefined"
            class="ui-menu__item"
            :class="{ 'ui-menu__item--checkable': isCheckable(item) }"
            tabindex="-1"
            :disabled="item.disabled || undefined"
            @click="activate(item)"
          >
            <span v-if="isCheckable(item)" class="ui-menu__check" aria-hidden="true">✓</span>
            {{ item.label }}
          </button>
        </div>
      </template>
    </Teleport>
  </span>
</template>
