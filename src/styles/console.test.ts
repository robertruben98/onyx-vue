import { existsSync, readdirSync, readFileSync } from "node:fs";
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

  it("never reaches past its own palette for colour", () => {
    // "el color reservado para el estado: verde/ambar/rojo/azul y nada mas"
    // (cabecera del fichero): la consola tiene su PROPIA paleta de doce
    // colores (--ui-console-*) y cada semantico ya cuelga de ella. Si un
    // remapeo tira en cambio de un primitivo generico (--ui-red-600,
    // --ui-slate-400...) mete un segundo rojo de "danger" distinto al de
    // --ui-console-down, y nadie lo nota hasta que dos pantallas no
    // concuerdan. La regla no es "que color", es "de donde sale el color":
    // de --ui-console-* o de otro semantico ya remapeado, nunca del generico.
    const genericos = ["slate", "red", "amber", "blue", "green", "emerald"];
    const patron = new RegExp(
      `var\\(--ui-(?:(?:${genericos.join("|")})-[0-9]+|white|black)\\)`,
      "g",
    );
    const encontrados = [...console_.matchAll(patron)].map((m) => m[0]);
    expect(encontrados).toEqual([]);
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

describe("capas de las superficies teletransportadas", () => {
  // Dialog, Menu, Select, Popover y Tooltip se pintan en `body`. Sus hojas
  // pedian un z-index por token y ningun sitio lo definia: la declaracion salia
  // invalida, el valor caia en `auto`, y una cabecera pegajosa con `z-index: 20`
  // se pintaba encima de un modal.
  const capas = [
    "--ui-overlay-z",
    "--ui-dialog-z",
    "--ui-menu-z",
    "--ui-popover-z",
    "--ui-tooltip-z",
  ];

  it.each(capas)("%s esta definido", (token) => {
    expect(assigned(tokens).has(token)).toBe(true);
  });

  it("todos los z-index que piden los componentes existen como token", () => {
    const dir = join(process.cwd(), "src", "components");
    const usados = new Set<string>();
    for (const componente of readdirSync(dir)) {
      const hoja = join(dir, componente, `${componente}.scss`);
      if (!existsSync(hoja)) continue;
      const css = readFileSync(hoja, "utf8");
      for (const m of css.matchAll(/z-index:[^;]*var\((--[\w-]+)/g)) {
        usados.add(m[1]);
      }
    }
    const sinDefinir = [...usados].filter((t) => !assigned(tokens).has(t));
    expect(sinDefinir).toEqual([]);
  });

  it("un modal queda por debajo de lo que se abre desde dentro de el", () => {
    // Un select o un menu abiertos DENTRO de un dialogo tienen que verse.
    const valor = (t: string) => Number(valueOf(tokens, t));
    expect(valor("--ui-dialog-z")).toBeGreaterThan(valor("--ui-overlay-z"));
    expect(valor("--ui-menu-z")).toBeGreaterThan(valor("--ui-dialog-z"));
    expect(valor("--ui-tooltip-z")).toBeGreaterThan(valor("--ui-menu-z"));
  });
});
