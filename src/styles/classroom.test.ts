import { readFileSync } from "node:fs";
import { join } from "node:path";

// Desde la raiz del proyecto, como console.test.ts: bajo jsdom `import.meta.url`
// no apunta al disco.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");

const classroom = read("classroom.css");
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

const light = block(classroom, ".ui-theme-classroom");
const night = block(classroom, ".ui-theme-classroom.app-dark");

describe("classroom preset", () => {
  it("is imported by the token layer", () => {
    expect(index).toContain('@import "./classroom.css"');
  });

  it("covers every semantic token that the dark preset remaps, in both modes", () => {
    // Un preset a medias no falla: se queda con el token del tema por defecto.
    // Aqui hay dos modos, asi que el contrato se pide dos veces.
    const semanticos = [...assigned(dark)];
    expect(semanticos.filter((t) => !assigned(light).has(t))).toEqual([]);
    expect(semanticos.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("night mode redefines every palette primitive of the day mode", () => {
    // Un primitivo olvidado de noche es un color de dia en mitad de la pagina
    // oscura: el subrayador amarillo claro sobre azul noche, por ejemplo.
    const primitivos = [...assigned(light)].filter((t) => t.startsWith("--ui-classroom-"));
    expect(primitivos.length).toBeGreaterThan(10);
    expect(primitivos.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("never reaches past its own palette for colour", () => {
    // Igual que console: el color sale de --ui-classroom-* o de un literal del
    // propio fichero, nunca del primitivo generico de la libreria.
    const genericos = ["slate", "red", "amber", "blue", "green", "emerald"];
    const patron = new RegExp(`var\\(--ui-(?:(?:${genericos.join("|")})-[0-9]+|white|black)\\)`, "g");
    expect([...classroom.matchAll(patron)].map((m) => m[0])).toEqual([]);
  });

  it("titles read as lesson headings, not console labels", () => {
    // app-bar.scss y section-header.scss ponen uppercase; el preset lo quita.
    expect(classroom).toMatch(/\.ui-theme-classroom \.ui-section-header__title[^{]*\{[^}]*text-transform: none/);
    expect(light).toContain("--ui-app-bar-title-size: 1.25rem");
  });

  it("paints the page floor so the preset is a whole look", () => {
    expect(light).toContain("background-color: var(--ui-classroom-paper)");
  });
});
