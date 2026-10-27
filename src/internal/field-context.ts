import { getCurrentInstance, inject, onBeforeUnmount, provide, type InjectionKey, type Ref } from "vue";

/**
 * Lo que un UiFormField sabe de su control: el id al que apunta su etiqueta,
 * los ids de la ayuda y el error para `aria-describedby`, y si es invalido u
 * obligatorio.
 *
 * Antes iba solo por el slot, y cada campo repetia tres bindings en su
 * control (`:id`, `:aria-describedby`, `:invalid`): el pattern de clientes lo
 * midio. Ahora el campo lo publica y el control lo recoge solo; lo que el
 * consumidor pase a mano sigue ganando, y el slot sigue dando lo mismo.
 */
export interface FieldContext {
  id: string;
  describedBy: Ref<string | undefined>;
  invalid: Ref<boolean>;
  required: Ref<boolean>;
}

interface FieldHost extends FieldContext {
  claim(uid: number): boolean;
  release(uid: number): void;
}

const FIELD: InjectionKey<FieldHost> = Symbol("ui-form-field");

/** UiFormField: publica el campo para el control que tenga dentro. */
export function provideField(field: FieldContext): void {
  let owner: number | null = null;
  provide(FIELD, {
    ...field,
    // Un campo, un control: el primero que lo pide se lo queda. Un segundo
    // control dentro del mismo campo no hereda el id (seria un id repetido).
    claim(uid) {
      if (owner === null || owner === uid) {
        owner = uid;
        return true;
      }
      return false;
    },
    release(uid) {
      if (owner === uid) owner = null;
    },
  });
}

/** Un control de formulario: el campo que lo envuelve, si lo hay y es suyo. */
export function useField(): FieldContext | null {
  const host = inject(FIELD, null);
  const instance = getCurrentInstance();
  if (!host || !instance) return null;
  const uid = instance.uid;
  if (!host.claim(uid)) return null;
  onBeforeUnmount(() => host.release(uid));
  return host;
}
