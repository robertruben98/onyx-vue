import { readFileSync } from "node:fs";
import { join } from "node:path";

// Static checks on the component stylesheets, like tabs.scss and nav-rail.scss
// already have: jsdom neither compiles SCSS nor evaluates media queries.
const sheet = (file: string) =>
  readFileSync(join(process.cwd(), "src", "components", ...file.split("/")), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

/** The body of the `@media (pointer: coarse)` block of a stylesheet. */
function coarse(css: string): string {
  const start = css.indexOf("@media (pointer: coarse)");
  if (start < 0) return "";
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(start, i);
  }
  return "";
}

/**
 * The body of the rule in `block` whose selector list includes `selector`
 * (`.a::after, .b::after { ... }` counts for both).
 */
function ruleBody(block: string, selector: string): string | null {
  const inner = block.slice(block.indexOf("{") + 1);
  for (const m of inner.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1].split(",").map((s) => s.trim()).includes(selector)) return m[2];
  }
  return null;
}

/** The body of a top-level rule (outside any media query) for `selector`. */
function baseRule(css: string, selector: string): string {
  const outside = css.slice(0, css.indexOf("@media (pointer: coarse)") < 0 ? css.length : css.indexOf("@media (pointer: coarse)"));
  return new RegExp(`(?:^|\\n)\\${selector} \\{([^}]*)\\}`).exec(outside)?.[1] ?? "";
}

describe("touch targets under a coarse pointer", () => {
  it.each([
    ["icon-button/icon-button.scss", ".ui-icon-button::after"],
    ["tabs/tabs.scss", ".ui-tabs__arrow::after"],
    ["alert/alert.scss", ".ui-alert__close::after"],
    ["tag/tag.scss", ".ui-tag__remove::after"],
    ["drawer/drawer.scss", ".ui-drawer__close::after"],
    ["dialog/dialog.scss", ".ui-dialog__close::after"],
    ["toast/toast.scss", ".ui-toast__action::after"],
    ["toast/toast.scss", ".ui-toast__dismiss::after"],
    ["chip/chip.scss", ".ui-chip::after"],
  ])("%s gives %s a 44px hit area", (file, selector) => {
    const body = ruleBody(coarse(sheet(file)), selector);
    expect(body).not.toBeNull();
    expect(body).toContain("width: max(100%, 44px)");
    expect(body).toContain("height: max(100%, 44px)");
    expect(body).toContain("position: absolute");
  });

  it.each([
    ["drawer/drawer.scss", ".ui-drawer__close"],
    ["dialog/dialog.scss", ".ui-dialog__close"],
    ["toast/toast.scss", ".ui-toast__action"],
    ["toast/toast.scss", ".ui-toast__dismiss"],
    ["chip/chip.scss", ".ui-chip"],
  ])("%s: %s is the containing block of its hit area", (file, selector) => {
    expect(baseRule(sheet(file), selector)).toContain("position: relative");
  });

  it.each([
    ["drawer/drawer.scss", ".ui-drawer__close"],
    ["dialog/dialog.scss", ".ui-dialog__close"],
  ])("%s: %s is at least 24px with any pointer (WCAG 2.5.8)", (file, selector) => {
    const body = baseRule(sheet(file), selector);
    expect(body).toContain("min-width: 24px");
    expect(body).toContain("min-height: 24px");
  });

  it.each([
    [".ui-course-switcher__trigger", /min-width: 44px;[\s\S]*min-height: var\(--ui-course-switcher-trigger-height\)/],
    [".ui-course-switcher__tile", /min-width: 44px;[\s\S]*min-height: max\(44px, var\(--ui-course-switcher-tile-size\)\)/],
  ])("course switcher: %s is at least 44px with any pointer", (selector, size) => {
    expect(baseRule(sheet("course-switcher/course-switcher.scss"), selector)).toMatch(size);
  });

  it("stat card: a tappable card is at least 44px tall with any pointer", () => {
    expect(baseRule(sheet("stat-card/stat-card.scss"), ".ui-stat-card--interactive")).toContain(
      "min-height: var(--ui-stat-card-interactive-min-height)",
    );
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    expect(tokens).toMatch(/--ui-stat-card-interactive-min-height:\s*44px/);
  });

  it("course switcher: the trigger height token is 44px", () => {
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    expect(tokens).toMatch(/--ui-course-switcher-trigger-height:\s*44px/);
  });

  it("a scrolling chip row leaves room for its chips' 44px hit area", () => {
    const body = ruleBody(coarse(sheet("chip-row/chip-row.scss")), ".ui-chip-row--scroll") ?? "";
    expect(body).toContain("padding-block: max(var(--ui-chip-row-inset), calc((44px - var(--ui-chip-height)) / 2))");
  });

  it.each([
    ["alert/alert.scss", ".ui-alert__close"],
    ["tag/tag.scss", ".ui-tag__remove"],
  ])("%s reaches 24px with any pointer (WCAG 2.5.8)", (file, selector) => {
    const css = sheet(file);
    const outside = css.slice(0, css.indexOf("@media (pointer: coarse)"));
    expect(outside).toMatch(new RegExp(`\\${selector}::after \\{[^}]*width: max\\(100%, 24px\\)[^}]*height: max\\(100%, 24px\\)`));
  });

  it("the disclosure summary is at least a control tall", () => {
    expect(coarse(sheet("disclosure/disclosure.scss"))).toMatch(
      /\.ui-disclosure__summary \{[^}]*min-height: max\(44px, var\(--ui-size-control-md\)\)/,
    );
  });
});

describe("fluid widths", () => {
  it("segmented is border-box, so fluid does not overflow its column by border and inset", () => {
    expect(sheet("segmented/segmented.scss")).toMatch(/\.ui-segmented \{[^}]*box-sizing: border-box/);
  });

  it.each([
    ["textarea/textarea.scss", ".ui-textarea--fluid"],
    ["input/input.scss", ".ui-input--fluid"],
  ])("%s: %s is block and full width", (file, selector) => {
    expect(sheet(file)).toMatch(new RegExp(`\\${selector} \\{[^}]*display: flex;[^}]*width: 100%`));
  });

  it("a wrapped segmented label breaks at spaces, not inside a word", () => {
    const body = /\.ui-segmented--wrap \.ui-segmented__label \{([^}]*)\}/.exec(sheet("segmented/segmented.scss"))?.[1] ?? "";
    expect(body).toContain("overflow-wrap: normal");
    expect(body).not.toContain("hyphens: auto");
  });
});

describe("readonly fields", () => {
  it.each([
    ["input/input.scss", ".ui-input__el", "--ui-input-text"],
    ["textarea/textarea.scss", ".ui-textarea__el", "--ui-textarea-text"],
  ])("%s keeps the normal text colour when readonly", (file, el, token) => {
    expect(sheet(file)).toMatch(new RegExp(`\\${el}\\[readonly\\]:not\\(:disabled\\) \\{[^}]*color: var\\(${token}\\)`));
  });
});
