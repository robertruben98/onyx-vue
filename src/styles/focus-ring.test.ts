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
  // 0.6.0: the rest of the controls (O-1).
  ["tabs/tabs.scss", ".ui-tabs__tab:focus-visible"],
  ["tabs/tabs.scss", ".ui-tabs__arrow:focus-visible"],
  ["select/select.scss", ".ui-select__trigger:focus-visible,\n.ui-select__trigger--open"],
  ["input/input.scss", ".ui-input__el:focus-visible"],
  ["textarea/textarea.scss", ".ui-textarea__el:focus-visible"],
  ["checkbox/checkbox.scss", ".ui-checkbox__el:focus-visible"],
  ["radio-group/radio-group.scss", ".ui-radio__el:focus-visible"],
  ["switch/switch.scss", ".ui-switch__el:focus-visible ~ .ui-switch__track"],
  ["segmented/segmented.scss", ".ui-segmented__el:focus-visible + .ui-segmented__label"],
  ["app-bar/app-bar.scss", ".ui-app-bar__toggle:focus-visible"],
  ["menu/menu.scss", ".ui-menu__trigger:focus-visible"],
  ["menu/menu.scss", ".ui-menu__item:focus-visible"],
  ["fab/fab.scss", ".ui-fab:focus-visible"],
  ["filter-chip/filter-chip.scss", ".ui-filter-chip:focus-visible"],
  ["toast/toast.scss", ".ui-toast__dismiss:focus-visible"],
  ["dialog/dialog.scss", ".ui-dialog__close:focus-visible"],
  ["drawer/drawer.scss", ".ui-drawer__close:focus-visible"],
  // New in 0.6.0.
  ["card/card.scss", ".ui-card--interactive:focus-visible"],
  ["chip/chip.scss", ".ui-chip:focus-visible"],
  ["toast/toast.scss", ".ui-toast__action:focus-visible"],
  ["record-button/record-button.scss", ".ui-record-button:focus-visible"],
  // New in 0.7.0.
  ["course-switcher/course-switcher.scss", ".ui-course-switcher__trigger:focus-visible"],
  ["course-switcher/course-switcher.scss", ".ui-course-switcher__tile:focus-visible"],
  // New in 0.8.0: a tappable stat card (as="button" | as="a").
  ["stat-card/stat-card.scss", ".ui-stat-card--interactive:focus-visible"],
  // New in 0.11.0: the title link of a media card.
  ["media-card/media-card.scss", ".ui-media-card__title a:focus-visible"],
];

/** Files whose every :focus-visible rule must draw with an outline, never a box-shadow. */
const ringFiles = [...new Set(focusable.map(([file]) => file))];

const presets = readdirSync(stylesDir).filter((f) => f.endsWith(".css"));

describe("focus ring", () => {
  it.each(focusable)("%s draws focus with an outline", (file, selector) => {
    const rule = rules(read("src", "components", ...file.split("/"))).find((r) => r.selector === selector);
    if (!rule) throw new Error(`no rule for ${selector}`);
    expect(rule.body).toMatch(RING);
    expect(rule.body).not.toMatch(/outline:\s*(none|0)\b/);
  });

  it.each(ringFiles)("%s has no box-shadow focus ring left", (file) => {
    // A ring painted with box-shadow vanishes in forced-colors mode and can be
    // replaced by any preset shadow; the invalid variants recolour the outline.
    const offenders = rules(read("src", "components", ...file.split("/")))
      .filter((r) => /:focus-visible/.test(r.selector) && /box-shadow:[^;]*--ui-focus-ring|box-shadow:\s*0 0 0 var\(--ui-focus-ring-width\)/.test(r.body))
      .map((r) => r.selector);
    expect(offenders).toEqual([]);
  });

  it.each([
    ["input/input.scss", ".ui-input--invalid .ui-input__el:focus-visible", "--ui-input-border-invalid"],
    ["textarea/textarea.scss", ".ui-textarea--invalid .ui-textarea__el:focus-visible", "--ui-textarea-border-invalid"],
  ])("%s keeps the invalid colour on the outline", (file, selector, token) => {
    const rule = rules(read("src", "components", ...file.split("/"))).find((r) => r.selector === selector);
    if (!rule) throw new Error(`no rule for ${selector}`);
    expect(rule.body).toMatch(new RegExp(`outline-color:\\s*var\\(${token}\\)`));
    expect(rule.body).not.toMatch(/box-shadow/);
  });

  it("finds the presets", () => {
    // Guards the guard: an empty list would make the next check pass vacuously.
    expect(presets).toEqual(expect.arrayContaining(["pocket.css", "classroom.css", "console.css", "matrix.css", "dark.css"]));
  });

  it.each(presets)("%s never removes or replaces the outline of a focusable control", (preset) => {
    const targets =
      /\.ui-(button|icon-button|disclosure__summary|alert__close|tag__remove|tabs__tab|tabs__arrow|select__trigger|input__el|textarea__el|checkbox__el|radio__el|switch__track|segmented__label|app-bar__toggle|menu__trigger|menu__item|fab|filter-chip|toast__dismiss|toast__action|dialog__close|drawer__close|card--interactive|chip|record-button|course-switcher__trigger|course-switcher__tile|stat-card--interactive|stat-card)\b/;
    const offenders = rules(read("src", "styles", preset))
      .filter((r) => targets.test(r.selector) && /(^|;)\s*outline(-style|-width)?\s*:/.test(r.body))
      .map((r) => r.selector);
    expect(offenders).toEqual([]);
  });

  it.each(presets)("%s keeps the ring visible: it never sets the ring width to zero", (preset) => {
    expect(stripComments(read("src", "styles", preset))).not.toMatch(/--ui-focus-ring-width:\s*0\b/);
  });
});
