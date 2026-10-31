import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { compileString } from "sass";

const root = process.cwd();
const read = (path: string) => readFileSync(path, "utf8");
const tokens = read(join(root, "src/styles/tokens.css"));
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const sources = files(join(root, "src/components"));
const components = sources.filter((path) => path.endsWith(".vue"));
const uncomment = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<!--[^]*?-->/g, "")
  .replace(/^\s*\/\/.*$/gm, "");

function tokenValue(name: string, seen: string[] = []): number {
  if (seen.includes(name)) return NaN;
  const value = new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(uncomment(tokens))?.[1].trim();
  const alias = /^var\((--[\w-]+)\)$/.exec(value ?? "");
  return alias ? tokenValue(alias[1], [...seen, name]) : Number(value);
}

// This is a source contract: jsdom does not paint stacking contexts. Compile
// Sass so nested rules/media queries are scanned as CSS, not as SCSS text.
function layerErrors(vue: string, scss: string): string[] {
  const errors: string[] = [];
  const template = uncomment(vue).match(/<template>([\s\S]*)<\/template>/)?.[1] ?? "";
  const document = new DOMParser().parseFromString(template, "text/html");
  const teleports = [...document.querySelectorAll('teleport[to="body"]')];
  if (!teleports.length) return errors;
  const surfaceClasses = new Set<string>();
  const roots: string[][] = [];
  function collect(element: ParentNode) {
    for (const child of element.children) {
      if (["TEMPLATE", "TRANSITION", "TRANSITIONGROUP"].includes(child.tagName)) {
        // HTML template children live in a separate fragment.
        if (child instanceof HTMLTemplateElement) collect(child.content);
        else collect(child);
      } else {
        const classes = [...child.classList];
        const binding = child.getAttribute(":class");
        if (binding) {
          const declaration = new RegExp(`const ${binding}\\s*=[^;]+`).exec(vue)?.[0] ?? binding;
          classes.push(...[...declaration.matchAll(/["'`](ui-[\w-]+)["'`]/g)].map((match) => match[1]));
        }
        roots.push(classes);
        classes.forEach((name) => surfaceClasses.add(name));
      }
    }
  }
  teleports.forEach(collect);
  const css = compileString(scss, { logger: { warn() {}, debug() {} } }).css;
  let surfaces = 0;
  const layeredClasses = new Set<string>();
  for (const rule of uncomment(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selector, declarations] = rule;
    if (selector.trim().startsWith("@") || selector.includes("::")) continue;
    const layer = /(?:^|;)\s*z-index\s*:\s*([^;]+)/.exec(declarations)?.[1].trim();
    if (layer) {
      for (const name of surfaceClasses) {
        if (selector.trim().split(/\s*,\s*/).includes(`.${name}`)) layeredClasses.add(name);
      }
    }
    const positioned = /position\s*:\s*(?:fixed|absolute|relative|sticky)/.test(declarations);
    const isRoot = [...surfaceClasses].some((name) => selector.match(new RegExp(`\\.${name}(?![\\w-])`)));
    // Fixed surfaces escape their ancestors; direct Teleport children are
    // independent surfaces too. Internal positioned controls inherit the layer.
    if (!layer && !/position\s*:\s*fixed/.test(declarations) && !(positioned && isRoot)) continue;
    surfaces++;
    const label = selector.trim();
    if (label === ".ui-dialog__backdrop") {
      if (layer !== "var(--ui-dialog-z)") errors.push(`${label}: must use --ui-dialog-z`);
      continue;
    }
    const expression = /^(?:var\((--[\w-]+)\)|calc\(var\((--[\w-]+)\)\s*([+-])\s*(\d+)\))$/.exec(layer ?? "");
    const token = expression?.[1] ?? expression?.[2];
    const offset = expression?.[3] === "-" ? -Number(expression[4]) : Number(expression?.[4] ?? 0);
    if (!token || !(tokenValue(token) > tokenValue("--ui-dialog-z")) ||
        !(tokenValue(token) + offset > tokenValue("--ui-dialog-z"))) {
      errors.push(`${label}: ${layer ?? "missing z-index token"}`);
    }
  }
  for (const classes of roots) {
    if (!classes.some((name) => layeredClasses.has(name))) {
      errors.push(`Teleport root ${classes.join(" ") || "(unresolved class)"}: missing z-index token`);
    }
  }
  if (!surfaces) errors.push("Teleport has no layered surface");
  return errors;
}

function inlineLayers(source: string): string[] {
  // Also inspect script bindings: :style="panelStyle" must not hide zIndex.
  return uncomment(source).match(/\bz-index\s*:|\bzIndex\s*:|["']z-index["']\s*:/g) ?? [];
}

describe("teleported surface layer contract", () => {
  it.each(components.map((path) => [relative(root, path), path]))("%s forbids inline z-index", (_, path) => {
    expect(inlineLayers(read(path))).toEqual([]);
  });

  const teleported = components.filter((path) => /<Teleport\b[^>]*\bto=["']body["']/.test(uncomment(read(path))));
  it("discovers teleported components", () => expect(teleported.length).toBeGreaterThan(0));
  it.each(teleported.map((path) => [relative(root, path), path]))("%s surfaces stack above the dialog", (_, path) => {
    const scss = sources.filter((file) => dirname(file) === dirname(path) && file.endsWith(".scss")).map(read).join("\n");
    expect(layerErrors(read(path), scss)).toEqual([]);
  });

  const fixture = '<template><Teleport to="body"><div class="new-surface" /></Teleport></template>';
  it.each(["var(--ui-overlay-z)", "var(--ui-dialog-z)", "auto", "1", ""])("rejects a new surface with layer %s", (layer) => {
    expect(layerErrors(fixture, `.new-surface { position: fixed; ${layer ? `z-index: ${layer};` : ""} }`).length).toBeGreaterThan(0);
  });
  it("rejects a new component without surface styles", () => {
    expect(layerErrors(fixture, "")).toContain("Teleport has no layered surface");
  });
  it.each(['style="z-index: 1200"', ':style="{ zIndex: 1200 }"', ':style="{ \'z-index\': 1200 }"'])("rejects %s", (style) => {
    expect(inlineLayers(`<template><div ${style} /></template>`).length).toBeGreaterThan(0);
  });
  it("removes the unused overlay token", () => {
    expect(uncomment(tokens)).not.toMatch(/--ui-overlay-z\s*:/);
  });
});
