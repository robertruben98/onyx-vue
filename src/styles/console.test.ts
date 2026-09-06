import { readFileSync } from "node:fs";
import { join } from "node:path";

// Se resuelve desde la raiz del proyecto, no desde `import.meta.url`: bajo
// jsdom vitest lo reescribe a una URL de navegador y `.pathname` sale como
// "/src/styles/", que no existe en el disco.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");

const console_ = read("console.css");
const dark = read("dark.css");
const tokens = read("tokens.css");
const index = read("index.css");

/** Custom properties assigned inside a file, e.g. `--ui-color-text: ...`. */
function assigned(css: string): Set<string> {
  return new Set(
    [...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]),
  );
}

/** The value a file assigns to a property, whitespace-collapsed. */
function valueOf(css: string, prop: string): string | undefined {
  const m = new RegExp(`^\\s*${prop}\\s*:\\s*([^;]+);`, "m").exec(css);
  return m?.[1].replace(/\s+/g, " ").trim();
}

describe("console preset", () => {
  it("is imported by the token layer", () => {
    // Sin esto el fichero existe y no lo carga nadie.
    expect(index).toContain('@import "./console.css"');
  });

  it("covers every semantic token that the dark preset remaps", () => {
    // El contrato de "preset completo", y se mantiene solo: si alguien anade un
    // semantico a dark.css, este test dice que a console.css le falta. Un
    // preset a medias no falla, que es lo peor que puede hacer — se queda con
    // un token del tema por defecto y saca un gris claro en mitad de la consola.
    const faltan = [...assigned(dark)].filter((t) => !assigned(console_).has(t));
    expect(faltan).toEqual([]);
  });

  it("remaps the state tokens the console look depends on", () => {
    // Los atomos de estado son el vocabulario de la consola: si el preset se
    // deja uno, hereda el valor del tema claro y saca un elemento claro en
    // mitad de una pagina negra. No falla, que es lo peor que puede hacer.
    const exigidos = [
      "--ui-status-dot-off",
      "--ui-status-dot-unknown",
      "--ui-severity-badge-critical-bg",
      "--ui-severity-badge-high-bg",
      "--ui-tri-state-count-quiet",
      "--ui-relative-time-color",
      "--ui-tag-muted-bg",
      "--ui-tag-muted-text",
    ];
    const faltan = exigidos.filter((t) => !assigned(console_).has(t));
    expect(faltan).toEqual([]);
  });

  it("kills every shadow", () => {
    // Sobre #0c0d10 una sombra no se ve y solo ensucia el filete.
    const sombras = [...assigned(tokens)].filter((t) => t.endsWith("-shadow"));
    expect(sombras.length).toBeGreaterThan(0);
    for (const s of sombras) expect(valueOf(console_, s)).toBe("none");
  });

  it("squares the radii scale without rounding off what must stay round", () => {
    // La mayoria de componentes tira de --ui-radii-* directamente, asi que
    // remapear solo --ui-radius habria dejado dialog, card y menu redondeados.
    // El nombre del token viaja dentro del valor comparado: `expect` de dos
    // argumentos no esta en los tipos de vitest 2.x y el typecheck lo rechaza,
    // asi que el diagnostico va en el propio dato.
    const radios = ["--ui-radii-sm", "--ui-radii-md", "--ui-radii-lg", "--ui-radii-xl"];
    const medidos = radios.map((r) => `${r}=${valueOf(console_, r) ?? "AUSENTE"}`);
    const pasados = medidos.filter((m) => {
      const v = parseFloat(m.split("=")[1]);
      return Number.isNaN(v) || v > 4;
    });
    expect(pasados).toEqual([]);
    // El punto de estado, el spinner y el pulgar del switch son redondos por
    // significado: el preset no los toca.
    expect(assigned(console_).has("--ui-radii-full")).toBe(false);
  });

  it("does not reach into component internals to set colour", () => {
    // Un preset re-mapea tokens. El dia que empiece a pintar `.ui-badge` a mano
    // deja de ser un tema y pasa a ser un parche.
    const reglas = [...console_.matchAll(/^([^@\s][^{]*)\{/gm)].map((m) =>
      m[1].trim(),
    );
    for (const sel of reglas) expect(sel).toContain(".ui-theme-console");
    // Lo unico que alcanza a un componente es tipografia de cabecera.
    const dentroDeComponentes = reglas.filter((s) => /\.ui-(?!theme-console)/.test(s));
    for (const sel of dentroDeComponentes) {
      const bloque = console_.slice(console_.indexOf(sel));
      const cuerpo = bloque.slice(bloque.indexOf("{"), bloque.indexOf("}"));
      const pinta = /background|border-color|box-shadow/.test(cuerpo);
      expect(pinta ? sel : null).toBeNull();
    }
  });

  it("documents that the class goes on the root", () => {
    // Dialog, Select, Tooltip, Popover y Menu hacen Teleport to="body": desde un
    // contenedor interior saldrian del ambito y se pintarian con el tema claro.
    expect(console_).toMatch(/Teleport|RAIZ|root/i);
  });
});
