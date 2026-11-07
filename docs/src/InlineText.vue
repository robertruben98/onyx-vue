<script setup lang="ts">
import { computed } from "vue";
import { splitInline } from "./inline";

const props = defineProps<{ text: string }>();
const parts = computed(() => splitInline(props.text));
</script>

<template>
  <template v-for="(part, i) in parts" :key="i"
    ><code v-if="part.code">{{ part.text }}</code
    ><template v-else>{{ part.text }}</template></template
  >
</template>
