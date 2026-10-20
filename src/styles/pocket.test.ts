import { readFileSync } from "node:fs";
import { join } from "node:path";

// Desde la raiz del proyecto, como console.test.ts: bajo jsdom `import.meta.url`
// no apunta al disco.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");

const pocket = read("pocket.css");
const dark = read("dark.css");
const index = read("index.css");

/** Custom properties assigned inside a CSS text, e.g. `--ui-color-text: ...`. */
function assigned(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
}

/** The body of the first rule whose selector is exactly `selector`. */
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return "";
  return css.slice(start, css.indexOf("\n}", start));
}

const light = block(pocket, ".ui-theme-pocket");
const night = block(pocket, ".ui-theme-pocket.app-dark");

describe("pocket preset", () => {
  it("is imported by the token layer", () => {
    expect(index).toContain('@import "./pocket.css"');
  });

  it("covers every semantic token that the dark preset remaps, in both modes", () => {
    const semanticos = [...assigned(dark)];
    expect(semanticos.filter((t) => !assigned(light).has(t))).toEqual([]);
    expect(semanticos.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("night mode redefines every palette primitive of the day mode", () => {
    const primitivos = [...assigned(light)].filter((t) => t.startsWith("--ui-pocket-"));
    expect(primitivos.length).toBeGreaterThan(10);
    expect(primitivos.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("never reaches past its own palette for colour", () => {
    const genericos = ["slate", "red", "amber", "blue", "green", "emerald"];
    const patron = new RegExp(`var\\(--ui-(?:(?:${genericos.join("|")})-[0-9]+|white|black)\\)`, "g");
    expect([...pocket.matchAll(patron)].map((m) => m[0])).toEqual([]);
  });

  it("is an app look: pill buttons, 48px controls, translucent bar, no small caps titles", () => {
    expect(light).toContain("--ui-button-radius: var(--ui-radii-full)");
    expect(light).toContain("--ui-size-control-md: 3rem");
    expect(pocket).toMatch(/\.ui-theme-pocket \.ui-app-bar \{[^}]*backdrop-filter/);
    expect(pocket).toMatch(/\.ui-theme-pocket \.ui-section-header__title[^{]*\{[^}]*text-transform: none/);
  });

  it("the press effect respects reduced motion", () => {
    expect(pocket).toMatch(/prefers-reduced-motion: reduce[\s\S]*transform: none/);
  });

  it("paints the page floor so the preset is a whole look", () => {
    expect(light).toContain("background-color: var(--ui-pocket-floor)");
  });
});
