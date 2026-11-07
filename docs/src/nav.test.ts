import { DOC_CATEGORIES } from "@lib/docs-model";
import { COMPONENT_DOCS } from "./registry";
import { NAV } from "./nav";

describe("sidebar navigation", () => {
  it("groups the components by category, in the declared order, losing none", () => {
    const groups = NAV.filter((s) => (DOC_CATEGORIES as readonly string[]).includes(s.title));
    expect(groups.map((g) => g.title)).toEqual(
      DOC_CATEGORIES.filter((c) => COMPONENT_DOCS.some((d) => d.category === c)),
    );
    const paths = groups.flatMap((g) => g.items.map((i) => i.path));
    expect(paths.sort()).toEqual(COMPONENT_DOCS.map((d) => `/components/${d.id}`).sort());
  });

  it("every documented component names a valid category", () => {
    for (const d of COMPONENT_DOCS) expect(DOC_CATEGORIES).toContain(d.category);
  });
});
