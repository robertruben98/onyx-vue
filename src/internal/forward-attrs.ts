import { useAttrs } from "vue";
import { useField } from "./field-context";

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
export function useForwardedAttrs(fallbackId?: string, options: { field?: boolean } = {}) {
  const attrs = useAttrs();
  // Solo los controles de formulario recogen el campo que los envuelve: un
  // boton dentro de un UiFormField no debe quedarse con el id de su etiqueta.
  const field = options.field ? useField() : null;
  return {
    /** `class` y `style`: para la envoltura. */
    rootAttrs: () => ({ class: attrs.class, style: attrs.style }),
    /** Todo lo demas: para el elemento nativo. */
    controlAttrs: () => {
      const { class: _class, style: _style, ...rest } = attrs;
      // Lo que el campo sabe y el consumidor no dijo. Lo explicito gana.
      if (field) {
        if (rest["aria-describedby"] == null && field.describedBy.value) {
          rest["aria-describedby"] = field.describedBy.value;
        }
        if (rest.required == null && field.required.value) rest.required = true;
        if (rest["aria-invalid"] == null && field.invalid.value) rest["aria-invalid"] = "true";
      }
      return rest;
    },
    /** El `id` del control: el del consumidor, si no el de su campo, si no el generado. */
    controlId: () =>
      typeof attrs.id === "string" && attrs.id ? attrs.id : (field?.id ?? fallbackId),
    /** Si el campo que lo envuelve esta marcado como invalido. */
    fieldInvalid: () => Boolean(field?.invalid.value),
  };
}
