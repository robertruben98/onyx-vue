<script setup lang="ts">
import { computed } from "vue";
import UiCheckbox from "../checkbox/Checkbox.vue";
import "./check-tree.scss";

/** Una hoja del arbol: algo que cuenta, o que deja de contar. */
export interface CheckTreeNode {
  key: string;
  label: string;
  /** Lo que hay que saber del nodo sin abrir nada: un recuento, una ruta. */
  note?: string;
}

/** Un grupo y lo que cuelga de el. Sin `items` es una hoja de primer nivel. */
export interface CheckTreeGroup extends CheckTreeNode {
  items?: CheckTreeNode[];
}

withDefaults(
  defineProps<{
    groups: CheckTreeGroup[];
    /** Accessible name of the whole list. */
    label?: string;
    /** What to say when there is nothing to choose from. */
    emptyText?: string;
  }>(),
  { label: "", emptyText: "" },
);

/**
 * The keys that are OFF — the exceptions, never the full selection.
 *
 * A list of what is excluded is what makes tomorrow's new item count by
 * default; a stored list of what is included would silently drop it.
 */
const excluded = defineModel<string[]>("excluded", { default: () => [] });

const emit = defineEmits<{ toggled: [key: string, on: boolean] }>();

const off = computed(() => new Set(excluded.value));

function itemsOf(group: CheckTreeGroup): CheckTreeNode[] {
  return group.items ?? [];
}

function groupOn(group: CheckTreeGroup): boolean {
  return !off.value.has(group.key);
}

/** Una hoja solo cuenta si su grupo cuenta: el grupo manda sobre ella. */
function itemOn(group: CheckTreeGroup, item: CheckTreeNode): boolean {
  return groupOn(group) && !off.value.has(item.key);
}

/**
 * Un grupo del que ya no cuenta todo, pero todavia cuenta algo. Sin el guion,
 * la casilla del grupo afirmaria "todo" o "nada" teniendo delante un "algunos".
 */
function groupPartial(group: CheckTreeGroup): boolean {
  return groupOn(group) && itemsOf(group).some((i) => off.value.has(i.key));
}

function apply(next: Set<string>): void {
  excluded.value = [...next];
}

function toggleGroup(group: CheckTreeGroup, on: boolean): void {
  const next = new Set(off.value);
  // Marcar el grupo cuenta el grupo ENTERO: las excepciones que tuviera dentro
  // se van con el. Si no, una casilla marcada dejaria fuera cosas sin decirlo.
  for (const item of itemsOf(group)) next.delete(item.key);
  if (on) next.delete(group.key);
  else next.add(group.key);
  apply(next);
  emit("toggled", group.key, on);
}

function toggleItem(group: CheckTreeGroup, item: CheckTreeNode, on: boolean): void {
  const next = new Set(off.value);
  if (on) next.delete(item.key);
  else next.add(item.key);
  // Quitada la ultima hoja, lo apagado es el grupo. Guardarlo asi es lo que
  // hace que un elemento que aparezca manana dentro herede la decision en vez
  // de colarse en un grupo que el usuario ya habia dejado a cero.
  if (!on && itemsOf(group).every((i) => next.has(i.key))) {
    for (const i of itemsOf(group)) next.delete(i.key);
    next.add(group.key);
  }
  apply(next);
  emit("toggled", item.key, on);
}
</script>

<template>
  <div class="ui-check-tree" role="group" :aria-label="label || undefined">
    <div
      v-for="group in groups"
      :key="group.key"
      class="ui-check-tree__group"
      role="group"
      :aria-label="group.label"
    >
      <div class="ui-check-tree__row ui-check-tree__row--group">
        <UiCheckbox
          :model-value="groupOn(group)"
          :indeterminate="groupPartial(group)"
          :label="group.label"
          @update:model-value="toggleGroup(group, $event)"
        />
        <span class="ui-check-tree__gap" />
        <span v-if="group.note" class="ui-check-tree__note">{{ group.note }}</span>
      </div>

      <div v-if="itemsOf(group).length" class="ui-check-tree__items">
        <div
          v-for="item in itemsOf(group)"
          :key="item.key"
          :class="[
            'ui-check-tree__row',
            { 'ui-check-tree__row--muted': !groupOn(group) },
          ]"
        >
          <UiCheckbox
            size="sm"
            :model-value="itemOn(group, item)"
            :disabled="!groupOn(group)"
            :label="item.label"
            @update:model-value="toggleItem(group, item, $event)"
          />
          <span class="ui-check-tree__gap" />
          <span v-if="item.note" class="ui-check-tree__note">{{ item.note }}</span>
        </div>
      </div>
    </div>

    <p v-if="!groups.length && emptyText" class="ui-check-tree__empty">
      {{ emptyText }}
    </p>
  </div>
</template>
