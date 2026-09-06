// Component docs registry — the "fan-out contract".
//
// Every component documentation page lives in `./pages/components/*Page.vue`
// and is a self-contained module. Rather than maintaining a hand-written list
// (which drifts every time a page is added), the registry is generated at build
// time from a glob of those page modules. Drop a new `XPage.vue` into the
// folder and it is automatically registered, routed and shown in the sidebar.
//
// The route segment / page id is derived from the file name:
//   `BadgePage.vue`      -> `badge`
//   `RadioGroupPage.vue` -> `radio-group`
// and the display title is the PascalCase component name with spaces.

import type { Component } from "vue";

/** A single registered component documentation page. */
export interface ComponentDoc {
  /** Route segment / page id (kebab-case), e.g. `radio-group`. */
  id: string;
  /** Sidebar / page display title, e.g. `Radio Group`. */
  title: string;
  /** Async component loader for the page module. */
  loader: () => Promise<{ default: Component }>;
}

// Lazy glob of every component page module. Keys look like
// `/src/pages/components/BadgePage.vue` (or `../pages/...` depending on the
// resolver); we normalise off the file name only.
const pageModules = import.meta.glob<{ default: Component }>(
  "./pages/components/*Page.vue",
);

/** Turn `RadioGroupPage.vue` (basename) into a kebab-case id: `radio-group`. */
function fileNameToId(fileName: string): string {
  return fileName
    .replace(/Page\.vue$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/** Turn `RadioGroupPage.vue` (basename) into a title: `Radio Group`. */
function fileNameToTitle(fileName: string): string {
  return fileName
    .replace(/Page\.vue$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/** Basename of a glob key, regardless of the leading path the resolver uses. */
function baseName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

/**
 * Single source of truth for the documented components. Built once from the
 * glob, sorted alphabetically by title so the sidebar order is stable and
 * does not depend on filesystem iteration order.
 */
export const COMPONENT_DOCS: ComponentDoc[] = Object.entries(pageModules)
  .map(([path, loader]) => {
    const file = baseName(path);
    return {
      id: fileNameToId(file),
      title: fileNameToTitle(file),
      loader,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** Look up a registered page by its route id. */
export function getComponentDoc(id: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find((d) => d.id === id);
}
