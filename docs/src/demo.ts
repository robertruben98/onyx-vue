import type { Component } from "vue";
import type { Demo } from "@onyx/vue";

/**
 * Un componente por demo.
 *
 * Los datos de `setup` viajan por `data()` para que sean reactivos: una demo
 * con `v-model` tiene que poder cambiar en pantalla. Los componentes `Ui*`
 * estan registrados globalmente en main.ts, que es lo que hace que
 * `<UiButton>` signifique algo dentro de una plantilla compilada al vuelo.
 */
export function demoComponent(demo: Demo): Component {
  const datos = demo.setup ? demo.setup() : {};
  return {
    data: () => ({ ...datos }),
    template: `<div class="demo__preview">${demo.code}</div>`,
  };
}
