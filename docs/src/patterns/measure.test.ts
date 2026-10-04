import { measurePattern, measureSource } from "./measure";

const SFC = `<script setup lang="ts">
// Un comentario que menciona <template> y <button> no cuenta.
const x = "<UiButton>";
</script>

<template>
  <UiPanel title="t">
    <!-- <button>comentado</button> -->
    <template v-if="x">
      <ui-status-dot state="live" />
    </template>
    <button type="button">nativo</button>
    <UiButton>uno</UiButton>
    <UiButton>dos</UiButton>
  </UiPanel>
  <input v-model="y" />
</template>

<style scoped>
/* comentario
   de dos lineas */
.a {
  color: red;

}
</style>
`;

describe("measureSource", () => {
  const m = measureSource(SFC);

  it("cuenta las etiquetas onyx, en PascalCase y en kebab-case", () => {
    expect(m.onyxTags).toBe(4);
    expect(m.distinctOnyx).toEqual(["UiButton", "UiPanel", "UiStatusDot"]);
  });

  it("cuenta los nativos con su linea del fichero, sin los comentados", () => {
    expect(m.nativeControls).toEqual([
      { tag: "button", line: 12 },
      { tag: "input", line: 16 },
    ]);
  });

  it("no lee la plantilla dentro del script", () => {
    // El `<UiButton>` del script y el `<button>` de su comentario no suman.
    expect(m.onyxTags).toBe(4);
  });

  it("cuenta el CSS propio sin lineas vacias ni comentarios", () => {
    expect(m.customCssLines).toBe(3);
  });

  it("una fuente sin plantilla no rompe", () => {
    expect(measureSource("<script>const a = 1;</script>")).toEqual({
      onyxTags: 0,
      distinctOnyx: [],
      nativeControls: [],
      customCssLines: 0,
    });
  });
});

describe("measurePattern", () => {
  it("suma ficheros, etiqueta cada nativo con el suyo y calcula la cobertura", () => {
    const p = measurePattern({ "A.vue": SFC, "B.vue": SFC });
    expect(p.files).toBe(2);
    expect(p.onyxTags).toBe(8);
    expect(p.nativeControls.map((n) => n.file)).toEqual([
      "A.vue",
      "A.vue",
      "B.vue",
      "B.vue",
    ]);
    // 8 / (8 + 4) = 66.7 %
    expect(p.coverage).toBe(66.7);
  });

  it("sin onyx ni nativos la cobertura es null, no 0 ni 100", () => {
    expect(measurePattern({}).coverage).toBeNull();
  });
});
