<script setup lang="ts">
import { computed, useSlots, type Component } from "vue";
import { UiTriStateCount, type TriState, type TriStateTone } from "../tri-state-count";
import "./nav-rail.scss";

const props = withDefaults(
  defineProps<{
    /** What the entry navigates to. */
    label: string;
    /** Whether this is the entry the page is currently showing. */
    active?: boolean;
    /** How many things are behind the entry. */
    count?: number | null;
    /** Whether that count is a fact, in flight, or never asked for. */
    countState?: TriState;
    /** Semantic tone of a known count. */
    countTone?: TriStateTone;
    /** Renders a link instead of a button — for an entry that leaves the app. */
    href?: string;
    /** Tooltip: the full name, the shortcut that also gets here. */
    title?: string;
    /**
     * Secondary lines under the label ("37 pending · last 31-10"). A string is
     * one line, an array one line per item; each truncates on its own. The
     * `#meta` slot replaces it.
     */
    meta?: string | string[];
    /**
     * Glyph of an icon-rail entry (a component, e.g. an SVG wrapper). Giving an
     * `icon` prop or `#icon` slot turns the entry into a round icon button: the
     * `label` becomes its accessible name and tooltip instead of visible text.
     */
    icon?: Component;
    /** Count shown as a pill over the icon's corner (icon entries); 99+ above 99. */
    badge?: number | null;
    /** A plain dot over the icon's corner, for "something new" without a number. */
    dot?: boolean;
  }>(),
  {
    active: false,
    count: null,
    countState: "known",
    countTone: "neutral",
    href: "",
    title: "",
    meta: undefined,
    icon: undefined,
    badge: null,
    dot: false,
  },
);

const slots = useSlots();

/** Emitted when a button entry is activated. Links navigate on their own. */
const emit = defineEmits<{ selected: [] }>();

/**
 * An entry that goes somewhere else in the same app is a button, and one that
 * leaves is a real link: middle-click and "open in new tab" have to keep
 * working on the second, and cannot be faked from a click handler.
 */
const isLink = computed(() => props.href.length > 0);

/**
 * Sin nada que contar no se pinta contador.
 *
 * Un `UiTriStateCount` sin valor muestra "·" — "cargando" —, que en una entrada
 * que no cuenta nada (un enlace de vuelta, un ajuste) es una espera que no va a
 * terminar nunca.
 */
const hasCount = computed(
  () => props.count !== null || props.countState !== "known",
);

/** Las lineas de `meta`, sin las vacias: un `""` no debe abrir un hueco bajo el nombre. */
const metaLines = computed(() =>
  (Array.isArray(props.meta) ? props.meta : props.meta ? [props.meta] : []).filter((l) => l !== ""),
);

/**
 * Sin meta la entrada es exactamente la de siempre — mismo DOM, misma altura
 * de una linea —; el bloque de dos pisos solo aparece cuando hay algo que poner
 * en el segundo.
 */
const hasMeta = computed(() => metaLines.value.length > 0 || !!slots.meta);

const isIcon = computed(() => !!props.icon || !!slots.icon);
const badgeText = computed(() =>
  props.badge && props.badge > 0 ? (props.badge > 99 ? "99+" : String(props.badge)) : "",
);
const spokenLabel = computed(() =>
  badgeText.value ? `${props.label}, ${badgeText.value}` : props.label,
);

const rootClasses = computed(() => ({
  "ui-nav-rail__item": true,
  "ui-nav-rail__item--icon": isIcon.value,
  "ui-nav-rail__item--active": props.active,
  "ui-nav-rail__item--meta": hasMeta.value,
}));
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :class="rootClasses"
    :type="isLink ? undefined : 'button'"
    :href="isLink ? href : undefined"
    :title="title || (isIcon ? label : undefined)"
    :aria-label="isIcon ? spokenLabel : undefined"
    :aria-current="active ? 'page' : undefined"
    @click="!isLink && emit('selected')"
  >
    <template v-if="isIcon">
      <span class="ui-nav-rail__glyph" aria-hidden="true">
        <slot name="icon"><component :is="icon" /></slot>
      </span>
      <span v-if="badgeText" class="ui-nav-rail__badge" aria-hidden="true">{{ badgeText }}</span>
      <span v-else-if="dot" class="ui-nav-rail__dot" aria-hidden="true" />
    </template>
    <span v-else-if="hasMeta" class="ui-nav-rail__text">
      <span class="ui-nav-rail__name">{{ label }}</span>
      <span class="ui-nav-rail__meta">
        <slot name="meta">
          <span v-for="(line, i) in metaLines" :key="i" class="ui-nav-rail__meta-line">{{ line }}</span>
        </slot>
      </span>
    </span>
    <span v-else class="ui-nav-rail__name">{{ label }}</span>
    <span v-if="!isIcon" class="ui-nav-rail__marks">
      <!-- Los avisos van ANTES del contador: son lo que hace mirar la fila. -->
      <slot name="marks" />
      <UiTriStateCount
        v-if="hasCount"
        class="ui-nav-rail__count"
        :state="countState"
        :value="count"
        :tone="countTone"
        :label="label"
      />
    </span>
  </component>
</template>
