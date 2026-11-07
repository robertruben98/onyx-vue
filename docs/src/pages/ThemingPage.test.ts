import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import * as onyx from "../../../src/index";
import ThemingPage from "./ThemingPage.vue";

const STYLES = join(process.cwd(), "src", "styles");
const css = readdirSync(STYLES)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(STYLES, f), "utf8"))
  .join("\n");
const defined = new Set([...css.matchAll(/(--ui-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const presets = [...new Set([...css.matchAll(/\.ui-theme-([a-z]+)/g)].map((m) => m[1]))];

function renderPage() {
  return render(ThemingPage, {
    global: { components: { UiDataTable: onyx.UiDataTable, UiPanel: onyx.UiPanel, UiButton: onyx.UiButton, UiTag: onyx.UiTag } },
  });
}

describe("Theming page", () => {
  it("only names --ui-* tokens that exist in src/styles", () => {
    const { container } = renderPage();
    // Text node by text node: textContent would glue neighbouring table cells.
    const text: string[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) text.push(walker.currentNode.nodeValue ?? "");
    const used = [...new Set(text.join("\n").match(/--ui-[a-z0-9]+(?:-[a-z0-9]+)*/g))];
    expect(used.length).toBeGreaterThan(10);
    expect(used.filter((t) => !defined.has(t))).toEqual([]);
  });

  it("lists every preset the stylesheets define", () => {
    expect(presets.sort()).toEqual(["acme", "chat", "classroom", "console", "matrix", "pocket"]);
    const { container } = renderPage();
    for (const p of presets) {
      expect(container.querySelector(`[data-preset="${p}"]`)).toBeTruthy();
    }
  });

  it("has a token table generated from tokens.css", () => {
    const { container } = renderPage();
    const tables = [...container.querySelectorAll('table[aria-label$=" token values"]')];
    expect(tables.length).toBeGreaterThanOrEqual(4);
    const rows = tables.flatMap((t) => [...t.querySelectorAll("tbody tr td:first-child")].map((td) => td.textContent));
    expect(rows).toContain("--ui-color-primary");
    expect(rows).toContain("--ui-radius");
    expect(rows).toContain("--ui-space-4");
  });
});
