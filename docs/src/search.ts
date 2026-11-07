import { COMPONENT_DOCS } from "./registry";
import { NAV } from "./nav";

/** One thing the search can open. */
export interface SearchEntry {
  label: string;
  /** Router path. */
  path: string;
  /** Group shown next to the label: a component category or a docs section. */
  group: string;
  /** Extra text that also matches (the id, the group). */
  keywords: string;
}

/** Every navigable page: the guides, the patterns and each documented component. */
export function searchEntries(): SearchEntry[] {
  const category = new Map(COMPONENT_DOCS.map((d) => [`/components/${d.id}`, d.category]));
  return NAV.flatMap((section) =>
    section.items.map((item) => ({
      label: item.label,
      path: item.path,
      group: section.title,
      keywords: `${item.path.split("/").pop() ?? ""} ${category.get(item.path) ?? section.title}`.toLowerCase(),
    })),
  );
}

const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, " ").trim();

/**
 * Case-insensitive search over the label, id and group. Titles that start with
 * the query rank first, then titles with a word that starts with it, then any
 * other match; ties keep the sidebar order. An empty query returns everything.
 */
export function searchDocs(query: string): SearchEntry[] {
  const q = normalize(query);
  const entries = searchEntries();
  if (!q) return entries;
  const scored: Array<[number, number, SearchEntry]> = [];
  entries.forEach((entry, index) => {
    const label = normalize(entry.label);
    let score: number;
    if (label.startsWith(q)) score = 0;
    else if (label.split(" ").some((w) => w.startsWith(q))) score = 1;
    else if (label.includes(q)) score = 2;
    else if (normalize(entry.keywords).includes(q)) score = 3;
    else return;
    scored.push([score, index, entry]);
  });
  return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((s) => s[2]);
}
