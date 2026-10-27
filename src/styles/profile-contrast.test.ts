import { readFileSync } from "node:fs";
import { join } from "node:path";

// 0.8 profile components: every text they paint reaches 4.5:1 and every ring or
// bar fill 3:1 (WCAG 1.4.11), in the default light and dark themes and in
// pocket day and night. Tokens are resolved through their var() chains, layered
// the way the classes stack, and translucent fills are composited over what
// they sit on — the same method as severity-contrast.test.ts.
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
  ["pocket day", [tokens, pocketDay]],
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

/** Text tokens painted by the 0.8 components (values, labels, hints, units). */
const TEXT = [
  "--ui-stat-card-value-text",
  "--ui-stat-card-label-text",
  "--ui-stat-card-hint-text",
  "--ui-stat-card-trend-up",
  "--ui-stat-card-trend-down",
  "--ui-stat-card-trend-flat",
  "--ui-stat-card-icon-color",
  "--ui-countdown-value-text",
  "--ui-countdown-unit-text",
  "--ui-countdown-label-text",
  "--ui-progress-ring-text",
  "--ui-progress-ring-unit-text",
  "--ui-profile-header-name-text",
  "--ui-profile-header-subtitle-text",
  "--ui-progress-label-text",
  "--ui-kpi-strip-icon-color",
  // Tones of a stat card's value.
  "--ui-color-primary",
  "--ui-color-success",
  "--ui-color-warning",
  "--ui-color-danger",
];

/** Fills that carry information: they need 3:1 against the surface and the track. */
const FILLS = [
  "--ui-progress-ring-fill",
  "--ui-progress-ring-fill-success",
  "--ui-progress-ring-fill-warning",
  "--ui-progress-ring-fill-danger",
  "--ui-progress-ring-fill-neutral",
  "--ui-progress-ring-gradient-from",
  "--ui-progress-ring-gradient-to",
  "--ui-progress-fill-bg",
];

describe("0.8 profile components: contrast", () => {
  it.each(themes)("every text reaches 4.5:1 on the surface (and the pocket floor) in %s", (name, layers) => {
    const surface = parse(resolve(layers, "--ui-color-surface")).rgb;
    const grounds: [string, Rgb][] = [["surface", surface]];
    if (name.startsWith("pocket")) grounds.push(["floor", parse(resolve(layers, "--ui-pocket-floor")).rgb]);
    const fails: string[] = [];
    for (const [ground, bg] of grounds) {
      for (const t of TEXT) {
        const r = ratio(over(resolve(layers, t), bg), bg);
        if (r < 4.5) fails.push(`${t} on ${ground}: ${r.toFixed(2)}`);
      }
    }
    expect(fails).toEqual([]);
  });

  it.each(themes)("every ring and bar fill reaches 3:1 on the surface and on its track in %s", (_, layers) => {
    const surface = parse(resolve(layers, "--ui-color-surface")).rgb;
    const ringTrack = over(resolve(layers, "--ui-progress-ring-track"), surface);
    const barTrack = over(resolve(layers, "--ui-progress-track-bg"), surface);
    const fails: string[] = [];
    for (const f of FILLS) {
      const fill = over(resolve(layers, f), surface);
      const track = f === "--ui-progress-fill-bg" ? barTrack : ringTrack;
      if (ratio(fill, surface) < 3) fails.push(`${f} on surface: ${ratio(fill, surface).toFixed(2)}`);
      if (ratio(fill, track) < 3) fails.push(`${f} on track: ${ratio(fill, track).toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });

  it("pocket paints the ring gradient from the accent to the second accent", () => {
    expect(pocketDay["--ui-progress-ring-gradient-from"]).toBe("var(--ui-pocket-accent)");
    expect(pocketDay["--ui-progress-ring-gradient-to"]).toBe("var(--ui-pocket-accent-2)");
  });

  it("the avatar initials reach 4.5:1 on both stops of every gradient", () => {
    const text = parse(resolve([tokens], "--ui-avatar-gradient-text")).rgb;
    const fails: string[] = [];
    for (let i = 1; i <= 8; i++) {
      const stops = [...(tokens[`--ui-avatar-gradient-${i}`] ?? "").matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);
      expect(stops).toHaveLength(2);
      for (const s of stops) {
        const r = ratio(text, parse(s).rgb);
        if (r < 4.5) fails.push(`gradient ${i} ${s}: ${r.toFixed(2)}`);
      }
    }
    expect(fails).toEqual([]);
  });
});
