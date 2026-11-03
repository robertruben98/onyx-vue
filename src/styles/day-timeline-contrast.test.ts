import { readFileSync } from "node:fs";
import { join } from "node:path";

// The bands of UiDayTimeline are graphical objects the reader needs (WCAG 1.4.11):
// each --ui-band-* must reach 3:1 against the surface it sits on, in the default
// light and dark themes and in the chat preset, day and night.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  return css.slice(start, css.indexOf("\n}", start));
}
const vars = (css: string): Record<string, string> =>
  Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const tokens = vars(read("tokens.css"));
const dark = vars(block(read("dark.css"), ".app-dark"));
const chat = read("chat.css");
const chatNight = vars(block(chat, ".ui-theme-chat"));
const chatDay = vars(block(chat, ".ui-theme-chat.app-light"));

const themes: [string, Record<string, string>[]][] = [
  ["light", [tokens]],
  ["dark", [tokens, dark]],
  ["chat night", [tokens, chatNight]],
  ["chat day", [tokens, chatNight, chatDay]],
];

function resolve(layers: Record<string, string>[], name: string): string {
  const value = [...layers].reverse().find((l) => name in l)?.[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  return ref ? resolve(layers, ref[1]) : value;
}
type Rgb = [number, number, number];
function hex(c: string): Rgb {
  if (!/^#[0-9a-f]{6}$/i.test(c)) throw new Error(`not a hex colour: ${c}`);
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as Rgb;
}
const lum = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("day timeline band contrast", () => {
  it.each(themes)("every --ui-band-* reaches 3:1 against the surface in %s", (_, layers) => {
    const surface = hex(resolve(layers, "--ui-color-surface"));
    const fails: string[] = [];
    for (const band of ["free", "likely", "busy", "past", "nodata"]) {
      const r = ratio(hex(resolve(layers, `--ui-band-${band}`)), surface);
      if (r < 3) fails.push(`${band}: ${r.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });
});
