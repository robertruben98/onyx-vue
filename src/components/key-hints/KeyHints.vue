<script lang="ts">
/** One shortcut and what it does. */
export interface KeyHint {
  /** The key or keys, as typed: `j k`, `enter`, `1-7`. */
  keys: string;
  /** What pressing them does. */
  action: string;
}
</script>

<script setup lang="ts">
import "./key-hints.scss";

withDefaults(
  defineProps<{
    /** The shortcuts, in the order they should be scanned. */
    hints: KeyHint[];
    /** Accessible name for the list. */
    label?: string;
  }>(),
  {
    label: "Keyboard shortcuts",
  },
);
</script>

<template>
  <!--
    Una lista de verdad y no una fila de spans: son pares clave/significado, y
    un lector de pantalla que los recorre necesita saber donde acaba uno y
    empieza el siguiente.
  -->
  <div class="ui-key-hints">
    <dl class="ui-key-hints__list" :aria-label="label">
      <div v-for="hint in hints" :key="hint.keys" class="ui-key-hints__hint">
        <dt class="ui-key-hints__keys">
          <kbd>{{ hint.keys }}</kbd>
        </dt>
        <dd class="ui-key-hints__action">{{ hint.action }}</dd>
      </div>
    </dl>
    <span class="ui-key-hints__gap" />
    <slot name="trailing" />
  </div>
</template>
