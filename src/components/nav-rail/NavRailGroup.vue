<script setup lang="ts">
import "./nav-rail.scss";

defineProps<{
  /** Heading for the group. */
  label: string;
}>();
</script>

<template>
  <div class="ui-nav-rail__group">
    <div class="ui-nav-rail__group-head">
      <span class="ui-nav-rail__group-label">{{ label }}</span>
      <!--
        El control del grupo vive en su cabecera y no encima del rail: lo que
        ordena es esta lista, y ponerlo mas arriba lo desliga de lo que cambia.
      -->
      <slot name="trailing" />
    </div>
    <slot />
  </div>
</template>
