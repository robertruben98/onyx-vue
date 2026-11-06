import { readFileSync } from "node:fs";
import { join } from "node:path";

// jsdom cannot compute colour contrast, so axe skips it. This resolves the tone
// tokens through their var() chains per preset and checks 4.5:1 (WCAG AA)
// between each tone's text colour and the surface a note sits on.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  return css.slice(start, css.indexOf("\n}", start));
}
function vars(css: string): Record<string, string> {
  return Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
const tokens = vars(read("tokens.css"));
const consoleVars = vars(block(read("console.css"), ".ui-theme-console"));

const themes: [string, Record<string, string>[]][] = [
  ["light", [tokens]],
  ["console", [tokens, consoleVars]],
];

function resolve(layers: Record<string, string>[], name: string): string {
  const value = [...layers].reverse().find((l) => name in l)?.[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  return ref ? resolve(layers, ref[1]) : value;
}
type Rgb = [number, number, number];
function parse(colour: string): Rgb {
  let c = colour.trim();
  if (/^#[0-9a-f]{3}$/i.test(c)) c = `#${[...c.slice(1)].map((x) => x + x).join("")}`;
  if (!/^#[0-9a-f]{6}$/i.test(c)) throw new Error(`not a literal colour: ${colour}`);
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as Rgb;
}
const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const scss = readFileSync(join(process.cwd(), "src", "components", "note", "note.scss"), "utf8");
const TONES: [string, string][] = [
  ["muted", "--ui-color-text-muted"],
  ["success", "--ui-color-success"],
  ["warning", "--ui-color-warning"],
  ["danger", "--ui-color-danger"],
];

describe("UiNote tone contrast", () => {
  it.each(themes)("every tone reaches 4.5:1 on the surface in %s", (_n, layers) => {
    const surface = parse(resolve(layers, "--ui-color-surface"));
    const fails: string[] = [];
    for (const [tone, token] of TONES) {
      // The stylesheet must actually use the token this test resolves.
      const rule = tone === "muted" ? /\.ui-note\s*\{[^}]*\}/s : new RegExp(`\\.ui-note--${tone}\\s*\\{[^}]*\\}`, "s");
      expect(scss.match(rule)?.[0] ?? "").toContain(`var(${token})`);
      const r = ratio(parse(resolve(layers, token)), surface);
      if (r < 4.5) fails.push(`${tone} ${r.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });
});
