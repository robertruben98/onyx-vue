import { DOC_CATEGORIES } from "@onyx/vue";
import { COMPONENT_DOCS } from "./registry";
import { PATTERN_DOCS } from "./patterns/registry";

/** A single navigable entry in the sidebar. */
export interface NavItem {
  /** Router path (absolute). */
  path: string;
  /** Display label. */
  label: string;
}

/** A titled group of nav entries. */
export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * La unica fuente de la navegacion. La barra lateral pinta esto y el router
 * saca sus rutas de componente de {@link COMPONENT_DOCS}.
 *
 * "Getting Started" son las tres guias escritas a mano; "Patterns" y
 * "Components" salen de sus registros de metadatos (`*.pattern.ts` y
 * `*.docs.ts`), asi que reflejan exactamente lo que hay — no las paginas que
 * alguien se haya acordado de escribir.
 */
export const NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { path: "/introduction", label: "Introduction" },
      { path: "/installation", label: "Installation" },
      { path: "/theming", label: "Theming" },
    ],
  },
  {
    // Paginas enteras montadas con la libreria. No son la documentacion de un
    // componente: son la prueba de que los componentes componen, que es lo que
    // una pagina por componente nunca llega a ensenar.
    title: "Patterns",
    items: PATTERN_DOCS.map((p) => ({
      path: `/patterns/${p.id}`,
      label: p.title,
    })),
  },
  // Un grupo por categoria, en el orden de DOC_CATEGORIES. Cien componentes en
  // una lista alfabetica plana no se pueden recorrer.
  ...DOC_CATEGORIES.map((category) => ({
    title: category,
    items: COMPONENT_DOCS.filter((d) => d.category === category).map((d) => ({
      path: `/components/${d.id}`,
      label: d.title,
    })),
  })).filter((section) => section.items.length > 0),
];
