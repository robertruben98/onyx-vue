import type { Component } from "vue";

/**
 * Algo que la libreria no cubrio al montar el pattern.
 *
 * `natives` es cuantos controles nativos del pattern existen POR este hueco. El
 * contrato (patterns.test.ts) exige que la suma cuadre con los nativos medidos:
 * un pattern se copia, y un apaño sin explicar se copia como si fuera la forma
 * buena de hacerlo.
 */
export interface PatternGap {
  /** Lo que falta, en una frase. */
  summary: string;
  /** Controles nativos que quedan por esto (0 si el hueco es de otro tipo). */
  natives: number;
  /** Issue que lo sigue, si lo hay. */
  issue?: string;
}

/** Lo que no se puede medir de la fuente. */
export interface BuildNotes {
  /** Quien lo construyo: una persona o un agente. */
  builtBy: string;
  /** Minutos de reloj hasta verlo funcionando, o null si no se midio. */
  minutes: number | null;
  /** Fecha ISO en que se construyo. */
  builtOn: string;
  gaps: PatternGap[];
  /** Una o dos frases de lo aprendido. */
  takeaway?: string;
}

/** Los metadatos de un pattern: viven en `<carpeta>/<carpeta>.pattern.ts`. */
export interface PatternDoc {
  /** Igual que el nombre de su carpeta; es su segmento de ruta. */
  id: string;
  title: string;
  /** Una a tres frases: que pagina es y que ensena. */
  summary: string;
  /** Orden en la barra lateral (menor primero). */
  order: number;
  /** Alto del marco de vista previa, en px. */
  frameHeight: number;
  /** El componente raiz del pattern, cargado bajo demanda. */
  page: () => Promise<{ default: Component }>;
  notes: BuildNotes;
}
