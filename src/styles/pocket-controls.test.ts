import { readFileSync } from "node:fs";
import { join } from "node:path";

// Pocket controls (ov-67): the resting edge of a control must reach 3:1 (WCAG 1.4.11) against the
// surface it sits on, the checkbox/radio are drawn with tokens, `color-scheme` follows the theme,
// the card variants differ and the info tag stays readable in night mode.
const styles = (f: string) => readFileSync(join(process.cwd(), "src", "styles", f), "utf8");
const component = (f: string) =>
  readFileSync(join(process.cwd(), "src", "components", ...f.split("/")), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  return css.slice(start, css.indexOf("\n}", start));
}
const vars = (css: string): Record<string, string> =>
  Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const tokens = vars(styles("tokens.css"));
const dark = vars(block(styles("dark.css"), ".app-dark"));
const pocket = styles("pocket.css");
const day = vars(block(pocket, ".ui-theme-pocket"));
const night = vars(block(pocket, ".ui-theme-pocket.app-dark"));

const themes: [string, Record<string, string>[]][] = [
  ["pocket light", [tokens, day]],
  ["pocket dark", [tokens, dark, day, night]],
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
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("pocket control edges reach 3:1", () => {
  const surfaces = ["--ui-pocket-floor", "--ui-pocket-card", "--ui-pocket-card-hover"];
  it.each(themes)("switch off-track and input border on every surface in %s", (_, layers) => {
    const fails: string[] = [];
    for (const fg of ["--ui-switch-track-bg", "--ui-input-border", "--ui-textarea-border", "--ui-checkbox-border"]) {
      for (const bg of surfaces) {
        const r = ratio(resolve(layers, fg), resolve(layers, bg));
        if (r < 3) fails.push(`${fg} on ${bg}: ${r.toFixed(2)}`);
      }
    }
    expect(fails).toEqual([]);
  });

  it.each(themes)("the white thumb stays visible on the off-track in %s", (_, layers) => {
    expect(ratio(resolve(layers, "--ui-switch-thumb-color"), resolve(layers, "--ui-switch-track-bg"))).toBeGreaterThanOrEqual(3);
  });

  it.each(themes)("the skeleton base is visible on the floor and on a card in %s", (_, layers) => {
    for (const bg of ["--ui-pocket-floor", "--ui-pocket-card"]) {
      expect(ratio(resolve(layers, "--ui-skeleton-bg"), resolve(layers, bg))).toBeGreaterThanOrEqual(1.25);
    }
  });

  it("the switch has the iOS size and a thumb shadow in pocket", () => {
    expect(day["--ui-switch-track-width"]).toBe("3.1875rem");
    expect(day["--ui-switch-track-height"]).toBe("1.9375rem");
    expect(day["--ui-switch-thumb-shadow"]).toMatch(/rgba\(/);
    expect(component("switch/switch.scss")).toContain("box-shadow: var(--ui-switch-thumb-shadow)");
  });
});

describe("color-scheme follows the theme", () => {
  it("the base layer declares light on :root", () => {
    expect(block(styles("tokens.css"), ":root")).toMatch(/color-scheme:\s*light/);
  });
  it("the dark preset declares dark", () => {
    expect(block(styles("dark.css"), ".app-dark")).toMatch(/color-scheme:\s*dark/);
  });
  it("pocket night declares dark by itself", () => {
    expect(block(pocket, ".ui-theme-pocket.app-dark")).toMatch(/color-scheme:\s*dark/);
  });
});

describe("checkbox and radio are drawn with tokens", () => {
  it.each([
    ["checkbox/checkbox.scss", ".ui-checkbox__el", "--ui-checkbox-radius"],
    ["radio-group/radio-group.scss", ".ui-radio__el", "--ui-radio-size"],
  ])("%s resets the native look on %s", (file, selector) => {
    const css = component(file);
    const body = new RegExp(`\\${selector} \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    expect(body).toContain("appearance: none");
    expect(body).toMatch(/border: var\(--ui-(checkbox|radio)-border-width\) solid/);
    expect(body).not.toContain("accent-color");
  });
  it("the checkbox box takes its radius from the token and fills on check", () => {
    const css = component("checkbox/checkbox.scss");
    expect(css).toContain("border-radius: var(--ui-checkbox-radius)");
    expect(css).toMatch(/\.ui-checkbox__el:checked[^{]*\{[^}]*background-color: var\(--ui-checkbox-bg-checked\)/);
    expect(css).toMatch(/mask(-image)?:/);
    expect(css).toContain(":indeterminate");
  });
  it("pocket maps the radius to a token the box can use", () => {
    expect(day["--ui-checkbox-radius"]).toBeDefined();
  });
});

describe("card variants and info tag", () => {
  it("the outlined card has its own border token, visibly stronger than the divider in pocket", () => {
    expect(component("card/card.scss")).toMatch(/\.ui-card--outlined \{[^}]*border-color: var\(--ui-card-outlined-border\)/);
    for (const [, layers] of themes) {
      const outline = resolve(layers, "--ui-card-outlined-border");
      expect(outline).not.toBe(resolve(layers, "--ui-color-border"));
      expect(ratio(outline, resolve(layers, "--ui-pocket-card"))).toBeGreaterThanOrEqual(1.7);
    }
  });
  it.each(themes)("info tag text reaches 4.5:1 on its surface in %s, over card and card-hover", (_, layers) => {
    const bg = resolve(layers, "--ui-tag-info-bg");
    expect(bg).toMatch(/^#[0-9a-f]{6}$/i); // opaque: it cannot take the colour of the row below
    expect(ratio(resolve(layers, "--ui-tag-info-text"), bg)).toBeGreaterThanOrEqual(4.5);
  });
});
