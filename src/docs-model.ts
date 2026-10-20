/**
 * El modelo de documentacion de un componente.
 *
 * Portado del que usa la libreria de Angular (`@onyx/ui/docs-model`), y por la
 * misma razon: alli el sitio de documentacion NO tiene una pagina por
 * componente, tiene UNA plantilla generica alimentada por estos metadatos, que
 * viven junto al componente. La consecuencia es la que importa: anadir un
 * componente anade su pagina, y una pagina no puede quedarse sin escribir.
 *
 * La version en Vue de esto tenia una pagina `.vue` a mano por componente y
 * habia 7 de 22.
 */

/** Una fila de la tabla de API: prop, evento o slot. */
export interface ApiRow {
  /** Nombre. Los eventos van como `@nombre` y los slots como `#nombre`. */
  name: string;
  /** Tipo tal como se muestra, p. ej. `'primary' | 'secondary'`. */
  type: string;
  /** Valor por defecto, o `—` cuando no aplica. */
  default: string;
  description: string;
}

/**
 * Un ejemplo vivo.
 *
 * `code` es a la vez lo que se ensena en el panel de codigo y la plantilla que
 * se compila para pintarlo: no hay dos fuentes que puedan separarse. Esa es la
 * propiedad que se copia de la lib de Angular, donde el `code` de la demo es
 * literalmente el template del componente que se renderiza.
 */
export interface Demo {
  title: string;
  description?: string;
  /** Plantilla Vue. Los componentes `Ui*` estan registrados globalmente. */
  code: string;
  /** Datos que la plantilla usa (filas, opciones, estado). */
  setup?: () => Record<string, unknown>;
}

/** Todo lo que hace falta para pintar la pagina de un componente. */
export interface ComponentDoc {
  /** Segmento de ruta en kebab-case, p. ej. `radio-group`. */
  id: string;
  /** Nombre visible, p. ej. `Radio Group`. */
  title: string;
  /** Una a tres frases. */
  description: string;
  /** Exports que hay que importar para los ejemplos, en orden de aparicion. */
  imports: string[];
  api: ApiRow[];
  demos: Demo[];
}
