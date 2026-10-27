// Lo que cuesta montar un pattern con la libreria, medido sobre su fuente.
//
// Los numeros de la caja "Build notes" NO se escriben a mano: se calculan del
// `.vue` que se esta ensenando. Un numero tecleado se queda viejo en cuanto
// alguien toca la pagina; uno calculado no puede.
//
// Es la misma metrica que usa el dashboard (control-panel, plan "Onyx Full
// Coverage"): una etiqueta `Ui*` cuenta como onyx, y uno de los controles
// nativos de abajo cuenta como algo que la libreria no cubrio. Lo demas
// (`div`, `span`, `svg`, texto) es maquetacion y no entra en la cuenta.

/** Elementos nativos que onyx podria sustituir. */
export const NATIVE_CONTROLS = [
  "button",
  "input",
  "select",
  "textarea",
  "table",
  "dialog",
  "details",
  "progress",
] as const;

export interface NativeHit {
  tag: string;
  /** Linea (desde 1) dentro de su fichero. */
  line: number;
  file?: string;
}

export interface SourceMeasure {
  onyxTags: number;
  /** Componentes onyx distintos, ordenados. */
  distinctOnyx: string[];
  nativeControls: NativeHit[];
  /** Lineas de CSS propio: no vacias y fuera de comentarios. */
  customCssLines: number;
}

export interface PatternMeasure extends SourceMeasure {
  files: number;
  /** Porcentaje 0-100, o null si no hay ni onyx ni nativos. */
  coverage: number | null;
}

const ONYX_TAG = /<(Ui[A-Z][A-Za-z0-9]*|ui-[a-z][a-z0-9-]*)/g;
const NATIVE_TAG = new RegExp(`<(${NATIVE_CONTROLS.join("|")})\\b`, "g");

/** Sustituye cada caracter de un bloque por un espacio, conservando los saltos. */
function blank(text: string): string {
  return text.replace(/[^\n]/g, " ");
}

function lineAt(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function toPascal(tag: string): string {
  if (!tag.startsWith("ui-")) return tag;
  return tag.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
}

/**
 * Mide un SFC. La plantilla es el bloque `<template>` de primer nivel, el que
 * empieza a principio de linea; termina en el ULTIMO `</template>` a principio
 * de linea, porque un `<template v-if>` anidado cierra antes y cortar por el
 * primero dejaria media pagina fuera. Anclar a la columna 0 evita que una
 * mencion a `<template>` en un comentario del script cuente como inicio.
 */
export function measureSource(source: string): SourceMeasure {
  const start = source.search(/^<template[\s>]/m);
  const closers = [...source.matchAll(/^<\/template>/gm)];
  const end = closers.length ? (closers.at(-1)?.index ?? -1) : -1;
  const distinct = new Set<string>();
  const nativeControls: NativeHit[] = [];
  let onyxTags = 0;

  if (start !== -1 && end > start) {
    // Comentarios en blanco y no borrados, para que los numeros de linea sigan
    // siendo los del fichero.
    const template =
      blank(source.slice(0, start)) +
      source.slice(start, end).replace(/<!--[\s\S]*?-->/g, blank);
    for (const m of template.matchAll(ONYX_TAG)) {
      onyxTags++;
      distinct.add(toPascal(m[1]));
    }
    for (const m of template.matchAll(NATIVE_TAG)) {
      nativeControls.push({ tag: m[1], line: lineAt(template, m.index ?? 0) });
    }
  }

  let customCssLines = 0;
  for (const m of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, "");
    customCssLines += css.split("\n").filter((l) => l.trim() !== "").length;
  }

  return {
    onyxTags,
    distinctOnyx: [...distinct].sort(),
    nativeControls,
    customCssLines,
  };
}

/** Suma las medidas de todos los `.vue` de un pattern, por nombre de fichero. */
export function measurePattern(sources: Record<string, string>): PatternMeasure {
  const distinct = new Set<string>();
  const nativeControls: NativeHit[] = [];
  let onyxTags = 0;
  let customCssLines = 0;

  for (const [file, source] of Object.entries(sources)) {
    const m = measureSource(source);
    onyxTags += m.onyxTags;
    customCssLines += m.customCssLines;
    m.distinctOnyx.forEach((c) => distinct.add(c));
    nativeControls.push(...m.nativeControls.map((n) => ({ ...n, file })));
  }

  const total = onyxTags + nativeControls.length;
  return {
    files: Object.keys(sources).length,
    onyxTags,
    distinctOnyx: [...distinct].sort(),
    nativeControls,
    customCssLines,
    coverage: total === 0 ? null : Math.round((onyxTags / total) * 1000) / 10,
  };
}
