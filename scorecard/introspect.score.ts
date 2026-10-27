// Inventario de la API publica de cada componente, sacado del componente
// compilado y no de su documentacion: props (con tipo y valor por defecto),
// eventos y slots. Es la base de los aspectos "Documentation" y "API".
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as onyx from "../src/index";
import type { ComponentDoc } from "../src/docs-model";

interface PropInfo {
  name: string;
  types: string[];
  required: boolean;
  hasDefault: boolean;
  default?: unknown;
}

export interface ComponentInfo {
  exportName: string;
  file: string;
  props: PropInfo[];
  emits: string[];
  slots: string[];
  inheritAttrs: boolean;
}

function typeNames(type: unknown): string[] {
  const list = Array.isArray(type) ? type : type ? [type] : [];
  return list.map((t) => (typeof t === "function" ? t.name : String(t)));
}

function slotsOf(source: string): string[] {
  const names = new Set<string>();
  for (const m of source.matchAll(/<slot\b([^>]*)>/g)) {
    const attrs = m[1];
    const dynamic = attrs.match(/(?:v-bind)?:name="([^"]+)"/);
    const literal = attrs.match(/(?<![:\w-])name="([^"]+)"/);
    if (dynamic) names.add(`[${dynamic[1]}]`);
    else if (literal) names.add(literal[1]);
    else names.add("default");
  }
  return [...names].sort();
}

it("introspect", () => {
  const out: ComponentInfo[] = [];
  for (const [exportName, value] of Object.entries(onyx)) {
    if (!exportName.startsWith("Ui")) continue;
    const c = value as Record<string, unknown>;
    const file = String(c.__file ?? "");
    const rawProps = (c.props ?? {}) as Record<string, Record<string, unknown>>;
    // `defineModel` anade una prop `<modelo>Modifiers` por cada v-model: es
    // plomeria de Vue, no API del componente.
    const models = new Set(Object.keys(rawProps));
    const props = Object.entries(rawProps)
      .filter(([name]) => !(name.endsWith("Modifiers") && models.has(name.replace(/Modifiers$/, "") || "modelValue")) && name !== "modelModifiers")
      .map(([name, def]) => {
      const d = def ?? {};
      const info: PropInfo = {
        name,
        types: typeNames(d.type ?? d),
        required: Boolean(d.required),
        hasDefault: "default" in d,
      };
      if ("default" in d && typeof d.default !== "function") info.default = d.default;
      return info;
    });
    const rawEmits = c.emits ?? [];
    const emits = Array.isArray(rawEmits) ? rawEmits.map(String) : Object.keys(rawEmits);
    out.push({
      exportName,
      file: file.split("/src/")[1] ?? file,
      props,
      emits,
      slots: file ? slotsOf(readFileSync(file, "utf8")) : [],
      inheritAttrs: c.inheritAttrs !== false,
    });
  }
  // Los metadatos de documentacion: que exports documenta cada pagina, que
  // filas tiene su tabla de API y cuantas demos ensena.
  const docs = Object.entries(onyx)
    .filter(([n, v]) => n.endsWith("Doc") && typeof v === "object" && v && "demos" in v)
    .map(([, v]) => {
      const d = v as ComponentDoc;
      return {
        id: d.id,
        imports: d.imports,
        api: d.api.map((r) => r.name),
        demos: d.demos.length,
        description: d.description,
      };
    });
  const dir = join(process.cwd(), "scorecard", ".out");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "introspect.json"), JSON.stringify(out, null, 2));
  writeFileSync(join(dir, "docs.json"), JSON.stringify(docs, null, 2));
  expect(out.length).toBeGreaterThan(0);
});
