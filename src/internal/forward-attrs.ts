import { useAttrs } from "vue";

/**
 * Reparte los atributos que el consumidor pone en un control envuelto.
 *
 * Un control como UiInput pinta `<span class="ui-input"><input></span>`. Con la
 * herencia de atributos de Vue, todo lo que el consumidor escribe en
 * `<UiInput>` cae en el `<span>`: un `aria-describedby` que el lector de
 * pantalla nunca asocia al campo, un `autocomplete` que el navegador no ve, un
 * `aria-expanded` que no dice nada. Medido el 2026-10-04: 7 de 8 controles lo
 * hacian (hueco G1 del plan de cobertura del dashboard).
 *
 * Con `defineOptions({ inheritAttrs: false })` en el componente y este reparto,
 * `class` y `style` siguen en la envoltura (es lo que se maqueta) y todo lo
 * demas va al elemento nativo.
 *
 * Devuelve funciones y no `computed`: el objeto de `useAttrs()` siempre esta al
 * dia pero no es reactivo, y un `computed` se quedaria con el primero. La
 * plantilla las llama en cada render, que es justo cuando cambian.
 */
export function useForwardedAttrs(fallbackId?: string) {
  const attrs = useAttrs();
  return {
    /** `class` y `style`: para la envoltura. */
    rootAttrs: () => ({ class: attrs.class, style: attrs.style }),
    /** Todo lo demas: para el elemento nativo. */
    controlAttrs: () => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    },
    /** El `id` del control: el del consumidor si lo puso, si no el generado. */
    controlId: () => (typeof attrs.id === "string" && attrs.id ? attrs.id : fallbackId),
  };
}
