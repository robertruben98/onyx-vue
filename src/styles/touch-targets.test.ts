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

describe("touch targets under a coarse pointer", () => {
  it.each([
    ["icon-button/icon-button.scss", ".ui-icon-button::after"],
    ["tabs/tabs.scss", ".ui-tabs__arrow::after"],
    ["alert/alert.scss", ".ui-alert__close::after"],
    ["tag/tag.scss", ".ui-tag__remove::after"],
  ])("%s gives %s a 44px hit area", (file, selector) => {
    const block = coarse(sheet(file));
    const i = block.indexOf(`${selector} {`);
    expect(i).toBeGreaterThan(-1);
    const body = block.slice(i, block.indexOf("}", i));
    expect(body).toContain("width: max(100%, 44px)");
    expect(body).toContain("height: max(100%, 44px)");
    expect(body).toContain("position: absolute");
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
