import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");
const comp = (p: string) => readFileSync(join(process.cwd(), "src", "components", p), "utf8");

const PRESETS = ["console", "matrix", "classroom", "pocket", "chat"];

/** The declarations of the first rule whose selector matches `selector` exactly. */
function rule(css: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?:^|\\})\\s*${esc}\\s*\\{([^}]*)\\}`, "m").exec(css);
  return m?.[1] ?? "";
}
const prop = (decls: string, name: string) =>
  new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(decls)?.[1].replace(/\s+/g, " ").trim();

describe("body and data font-family tokens", () => {
  it.each(PRESETS)("preset %s defines both role tokens", (name) => {
    const css = read(`${name}.css`);
    expect(prop(rule(css, `.ui-theme-${name}`), "--ui-font-family-body")).toBeTruthy();
    expect(prop(rule(css, `.ui-theme-${name}`), "--ui-font-family-data")).toBeTruthy();
  });

  it.each(PRESETS)("preset %s keeps --ui-font-family as an alias of body", (name) => {
    const decls = rule(read(`${name}.css`), `.ui-theme-${name}`);
    expect(prop(decls, "--ui-font-family")).toBe("var(--ui-font-family-body)");
  });

  it("console is all-monospace by default (body and data identical, both mono)", () => {
    const decls = rule(read("console.css"), ".ui-theme-console");
    const body = prop(decls, "--ui-font-family-body")!;
    expect(body).toMatch(/monospace/);
    expect(prop(decls, "--ui-font-family-data")).toMatch(/monospace/);
    expect(prop(decls, "font-family")).toBe("var(--ui-font-family-body)");
  });

  it('console data-typography="mixed" switches body to a sans stack and keeps data mono', () => {
    const css = read("console.css");
    const decls = rule(css, '.ui-theme-console[data-typography="mixed"],\n.ui-theme-console [data-typography="mixed"]');
    expect(decls).not.toBe("");
    const body = prop(decls, "--ui-font-family-body")!;
    expect(body).toMatch(/sans-serif/);
    expect(body).not.toMatch(/monospace/);
    expect(prop(decls, "--ui-font-family-data")).toMatch(/monospace/);
    expect(prop(decls, "font-family")).toBe("var(--ui-font-family-body)");
    expect(prop(decls, "--ui-font-family")).toBe("var(--ui-font-family-body)");
  });

  it("data components read the data token", () => {
    expect(comp("code-block/code-block.scss")).toMatch(/var\(--ui-font-family-data/);
    expect(comp("log-lines/log-lines.scss")).toMatch(/font-family:\s*var\(--ui-font-family-data/);
    expect(comp("data-table/data-table.scss")).toMatch(/ui-dt__cell--mono\s*\{[^}]*var\(--ui-font-family-data/);
    expect(comp("tag/tag.scss")).toMatch(/ui-tag--mono\s*\{[^}]*var\(--ui-font-family-data/);
  });
});
