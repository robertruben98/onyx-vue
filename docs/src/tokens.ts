// Lee las hojas de estilo de la libreria para que la pagina de Theming ensene
// los tokens que existen de verdad. Los fragmentos y la tabla salen de aqui, no
// de texto escrito a mano: la version escrita a mano nombraba `--ui-gray-50`,
// `--ui-violet-600` y `--ui-radius-lg`, que no existen, y nada lo notaba.
import tokensCss from "../../src/styles/tokens.css?raw";
import darkCss from "../../src/styles/dark.css?raw";
import acmeCss from "../../src/styles/acme.css?raw";

/** A `--ui-*` declaration. */
export type Declaration = [name: string, value: string];

/** The declarations inside the first `selector { ... }` block of a stylesheet. */
export function declarations(css: string, selector: string): Declaration[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = stripped.search(new RegExp(`(^|\\n)\\s*${selector.replace(/[.]/g, "\\.")}\\s*\\{`));
  if (start === -1) return [];
  const open = stripped.indexOf("{", start);
  const close = stripped.indexOf("}", open);
  const body = stripped.slice(open + 1, close);
  return [...body.matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, " ").trim()]);
}

const root = new Map(declarations(tokensCss, ":root"));

/** `--ui-color-primary: var(--ui-emerald-700);` as the stylesheet writes it. */
export function tokenLine(name: string): string {
  const value = root.get(name);
  if (value === undefined) throw new Error(`token ${name} is not defined in tokens.css`);
  return `${name}: ${value};`;
}

export interface TokenGroup {
  title: string;
  tokens: Declaration[];
}

const GROUPS: Array<[title: string, match: (name: string) => boolean]> = [
  ["Colour", (n) => n.startsWith("--ui-color-") && !/-(hover|active|disabled)$/.test(n)],
  ["Shape and focus", (n) => n === "--ui-radius" || n === "--ui-border-width" || n === "--ui-focus-ring" || n.startsWith("--ui-radii-")],
  ["Spacing", (n) => /^--ui-space-\d+$/.test(n)],
  ["Typography", (n) => n.startsWith("--ui-font-")],
];

/** The semantic layer, grouped, with the value each token has in the base theme. */
export function semanticTokens(): TokenGroup[] {
  return GROUPS.map(([title, match]) => ({
    title,
    tokens: [...root].filter(([name]) => match(name)),
  }));
}

/** The base semantic mapping, as a copy-paste snippet. */
export const SEMANTIC_SNIPPET = `:root {
${["--ui-color-primary", "--ui-color-surface", "--ui-color-text", "--ui-radius"].map((n) => `  ${tokenLine(n)}`).join("\n")}
}`;

/** The acme preset, straight from acme.css. */
export const PRESET_SNIPPET = `/* acme.css: one client = one preset */
.ui-theme-acme {
${declarations(acmeCss, ".ui-theme-acme")
  .filter(([n]) => /^--ui-(color-primary|focus-ring|radius)$/.test(n))
  .map(([n, v]) => `  ${n}: ${v};`)
  .join("\n")}
}`;

/** Dark mode, straight from dark.css. */
export const DARK_SNIPPET = `.app-dark {
${declarations(darkCss, ".app-dark")
  .filter(([n]) => /^--ui-color-(primary|surface|text)$/.test(n))
  .map(([n, v]) => `  ${n}: ${v};`)
  .join("\n")}
}`;
