import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PATTERN_DOCS, measureOf, sourcesOf } from "./registry";

// jsdom reescribe `import.meta.url`, asi que la ruta sale de cwd (vitest corre
// desde la raiz del paquete), como en docs-model.test.ts.
const PATTERNS = join(process.cwd(), "docs", "src", "patterns");

const folders = readdirSync(PATTERNS, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("contrato de los patterns", () => {
  it("cada carpeta tiene su fichero de metadatos", () => {
    const missing = folders.filter(
      (f) => !existsSync(join(PATTERNS, f, `${f}.pattern.ts`)),
    );
    expect(missing).toEqual([]);
  });

  it("el id de cada pattern es el nombre de su carpeta", () => {
    expect(PATTERN_DOCS.map((p) => p.id).sort()).toEqual([...folders].sort());
  });

  it("cada pattern tiene al menos un .vue que medir", () => {
    const empty = PATTERN_DOCS.filter(
      (p) => Object.keys(sourcesOf(p.id)).length === 0,
    ).map((p) => p.id);
    expect(empty).toEqual([]);
  });

  // Un pattern se copia. Un control nativo sin explicar se copia como si fuera
  // la forma buena de hacerlo, asi que cada uno tiene que estar cubierto por un
  // hueco declarado en sus notas.
  it.each(PATTERN_DOCS.map((p) => [p.id, p] as const))(
    "%s: los nativos medidos cuadran con los huecos declarados",
    (_id, p) => {
      // Las ubicaciones viajan en el objeto para que el diff las ensene.
      const natives = measureOf(p.id).nativeControls.map(
        (n) => `${n.file}:${n.line} <${n.tag}>`,
      );
      const declared = p.notes.gaps.reduce((n, g) => n + g.natives, 0);
      expect({ declared, natives }).toEqual({
        declared: natives.length,
        natives,
      });
    },
  );
});
