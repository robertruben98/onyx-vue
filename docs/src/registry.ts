// El registro de la documentacion de componentes.
//
// Antes esto globeaba `pages/components/*Page.vue`: una pagina `.vue` escrita a
// mano por componente. Con ese reparto habia 7 paginas para 22 componentes, y
// las 15 que faltaban no fallaban en ningun sitio — simplemente no estaban.
//
// Ahora globea los METADATOS, que viven junto a cada componente
// (`src/components/<x>/<x>.docs.ts`), y una sola plantilla los pinta. Es como
// funciona la libreria de Angular, y la propiedad que se busca es esa: anadir
// un componente anade su pagina, y no hay forma de olvidarse de escribirla.

import type { ComponentDoc } from "@onyx/vue";

// `eager` a proposito: son 22 objetos de metadatos, no 22 componentes. Cargarlos
// perezosamente obligaria a que la barra lateral esperase a resolver promesas
// para saber que existe.
const modulos = import.meta.glob<Record<string, unknown>>(
  "../../src/components/*/*.docs.ts",
  { eager: true },
);

function esDoc(v: unknown): v is ComponentDoc {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Partial<ComponentDoc>;
  return typeof d.id === "string" && Array.isArray(d.demos);
}

/** Todos los componentes documentados, por titulo. */
export const COMPONENT_DOCS: ComponentDoc[] = Object.values(modulos)
  .flatMap((mod) => Object.values(mod))
  .filter(esDoc)
  .sort((a, b) => a.title.localeCompare(b.title));

export function docPorId(id: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find((d) => d.id === id);
}
