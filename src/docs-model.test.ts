import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@vue/compiler-dom";
import * as onyx from "./index";
import type { ApiRow, ComponentDoc } from "./docs-model";

// jsdom reescribe `import.meta.url` a una URL de navegador, asi que la ruta
// sale de cwd (vitest corre desde la raiz del paquete).
const COMPONENTES = join(process.cwd(), "src", "components");

const directorios = readdirSync(COMPONENTES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const docs = Object.entries(onyx)
  .filter(([n]) => n.endsWith("Doc"))
  .map(([, v]) => v as ComponentDoc);

describe("contrato de la documentacion", () => {
  // El motivo entero de haber portado el mecanismo: antes habia 7 paginas para
  // 22 componentes y las 15 que faltaban no fallaban en ningun sitio. Este test
  // es el que hace que faltar una sea un error.
  it("todos los componentes tienen su fichero de metadatos", () => {
    const sin = directorios.filter(
      (n) => !existsSync(join(COMPONENTES, n, `${n}.docs.ts`)),
    );
    expect(sin).toEqual([]);
  });

  it("todos los metadatos estan exportados por el indice", () => {
    expect(docs.length).toBe(directorios.length);
  });

  it("los ids son unicos y en kebab-case", () => {
    const ids = docs.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it("cada id casa con el directorio de su componente", () => {
    const ids = new Set(docs.map((d) => d.id));
    expect([...ids].sort()).toEqual([...directorios].sort());
  });

  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: titulo, descripcion, imports, api y demos con contenido",
    (_id, doc) => {
      expect(doc.title.trim()).not.toBe("");
      expect(doc.description.trim()).not.toBe("");
      expect(doc.imports.length).toBeGreaterThan(0);
      expect(doc.api.length).toBeGreaterThan(0);
      expect(doc.demos.length).toBeGreaterThan(0);
    },
  );

  // Un import de mentira en el snippet es de lo peor que puede tener una
  // documentacion: se copia, se pega y no compila en el proyecto de quien lee.
  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: lo que dice importar existe en la libreria",
    (_id, doc) => {
      const exportados = new Set(Object.keys(onyx));
      const inventados = doc.imports.filter((n) => !exportados.has(n));
      expect(inventados).toEqual([]);
    },
  );

  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: cada fila de API esta completa",
    (_id, doc) => {
      const incompletas = doc.api.filter((r: ApiRow) =>
        [r.name, r.type, r.default, r.description].some(
          (v) => typeof v !== "string" || v.trim() === "",
        ),
      );
      expect(incompletas).toEqual([]);
    },
  );

  // Las demos se compilan en caliente: una plantilla rota no rompe el build,
  // rompe la pagina en el navegador. Aqui se compilan todas de una vez.
  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: todas las plantillas de demo compilan",
    (_id, doc) => {
      for (const demo of doc.demos) {
        expect(() =>
          compile(`<div>${demo.code}</div>`, { onError: (e) => { throw e; } }),
        ).not.toThrow();
      }
    },
  );

  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: los titulos de demo no se repiten (son la clave del v-for)",
    (_id, doc) => {
      const titulos = doc.demos.map((d) => d.title);
      expect(new Set(titulos).size).toBe(titulos.length);
    },
  );

  // `setup()` se llama una vez por demo montada; si lanza, la pagina entera
  // del componente se cae.
  it.each(docs.map((d) => [d.id, d] as const))(
    "%s: el setup de cada demo devuelve datos sin lanzar",
    (_id, doc) => {
      for (const demo of doc.demos) {
        if (!demo.setup) continue;
        const datos = demo.setup();
        expect(typeof datos).toBe("object");
      }
    },
  );
});
