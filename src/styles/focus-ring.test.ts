import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The focus ring of a button has to survive every preset. In 0.4.0 it was a
// box-shadow, and pocket's primary button paints its own box-shadow with a more
// specific selector: the focused button looked exactly like the unfocused one.
// An outline is a separate property that no preset sets, so it cannot be
// replaced by a shadow. These checks are static, like the rest of the preset
// tests: jsdom neither compiles SCSS nor resolves :focus-visible.
const root = process.cwd();
const stylesDir = join(root, "src", "styles");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Every `selector { body }` pair of a stylesheet, comments removed. */
function rules(css: string): { selector: string; body: string }[] {
  return [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));
}

const RING = /outline:\s*var\(--ui-focus-ring-width\)\s+solid\s+var\(--ui-focus-ring\)/;

const focusable: [file: string, selector: string][] = [
  ["button/button.scss", ".ui-button__el:focus-visible"],
  ["icon-button/icon-button.scss", ".ui-icon-button:focus-visible"],
  ["disclosure/disclosure.scss", ".ui-disclosure__summary:focus-visible"],
  ["alert/alert.scss", ".ui-alert__close:focus-visible"],
  ["tag/tag.scss", ".ui-tag__remove:focus-visible"],
];

const presets = readdirSync(stylesDir).filter((f) => f.endsWith(".css"));

describe("focus ring", () => {
  it.each(focusable)("%s draws focus with an outline", (file, selector) => {
    const rule = rules(read("src", "components", ...file.split("/"))).find((r) => r.selector === selector);
    if (!rule) throw new Error(`no rule for ${selector}`);
    expect(rule.body).toMatch(RING);
    expect(rule.body).not.toMatch(/outline:\s*(none|0)\b/);
  });

  it("finds the presets", () => {
    // Guards the guard: an empty list would make the next check pass vacuously.
    expect(presets).toEqual(expect.arrayContaining(["pocket.css", "classroom.css", "console.css", "matrix.css", "dark.css"]));
  });

  it.each(presets)("%s never removes or replaces the outline of a focusable control", (preset) => {
    const targets = /\.ui-(button|icon-button|disclosure__summary|alert__close|tag__remove)\b/;
    const offenders = rules(read("src", "styles", preset))
      .filter((r) => targets.test(r.selector) && /(^|;)\s*outline(-style|-width)?\s*:/.test(r.body))
      .map((r) => r.selector);
    expect(offenders).toEqual([]);
  });

  it.each(presets)("%s keeps the ring visible: it never sets the ring width to zero", (preset) => {
    expect(stripComments(read("src", "styles", preset))).not.toMatch(/--ui-focus-ring-width:\s*0\b/);
  });
});
