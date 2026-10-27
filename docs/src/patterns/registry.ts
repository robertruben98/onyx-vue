// El registro de patterns: paginas completas montadas con la libreria.
//
// Mismo mecanismo que el registro de componentes (`../registry.ts`): se globean
// los metadatos (`<carpeta>/<carpeta>.pattern.ts`) y una plantilla los pinta.
// Anadir una carpeta anade su pagina, su ruta y su entrada en la barra lateral.
//
// Ademas se globea la FUENTE de cada `.vue` de la carpeta (`?raw`): es lo que se
// ensena en la pestana "Source" y lo que mide `measure.ts`. Lo que se mide y lo
// que se ensena son el mismo texto.

import { measurePattern, type PatternMeasure } from "./measure";
import type { PatternDoc } from "./types";

const metaModules = import.meta.glob<Record<string, unknown>>(
  "./*/*.pattern.ts",
  { eager: true },
);

// Todo lo que se ensena: los `.vue` y sus datos (`fixtures.ts`), sin los
// metadatos. Solo los `.vue` se miden; un fichero de datos no es maquetacion.
const rawFiles = import.meta.glob<string>(
  ["./*/*.vue", "./*/*.ts", "!./*/*.pattern.ts", "!./*/*.test.ts"],
  { query: "?raw", import: "default", eager: true },
);

function isPatternDoc(v: unknown): v is PatternDoc {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Partial<PatternDoc>;
  return typeof d.id === "string" && typeof d.page === "function";
}

function folderOf(path: string): string {
  return path.split("/")[1] ?? "";
}

/** Todos los patterns, en el orden de la barra lateral. */
export const PATTERN_DOCS: PatternDoc[] = Object.values(metaModules)
  .flatMap((mod) => Object.values(mod))
  .filter(isPatternDoc)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

/** Cada fichero que se ensena de un pattern, por nombre: `.vue` primero. */
export function filesOf(id: string): Record<string, string> {
  const entries = Object.entries(rawFiles)
    .filter(([path]) => folderOf(path) === id)
    .map(([path, text]) => [path.split("/").at(-1) ?? path, text] as const)
    .sort(
      ([a], [b]) =>
        Number(b.endsWith(".vue")) - Number(a.endsWith(".vue")) ||
        a.localeCompare(b),
    );
  return Object.fromEntries(entries);
}

/** La fuente de cada `.vue` de un pattern: lo que se mide. */
export function sourcesOf(id: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filesOf(id)).filter(([file]) => file.endsWith(".vue")),
  );
}

export function patternById(id: string): PatternDoc | undefined {
  return PATTERN_DOCS.find((p) => p.id === id);
}

export function measureOf(id: string): PatternMeasure {
  return measurePattern(sourcesOf(id));
}
