import { COMPONENT_DOCS } from "./registry";

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
 * "Getting Started" son las tres guias escritas a mano; "Components" sale del
 * registro de metadatos, asi que refleja exactamente los `*.docs.ts` que hay
 * en la libreria — no las paginas que alguien se haya acordado de escribir.
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
    title: "Components",
    items: COMPONENT_DOCS.map((d) => ({
      path: `/components/${d.id}`,
      label: d.title,
    })),
  },
];
