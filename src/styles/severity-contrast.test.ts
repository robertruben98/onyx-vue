import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every rung of UiSeverityBadge has to be readable: 4.5:1 (WCAG AA) between its
// text and its fill, in the default light and dark themes and in pocket, day
// and night. The English trainer's own "low" badge was 3.74:1. The tokens are
// resolved through their var() chains, layered the way the classes stack, and
// translucent fills are composited over the surface they sit on.
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
const dark = vars(block(read("dark.css"), ".app-dark"));
const pocket = read("pocket.css");
const pocketDay = vars(block(pocket, ".ui-theme-pocket"));
const pocketNight = vars(block(pocket, ".ui-theme-pocket.app-dark"));

const themes: [string, Record<string, string>[]][] = [
  ["light", [tokens]],
  ["dark", [tokens, dark]],
  ["pocket", [tokens, pocketDay]],
  ["pocket night", [tokens, dark, pocketDay, pocketNight]],
];

function resolve(layers: Record<string, string>[], name: string): string {
  const value = [...layers].reverse().find((l) => name in l)?.[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  return ref ? resolve(layers, ref[1]) : value;
}

type Rgb = [number, number, number];
function parse(colour: string): { rgb: Rgb; alpha: number } {
  let c = colour.trim();
  if (/^#[0-9a-f]{3}$/i.test(c)) c = `#${[...c.slice(1)].map((x) => x + x).join("")}`;
  if (/^#[0-9a-f]{6}$/i.test(c)) {
    return { rgb: [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as Rgb, alpha: 1 };
  }
  const m = /^rgba?\(([^)]*)\)$/.exec(c);
  if (!m) throw new Error(`not a literal colour: ${colour}`);
  const n = m[1].split(",").map(Number);
  return { rgb: [n[0], n[1], n[2]], alpha: n[3] ?? 1 };
}
const over = (top: string, under: Rgb): Rgb => {
  const { rgb, alpha } = parse(top);
  return rgb.map((v, i) => alpha * v + (1 - alpha) * under[i]) as Rgb;
};
const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const levels = ["very-high", "critical", "high", "moderate", "low", "very-low", "unknown"];

describe("severity badge contrast", () => {
  it.each(themes)("every level reaches 4.5:1 in %s", (_, layers) => {
    const surface = parse(resolve(layers, "--ui-color-surface")).rgb;
    const fails: string[] = [];
    for (const level of levels) {
      const bg = over(resolve(layers, `--ui-severity-badge-${level}-bg`), surface);
      const fg = over(resolve(layers, `--ui-severity-badge-${level}-text`), bg);
      const r = ratio(fg, bg);
      if (r < 4.5) fails.push(`${level}: ${r.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });

  it("pocket disabled text reaches 3:1 on the disabled fill, day and night", () => {
    for (const layers of [themes[2][1], themes[3][1]]) {
      const bg = parse(resolve(layers, "--ui-color-disabled-bg")).rgb;
      const fg = parse(resolve(layers, "--ui-color-disabled-text")).rgb;
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
    }
  });
});
