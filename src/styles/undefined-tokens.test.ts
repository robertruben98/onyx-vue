import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(src);
const styleFiles = files.filter((f) => /\.(css|scss|vue)$/.test(f));
// Tokens may also be set at runtime (`style` bindings in .vue / .ts).
const definitionFiles = files.filter((f) => /\.(css|scss|vue|ts)$/.test(f) && !f.endsWith(".test.ts"));

const defined = new Set<string>();
for (const f of definitionFiles) {
  for (const m of readFileSync(f, "utf8").matchAll(/(--ui-[a-z0-9-]+)["']?\s*[:,]/g)) defined.add(m[1]);
}

/** `var(--ui-x)` with NO fallback: an undefined one makes the declaration invalid. */
function strictUses(): Map<string, string[]> {
  const uses = new Map<string, string[]>();
  for (const f of styleFiles) {
    for (const m of readFileSync(f, "utf8").matchAll(/var\(\s*(--ui-[a-z0-9-]+)\s*\)/g)) {
      uses.set(m[1], [...(uses.get(m[1]) ?? []), f.slice(src.length + 1)]);
    }
  }
  return uses;
}

describe("design tokens", () => {
  it("defines every --ui-* token that is referenced without a fallback", () => {
    const missing = [...strictUses()]
      .filter(([name]) => !defined.has(name))
      .map(([name, where]) => `${name} (used in ${[...new Set(where)].join(", ")})`);
    expect(missing).toEqual([]);
  });

  it("the detector catches an undefined token", () => {
    expect(defined.has("--ui-space-6")).toBe(true);
    expect(defined.has("--ui-this-token-does-not-exist")).toBe(false);
  });

  it("extends the space scale to 10", () => {
    const css = readFileSync(join(src, "styles", "tokens.css"), "utf8");
    const scale: Record<string, string> = {
      6: "1.5rem",
      7: "2rem",
      8: "2.5rem",
      9: "3rem",
      10: "4rem",
    };
    for (const [n, v] of Object.entries(scale)) {
      expect(css).toMatch(new RegExp(`--ui-space-${n}:\\s*${v.replace(".", "\\.")};`));
    }
  });
});
