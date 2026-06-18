<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import "./menu.scss";

export interface MenuItem {
  /** Stable identifier for the action. */
  id?: string;
  /** Visible label. */
  label: string;
  /** Whether the item is disabled. */
  disabled?: boolean;
}

let nextMenuId = 0;

const props = withDefaults(
  defineProps<{
    /** Menu items. */
    items?: MenuItem[];
  }>(),
  {
    items: () => [],
  },
);

/** Emitted with the chosen item on activation. */
const emit = defineEmits<{ itemSelect: [item: MenuItem] }>();

const menuId = `ui-menu-${nextMenuId++}`;
const open = ref(false);

const triggerEl = ref<HTMLButtonElement | null>(null);
const panelEl = ref<HTMLDivElement | null>(null);

const panelStyle = ref<Record<string, string>>({});

/** Enabled menuitem buttons currently in the panel. */
function itemElements(): HTMLButtonElement[] {
  const el = panelEl.value;
  if (!el) return [];
  return Array.from(
    el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'),
  );
}

function positionPanel(): void {
  const trigger = triggerEl.value;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  panelStyle.value = {
    position: "fixed",
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
  };
}

async function openMenu(): Promise<void> {
  open.value = true;
  await nextTick();
  positionPanel();
  itemElements()[0]?.focus();
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
  emit("itemSelect", item);
  close();
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
            role="menuitem"
            class="ui-menu__item"
            tabindex="-1"
            :disabled="item.disabled || undefined"
            @click="activate(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </template>
    </Teleport>
  </span>
</template>
