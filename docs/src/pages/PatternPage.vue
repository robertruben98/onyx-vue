<script setup lang="ts">
// La pagina de un pattern. UNA para todos, como ComponentPage.
//
// Tres partes: la vista previa en un iframe, la fuente de cada `.vue` y la caja
// "Build notes" con lo que costo montarlo.
//
// El iframe no es decoracion. Un pattern es una pagina entera: muchos usan
// UiAppShell, que mide `100vh`, y dentro del layout de la doc ese alto seria el
// de la ventana entera y no el del marco. En el iframe, `100vh` es el alto del
// marco. La ruta del marco (`/patterns/<id>/frame`) pinta el pattern sin la
// barra lateral, y es tambien el enlace "Open in a new tab".
import { computed } from "vue";
import type { KpiItem } from "@onyx/vue";
import { filesOf, measureOf, patternById } from "../patterns/registry";

const props = defineProps<{ id: string }>();

const pattern = computed(() => patternById(props.id));
const measure = computed(() => measureOf(props.id));
const sources = computed(() => Object.entries(filesOf(props.id)));
const frameSrc = computed(() => `/patterns/${props.id}/frame`);

const kpis = computed<KpiItem[]>(() => {
  const m = measure.value;
  const notes = pattern.value?.notes;
  return [
    {
      label: "Onyx coverage",
      value: m.coverage === null ? "—" : `${m.coverage}%`,
      sub: `${m.onyxTags} onyx tags · ${m.nativeControls.length} native`,
      tone: m.nativeControls.length === 0 ? "success" : "warning",
    },
    {
      label: "Onyx components",
      value: m.distinctOnyx.length,
      sub: "distinct, across the page",
    },
    {
      label: "Custom CSS",
      value: m.customCssLines,
      sub: `lines in ${m.files} ${m.files === 1 ? "file" : "files"}`,
      tone: "muted",
    },
    {
      label: "Build time",
      value: notes?.minutes == null ? "—" : `${notes.minutes} min`,
      sub: notes?.minutes == null ? "not measured" : "wall clock, to verified",
      tone: notes?.minutes == null ? "muted" : "default",
    },
  ];
});
</script>

<template>
  <article v-if="pattern" class="pattern">
    <h1>{{ pattern.title }}</h1>
    <p class="pattern__lead">{{ pattern.summary }}</p>

    <UiPanel title="Build notes" :count="`built ${pattern.notes.builtOn}`">
      <div class="pattern__notes">
        <UiKpiStrip :items="kpis" label="What it took" />

        <p class="pattern__by">
          Built by {{ pattern.notes.builtBy }}. Numbers above are computed from
          the source shown below, not typed in.
        </p>

        <div class="pattern__tags" aria-label="Onyx components used">
          <UiTag v-for="c in measure.distinctOnyx" :key="c" appearance="outline">
            {{ c }}
          </UiTag>
        </div>

        <UiAlert
          v-for="(gap, i) in pattern.notes.gaps"
          :key="i"
          variant="warning"
          appearance="band"
          :title="gap.natives ? `Gap · ${gap.natives} native` : 'Gap'"
        >
          {{ gap.summary }}
          <template v-if="gap.issue">
            Tracked in <a :href="gap.issue">{{ gap.issue }}</a>.
          </template>
        </UiAlert>

        <UiAlert
          v-if="!pattern.notes.gaps.length"
          variant="success"
          appearance="band"
          title="No gaps"
        >
          Everything on this page comes from the library.
        </UiAlert>

        <p v-if="pattern.notes.takeaway" class="pattern__by">
          {{ pattern.notes.takeaway }}
        </p>
      </div>
    </UiPanel>

    <UiTabs aria-label="Pattern" class="pattern__tabs">
      <UiTab label="Preview">
        <div class="pattern__frame-head">
          <a :href="frameSrc" target="_blank" rel="noopener">Open in a new tab</a>
        </div>
        <iframe
          class="pattern__frame"
          :src="frameSrc"
          :title="`${pattern.title} preview`"
          :style="{ height: `${pattern.frameHeight}px` }"
        />
      </UiTab>
      <UiTab label="Source">
        <div class="pattern__sources">
          <UiCodeBlock
            v-for="[file, text] in sources"
            :key="file"
            :label="file"
            :text="text"
            max-height="36rem"
          />
        </div>
      </UiTab>
    </UiTabs>
  </article>

  <article v-else class="pattern">
    <h1>Not found</h1>
    <p class="pattern__lead">There is no pattern called <code>{{ id }}</code>.</p>
  </article>
</template>

<style scoped>
h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}
.pattern__lead {
  margin: 0 0 1.5rem;
  max-width: 62ch;
  font-size: 1.05rem;
  color: var(--ui-color-text-muted);
}
.pattern__notes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pattern__by {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ui-color-text-muted);
}
.pattern__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pattern__tabs {
  margin-top: 1.5rem;
}
.pattern__frame-head {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
  font-size: 0.875rem;
}
.pattern__frame {
  display: block;
  width: 100%;
  border: var(--ui-border-width, 1px) solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  background: var(--docs-page-bg);
}
.pattern__sources {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}
</style>
