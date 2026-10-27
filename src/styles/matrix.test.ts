import { readFileSync } from "node:fs";
import { join } from "node:path";

// Se resuelve desde la raiz del proyecto, no desde `import.meta.url`: bajo
// jsdom vitest lo reescribe a una URL de navegador y `.pathname` sale como
// "/src/styles/", que no existe en el disco.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");

const matrix = read("matrix.css");
const dark = read("dark.css");
const tokens = read("tokens.css");
const index = read("index.css");

/** Custom properties assigned inside a file, e.g. `--ui-color-text: ...`. */
function assigned(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
}

/**
 * El CSS sin comentarios.
 *
 * Los dos tests de abajo miran selectores y declaraciones, y con los
 * comentarios dentro acaban analizando la prosa: la cabecera de este preset
 * nombra `.ui-card` para explicar por que NO lo pinta, y eso bastaba para que
 * el test lo acusara de pintarlo. El de `console` tiene el mismo agujero y no
 * salta solo porque sus comentarios no nombran ningun selector.
 */
function sinComentarios(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** The value a file assigns to a property, whitespace-collapsed. */
function valueOf(css: string, prop: string): string | undefined {
  const m = new RegExp(`^\\s*${prop}\\s*:\\s*([^;]+);`, "m").exec(css);
  return m?.[1].replace(/\s+/g, " ").trim();
}

describe("matrix preset", () => {
  it("is imported by the token layer", () => {
    // Sin esto el fichero existe y no lo carga nadie.
    expect(index).toContain('@import "./matrix.css"');
  });

  it("covers every semantic token that the dark preset remaps", () => {
    // Mismo contrato que `console`: un preset a medias no falla, se queda con
    // un token del tema por defecto y saca un gris claro en mitad del fosforo.
    const faltan = [...assigned(dark)].filter((t) => !assigned(matrix).has(t));
    expect(faltan).toEqual([]);
  });

  it("never reaches past its own palette for colour", () => {
    // El tema tiene su PROPIA paleta (--ui-matrix-*) y cada semantico cuelga de
    // ella. Un remapeo que tirara de un primitivo generico (--ui-green-400,
    // --ui-red-600...) meteria un segundo verde distinto al del fosforo, y eso
    // no se nota hasta que dos pantallas no concuerdan. La regla no es "que
    // color" sino "de donde sale": de --ui-matrix-* o de otro semantico.
    const genericos = ["slate", "red", "amber", "blue", "green", "emerald"];
    const patron = new RegExp(
      `var\\(--ui-(?:(?:${genericos.join("|")})-[0-9]+|white|black)\\)`,
      "g",
    );
    expect([...matrix.matchAll(patron)].map((m) => m[0])).toEqual([]);
  });

  it("declares every colour it uses either as a palette entry or from the palette", () => {
    // Un hex suelto en la zona de semanticos es la forma silenciosa de que se
    // cuele un septimo verde que nadie puso en la paleta. Los unicos hex del
    // fichero son los de los primitivos --ui-matrix-*; el resto va por var().
    const zonaSemantica = matrix.slice(matrix.indexOf("--- semanticos"));
    const hexSueltos = [...zonaSemantica.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(
      (m) => m[0],
    );
    expect(hexSueltos).toEqual([]);
  });

  it("kills every shadow", () => {
    // Sobre #040705 una sombra no se ve; la jerarquia la da --ui-matrix-glow,
    // que es luz que sale y no sombra que cae.
    const sombras = [...assigned(tokens)].filter((t) => t.endsWith("-shadow"));
    expect(sombras.length).toBeGreaterThan(0);
    for (const s of sombras) expect(valueOf(matrix, s)).toBe("none");
  });

  it("squares the radii scale without rounding off what must stay round", () => {
    // Remapear solo --ui-radius habria dejado dialog, card y menu redondeados,
    // porque tiran de --ui-radii-* directamente. El nombre del token viaja
    // dentro del valor comparado: `expect` de dos argumentos no esta en los
    // tipos de vitest 2.x, asi que el diagnostico va en el propio dato.
    const radios = [
      "--ui-radii-sm",
      "--ui-radii-md",
      "--ui-radii-lg",
      "--ui-radii-xl",
    ];
    const medidos = radios.map((r) => `${r}=${valueOf(matrix, r) ?? "AUSENTE"}`);
    const pasados = medidos.filter((m) => {
      const v = parseFloat(m.split("=")[1]);
      return Number.isNaN(v) || v > 2;
    });
    expect(pasados).toEqual([]);
    // El punto de estado, el spinner y el pulgar del switch son redondos por
    // significado: el preset no los toca.
    expect(assigned(matrix).has("--ui-radii-full")).toBe(false);
  });

  it("does not reach into component internals to set colour", () => {
    // Un preset re-mapea tokens. Aqui estuvo a punto de colarse: las escuadras
    // de HUD se dibujaban con `border-color` sobre `.ui-card` desde esta hoja.
    // Eso es un parche con forma de tema, y por eso viven en UiHudFrame.
    const css = sinComentarios(matrix);
    const reglas = [...css.matchAll(/^([^@\s][^{]*)\{/gm)].map((m) =>
      m[1].trim(),
    );
    for (const sel of reglas) expect(sel).toContain(".ui-theme-matrix");
    const dentroDeComponentes = reglas.filter((s) =>
      /\.ui-(?!theme-matrix)/.test(s),
    );
    for (const sel of dentroDeComponentes) {
      const bloque = css.slice(css.indexOf(sel));
      const cuerpo = bloque.slice(bloque.indexOf("{"), bloque.indexOf("}"));
      const pinta = /background|border-color|box-shadow/.test(cuerpo);
      expect(pinta ? sel : null).toBeNull();
    }
  });

  it("keeps the atmosphere out of the theme", () => {
    // La lluvia y las scanlines son componentes que se ponen donde se quieran.
    // Si acabaran aqui, activar el tema en cualquier pagina le colgaria un
    // canvas animado detras sin que nadie lo hubiera pedido.
    expect(sinComentarios(matrix)).not.toMatch(/@keyframes|animation:|canvas/i);
  });

  it("documents that the class goes on the root", () => {
    // Dialog, Select, Tooltip, Popover y Menu hacen Teleport to="body": desde un
    // contenedor interior saldrian del ambito y se pintarian con el tema claro.
    expect(matrix).toMatch(/Teleport|RAIZ|root/i);
  });

  it("paints the page ground", () => {
    // Sin esto el preset seria solo color de componente: los componentes
    // saldrian oscuros sobre el fondo blanco que ponga el consumidor.
    expect(valueOf(matrix, "background-color")).toBe("var(--ui-matrix-void)");
  });
});
