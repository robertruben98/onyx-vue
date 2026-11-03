import { readFileSync } from "node:fs";
import { join } from "node:path";

// UiWeekBlocks: a block fill is a graphical object (WCAG 1.4.11) and must reach 3:1
// against the column it sits on; the block text must reach 4.5:1 against the fill.
// Checked in the default light and dark themes and in the chat preset, day (the default) and night (`.app-dark`).
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
const chatDay = vars(block(chat, ".ui-theme-chat"));
const chatNight = vars(block(chat, ".ui-theme-chat.app-dark"));

const themes: [string, Record<string, string>[]][] = [
  ["light", [tokens]],
  ["dark", [tokens, dark]],
  ["chat day", [tokens, chatDay]],
  ["chat night", [tokens, dark, chatDay, chatNight]],
];

function resolve(layers: Record<string, string>[], name: string): string {
  const value = [...layers].reverse().find((l) => name in l)?.[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  const out = ref ? resolve(layers, ref[1]) : value;
  // A translucent token (the chat preset's 60 % ink, its hover wash) is flattened over the surface it sits on.
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(out);
  if (!rgba || name === "--ui-color-surface") return out;
  const under = resolve(layers, "--ui-color-surface");
  const mix = [1, 2, 3].map((i, k) => Math.round(Number(rgba[i]) * Number(rgba[4]) + parseInt(under.slice(1 + 2 * k, 3 + 2 * k), 16) * (1 - Number(rgba[4]))));
  return `#${mix.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
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

describe("week blocks contrast", () => {
  it.each(themes)("block fills reach 3:1 against the column and carry 4.5:1 text in %s", (_, layers) => {
    const column = hex(resolve(layers, "--ui-week-block-column-bg"));
    const text = hex(resolve(layers, "--ui-week-block-text"));
    const fails: string[] = [];
    for (const tone of ["success", "neutral"]) {
      const fill = hex(resolve(layers, `--ui-week-block-${tone}-bg`));
      const edge = ratio(fill, column);
      const label = ratio(text, fill);
      if (edge < 3) fails.push(`${tone} fill vs column: ${edge.toFixed(2)}`);
      if (label < 4.5) fails.push(`${tone} text vs fill: ${label.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });
});
