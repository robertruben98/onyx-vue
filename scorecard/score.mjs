// Convierte las mediciones de `scorecard/.out/` en una nota de 0 a 100 por
// aspecto, con el detalle de lo que resta puntos. Ver scorecard/README.md para
// la definicion de cada aspecto.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "scorecard", ".out");
const SRC = join(ROOT, "src");
const COMPONENTS = join(SRC, "components");

const read = (p) => readFileSync(p, "utf8");
const readJson = (p) => JSON.parse(read(p));
const round = (n) => Math.round(n * 10) / 10;
const pct = (ok, total) => (total === 0 ? 100 : (100 * ok) / total);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function walk(dir, pred, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, pred, acc);
    else if (pred(p)) acc.push(p);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// 1. Accessibility: axe en navegador, por tema
// ---------------------------------------------------------------------------
function scoreA11y(browser) {
  const runs = browser.a11y;
  const findings = [];
  const perRun = runs.map((r) => {
    if (r.error) {
      findings.push(`${r.component}@${r.theme}: could not run (${r.error.slice(0, 60)})`);
      return 0;
    }
    const severe = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    const mild = r.violations.length - severe.length;
    for (const v of r.violations) {
      findings.push(`${r.component}@${r.theme}: ${v.id} (${v.impact}, ${v.nodes} nodes) ${v.sample}`);
    }
    return Math.max(0, 100 - 20 * severe.length - 5 * mild);
  });
  const clean = perRun.filter((s) => s === 100).length;
  return {
    score: perRun.reduce((a, b) => a + b, 0) / perRun.length,
    summary: `${clean}/${runs.length} component×theme runs with no axe violation`,
    findings,
  };
}

// ---------------------------------------------------------------------------
// 2. Test coverage
// ---------------------------------------------------------------------------
function scoreCoverage() {
  const file = join(OUT, "coverage", "coverage-summary.json");
  const t = readJson(file).total;
  const parts = [t.statements.pct, t.branches.pct, t.functions.pct];
  const files = Object.entries(readJson(file))
    .filter(([k]) => k !== "total")
    .map(([k, v]) => ({ file: k.split("/src/")[1], b: v.branches.pct, f: v.functions.pct, s: v.statements.pct }))
    .filter((x) => Math.min(x.b, x.f, x.s) < 90)
    .sort((a, b) => Math.min(a.b, a.f, a.s) - Math.min(b.b, b.f, b.s))
    .map((x) => `${x.file}: statements ${x.s}%, branches ${x.b}%, functions ${x.f}%`);
  return {
    score: parts.reduce((a, b) => a + b, 0) / 3,
    summary: `statements ${t.statements.pct}%, branches ${t.branches.pct}%, functions ${t.functions.pct}%`,
    findings: files,
  };
}

// ---------------------------------------------------------------------------
// 3. Documentation: la API real frente a la tabla de API de su pagina
// ---------------------------------------------------------------------------
function parseRow(row) {
  let owner = null;
  let rest = row.trim();
  const m = rest.match(/^(?:Ui)?([A-Z][A-Za-z]+)\s+(.+)$/);
  if (m) {
    owner = `Ui${m[1]}`;
    rest = m[2];
  }
  const tokens = rest.split(/\s*\/\s*/).filter(Boolean);
  const first = tokens[0] ?? "";
  const out = tokens.map((t, i) => {
    if (i > 0 && t.startsWith(":") && first.startsWith("v-model")) return `v-model${t}`;
    if (i > 0 && first.startsWith("@") && !t.startsWith("@") && /^[a-z]/.test(t)) return `@${t}`;
    if (i > 0 && first.startsWith("#") && !t.startsWith("#") && /^[a-z]/.test(t)) return `#${t}`;
    return t;
  });
  return { owner, tokens: out };
}

function documented(kind, name, tokens) {
  const has = (t) => tokens.includes(t);
  if (kind === "prop") {
    return (
      has(name) ||
      has(kebab(name)) ||
      has(`v-model:${name}`) ||
      (name === "modelValue" && has("v-model"))
    );
  }
  if (kind === "emit") {
    if (has(`@${name}`)) return true;
    const model = name.match(/^update:(.+)$/);
    if (model) return model[1] === "modelValue" ? has("v-model") : has(`v-model:${model[1]}`);
    return false;
  }
  // slot
  if (name.startsWith("[")) return tokens.some((t) => t.startsWith("#") && /[<$]/.test(t));
  return has(`#${name}`);
}

function scoreDocs(info, docs) {
  let items = 0;
  let ok = 0;
  const findings = [];
  const undocumentedExports = [];
  for (const c of info) {
    const pages = docs.filter((d) => d.imports.includes(c.exportName));
    if (!pages.length) undocumentedExports.push(c.exportName);
    const tokens = [];
    for (const p of pages) {
      for (const row of p.api) {
        const { owner, tokens: t } = parseRow(row);
        if (!owner || owner === c.exportName) tokens.push(...t);
      }
    }
    const check = (kind, name) => {
      items++;
      if (documented(kind, name, tokens)) ok++;
      else findings.push(`${c.exportName}: ${kind} \`${name}\` missing from the API table`);
    };
    c.props.forEach((p) => check("prop", p.name));
    c.emits.forEach((e) => check("emit", e));
    c.slots.forEach((s) => check("slot", s));
  }
  undocumentedExports.forEach((e) => findings.unshift(`${e}: no docs page imports it`));
  const itemShare = pct(ok, items);
  const exportShare = pct(info.length - undocumentedExports.length, info.length);
  return {
    score: 0.85 * itemShare + 0.15 * exportShare,
    summary: `${ok}/${items} props, events and slots documented; ${info.length - undocumentedExports.length}/${info.length} exports on a docs page`,
    findings,
  };
}

// ---------------------------------------------------------------------------
// 4. Theming & tokens
// ---------------------------------------------------------------------------
// Un nombre de color como VALOR (`color: white`), no dentro de un token (`--ui-terminal-black`).
const NAMED_COLORS = /:\s*[^;]*(?<![-\w])(white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)(?![-\w])/;

function definedTokens() {
  const names = new Set();
  const files = [
    ...walk(join(SRC, "styles"), (p) => p.endsWith(".css")),
    ...walk(COMPONENTS, (p) => p.endsWith(".scss")),
  ];
  for (const f of files) for (const m of read(f).matchAll(/(--ui-[a-z0-9-]+)\s*:/g)) names.add(m[1]);
  // Variables que un componente fija por instancia desde su plantilla
  // (`:style="{ '--ui-kpi-strip-columns': n }"`): estan definidas en tiempo de
  // ejecucion, no en una hoja.
  for (const f of walk(COMPONENTS, (p) => p.endsWith(".vue"))) {
    for (const m of read(f).matchAll(/["'](--ui-[a-z0-9-]+)["']\s*:/g)) names.add(m[1]);
  }
  return names;
}

function scoreTokens() {
  const defined = definedTokens();
  const base = new Set();
  for (const f of ["tokens.css", "base.css"]) {
    const p = join(SRC, "styles", f);
    if (existsSync(p)) for (const m of read(p).matchAll(/(--ui-[a-z0-9-]+)\s*:/g)) base.add(m[1]);
  }
  const findings = [];
  let checks = 0;
  let ok = 0;
  for (const f of walk(COMPONENTS, (p) => p.endsWith(".scss"))) {
    const css = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const name = f.split("/components/")[1];
    // a) sin colores crudos
    checks++;
    const raw = css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d|hsla?\(\s*\d/) || css.match(NAMED_COLORS);
    if (raw) findings.push(`${name}: raw colour \`${raw[0].trim()}\``);
    else ok++;
    // b) todo token usado esta definido (o tiene fallback)
    checks++;
    const missing = new Set();
    for (const m of css.matchAll(/var\(\s*(--ui-[a-z0-9-]+)\s*(,)?/g)) {
      if (!m[2] && !defined.has(m[1])) missing.add(m[1]);
    }
    if (missing.size) findings.push(`${name}: undefined token(s) ${[...missing].join(", ")}`);
    else ok++;
  }
  // c) un preset solo redefine tokens que existen (o los suyos propios)
  for (const preset of ["acme", "console", "matrix", "dark"]) {
    const p = join(SRC, "styles", `${preset}.css`);
    if (!existsSync(p)) continue;
    checks++;
    const stray = [...read(p).matchAll(/(--ui-[a-z0-9-]+)\s*:/g)]
      .map((m) => m[1])
      .filter((t) => !base.has(t) && !t.startsWith(`--ui-${preset}-`) && !defined.has(t));
    if (stray.length) findings.push(`${preset}.css: overrides unknown token(s) ${[...new Set(stray)].join(", ")}`);
    else ok++;
  }
  return { score: pct(ok, checks), summary: `${ok}/${checks} token checks pass`, findings };
}

// ---------------------------------------------------------------------------
// 5. Responsive
// ---------------------------------------------------------------------------
function scoreResponsive(browser) {
  const runs = browser.responsive;
  const findings = [];
  let ok = 0;
  for (const r of runs) {
    if (r.error) findings.push(`${r.target}@${r.width}: could not run`);
    else if (r.pageScroll || r.spills.length) {
      findings.push(
        `${r.target}@${r.width}px: ${r.pageScroll ? "page scrolls sideways" : ""}${r.pageScroll && r.spills.length ? "; " : ""}${r.spills.length ? `spills: ${r.spills.slice(0, 3).join(", ")}` : ""}`,
      );
    } else ok++;
  }
  return { score: pct(ok, runs.length), summary: `${ok}/${runs.length} page×width runs with nothing spilling`, findings };
}

// ---------------------------------------------------------------------------
// 6. API consistency
// ---------------------------------------------------------------------------
const SIZES = new Set(["sm", "md", "lg"]);
const CANONICAL_TONES = new Set(["neutral", "info", "success", "warning", "danger", "muted"]);
const LEGACY_TONES = new Set(["ok", "warn", "bad", "default"]);

/** Resuelve el tipo de una prop a sus literales, buscando alias en src. */
function literalsOf(typeText, allSource) {
  const lits = [...typeText.matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);
  for (const id of typeText.match(/\b[A-Z][A-Za-z]+\b/g) ?? []) {
    const def = allSource.match(new RegExp(`export type ${id}\\s*=([^;]+);`));
    if (def) lits.push(...literalsOf(def[1], allSource));
  }
  return lits;
}

function deprecatedEvents() {
  const p = join(SRC, "deprecations.ts");
  if (!existsSync(p)) return {};
  const map = {};
  for (const m of read(p).matchAll(/"([a-zA-Z:]+)"\s*:\s*"([a-zA-Z:]+)"/g)) map[m[1]] = m[2];
  return map;
}

function scoreApi(info, forwarding) {
  const allSource = walk(SRC, (p) => /\.(ts|vue)$/.test(p) && !p.endsWith(".test.ts"))
    .map(read)
    .join("\n");
  const deprecated = deprecatedEvents();
  const findings = [];
  let checks = 0;
  let ok = 0;
  const rule = (pass, msg) => {
    checks++;
    if (pass) ok++;
    else findings.push(msg);
  };
  // R1: los controles reenvian atributos al elemento nativo
  for (const f of forwarding) {
    rule(f.ok, `${f.name}: attributes land on the wrapper, not the control (${f.missing.join(", ")})`);
  }
  for (const c of info) {
    const source = c.file && existsSync(join(SRC, c.file)) ? read(join(SRC, c.file)) : "";
    // R2: eventos `update:*` o en participio
    for (const e of c.emits) {
      const fine = e.startsWith("update:") || /ed$/.test(e);
      const aliased = deprecated[e] && c.emits.includes(deprecated[e]);
      rule(fine || aliased, `${c.exportName}: event \`${e}\` is not past tense (selected, toggled…) nor update:*`);
    }
    // R3: tallas sm | md | lg
    const size = c.props.find((p) => p.name === "size");
    if (size) {
      const m = source.match(/\bsize\?:\s*([^;\n]+)/);
      const lits = m ? literalsOf(m[1], allSource) : [];
      const bad = lits.filter((l) => !SIZES.has(l));
      rule(lits.length > 0 && bad.length === 0, `${c.exportName}: size accepts ${lits.join(" | ") || "an unknown type"}; expected sm | md | lg`);
    }
    // R4: vocabulario de tonos canonico (success/warning/danger, no ok/warn)
    const tone = c.props.find((p) => p.name === "tone");
    if (tone) {
      const m = source.match(/\btone\?:\s*([^;\n]+)/);
      const lits = m ? literalsOf(m[1], allSource) : [];
      const canonical = lits.filter((l) => CANONICAL_TONES.has(l));
      const legacyOnly = lits.filter((l) => LEGACY_TONES.has(l)).filter((l) => {
        const pair = { ok: "success", warn: "warning", bad: "danger", default: "neutral" }[l];
        return !lits.includes(pair);
      });
      const defaultOk = tone.default === undefined || CANONICAL_TONES.has(tone.default);
      rule(
        canonical.length > 0 && legacyOnly.length === 0 && defaultOk,
        `${c.exportName}: tone uses ${lits.join(" | ")} (default ${JSON.stringify(tone.default)}); expected neutral | info | success | warning | danger | muted`,
      );
    }
  }
  return { score: pct(ok, checks), summary: `${ok}/${checks} API convention checks pass`, findings };
}

// ---------------------------------------------------------------------------
// 7. Catalog: lo que un kit de interfaz de aplicacion tiene que traer
// ---------------------------------------------------------------------------
export const CATALOG = [
  ["Button", ["UiButton"]], ["Icon button", ["UiIconButton"]],
  ["Toggle / segmented control", ["UiSegmented", "UiToggleGroup"]],
  ["Text input", ["UiInput"]], ["Textarea", ["UiTextarea"]], ["Select", ["UiSelect"]],
  ["Combobox / autocomplete", ["UiCombobox", "UiAutocomplete"]],
  ["Checkbox", ["UiCheckbox"]], ["Radio group", ["UiRadioGroup"]], ["Switch", ["UiSwitch"]],
  ["Slider", ["UiSlider"]], ["Date input", ["UiDateInput", "UiDatePicker"]],
  ["File input", ["UiFileInput", "UiFileUpload"]], ["Form field (label, help, error)", ["UiFormField", "UiField"]],
  ["Fieldset", ["UiFieldset"]], ["Tabs", ["UiTabs"]], ["Accordion", ["UiAccordion"]],
  ["Disclosure", ["UiDisclosure"]], ["Dialog", ["UiDialog"]], ["Drawer", ["UiDrawer"]],
  ["Popover", ["UiPopover"]], ["Tooltip", ["UiTooltip"]], ["Menu", ["UiMenu"]], ["Toast", ["UiToast", "UiToaster", "UiToastHost"]],
  ["Alert", ["UiAlert"]], ["Badge", ["UiBadge"]], ["Tag", ["UiTag"]], ["Avatar", ["UiAvatar"]],
  ["Breadcrumb", ["UiBreadcrumb"]], ["Pagination", ["UiPagination"]], ["Stepper", ["UiStepper"]],
  ["Progress bar", ["UiProgressBar"]], ["Spinner", ["UiSpinner"]], ["Skeleton", ["UiSkeleton"]],
  ["Empty state", ["UiEmptyState"]], ["Card", ["UiCard"]], ["Panel", ["UiPanel"]],
  ["Data table", ["UiDataTable"]], ["Description list", ["UiDescriptionList"]], ["Divider", ["UiDivider"]],
  ["Stack layout", ["UiStack"]], ["Grid layout", ["UiGrid"]], ["App shell", ["UiAppShell"]],
  ["App bar", ["UiAppBar"]], ["Navigation rail", ["UiNavRail"]], ["Bar chart", ["UiBarChart"]],
  ["Sparkline", ["UiSparkBars"]], ["Code block", ["UiCodeBlock"]], ["Keyboard hints", ["UiKeyHints"]],
  ["Calendar", ["UiCalendar", "UiCalendarMonth"]],
];

function scoreCatalog(info, docs) {
  const exports = new Set(info.map((c) => c.exportName));
  const findings = [];
  let ok = 0;
  for (const [label, names] of CATALOG) {
    const name = names.find((n) => exports.has(n));
    if (!name) {
      findings.push(`${label}: missing (${names.join(" / ")})`);
      continue;
    }
    const c = info.find((x) => x.exportName === name);
    const dir = c.file.split("/").slice(0, -1).join("/");
    const tested = existsSync(join(SRC, dir)) && readdirSync(join(SRC, dir)).some((f) => f.endsWith(".test.ts"));
    const docd = docs.some((d) => d.imports.includes(name));
    if (tested && docd) ok++;
    else findings.push(`${label}: ${name} exists but has no ${tested ? "docs page" : "tests"}`);
  }
  return { score: pct(ok, CATALOG.length), summary: `${ok}/${CATALOG.length} catalogue entries present, tested and documented`, findings };
}

// ---------------------------------------------------------------------------
// 8. Packaging & developer experience
// ---------------------------------------------------------------------------
function scorePackaging(meta) {
  const pkg = readJson(join(ROOT, "package.json"));
  const readme = read(join(ROOT, "README.md"));
  const changelog = existsSync(join(ROOT, "CHANGELOG.md")) ? read(join(ROOT, "CHANGELOG.md")) : "";
  const exportsMap = JSON.stringify(pkg.exports ?? {});
  const anyCount = walk(SRC, (p) => /\.(ts|vue)$/.test(p) && !p.endsWith(".test.ts"))
    .map((p) => (read(p).match(/:\s*any\b|as any\b|<any>/g) ?? []).length)
    .reduce((a, b) => a + b, 0);
  const checks = [
    ["Type declarations are built and exported (`types` in package.json)", Boolean(pkg.types || /"types"/.test(exportsMap)) && meta.dtsBuilt],
    ["Every preset stylesheet is exported (`./styles/*`)", /\.\/styles\//.test(exportsMap)],
    ["The library build passes", meta.buildOk],
    ["`vue-tsc --noEmit` passes", meta.typecheckOk],
    ["The docs site builds", meta.docsBuildOk],
    ["No `any` in library source", anyCount === 0],
    ["README covers install, usage, theming, presets and accessibility", ["Install", "Usage", "Theming", "Preset", "Accessib"].every((h) => readme.includes(h))],
    ["README lists every component or links the docs site", /https?:\/\//.test(readme) || /UiDataTable/.test(readme)],
    ["CHANGELOG has an entry for the next version", /## \[?(Unreleased|0\.2\.0)/i.test(changelog)],
    ["package.json has repository, keywords and engines", Boolean(pkg.repository && pkg.keywords && pkg.engines)],
    ["`sideEffects` keeps styles and allows tree-shaking", Array.isArray(pkg.sideEffects) && pkg.sideEffects.some((s) => s.includes("css"))],
    ["A `score` script reproduces this scorecard", Boolean(pkg.scripts?.score)],
  ];
  const findings = checks.filter(([, pass]) => !pass).map(([label]) => label);
  if (anyCount) findings.push(`${anyCount} \`any\` in library source`);
  return { score: pct(checks.filter(([, p]) => p).length, checks.length), summary: `${checks.filter(([, p]) => p).length}/${checks.length} packaging checks pass`, findings };
}

export function computeScores(meta) {
  const info = readJson(join(OUT, "introspect.json"));
  const docs = readJson(join(OUT, "docs.json"));
  const forwarding = readJson(join(OUT, "forwarding.json"));
  const browser = readJson(join(OUT, "browser.json"));
  const aspects = {
    Accessibility: scoreA11y(browser),
    "Test coverage": scoreCoverage(),
    Documentation: scoreDocs(info, docs),
    "Theming & tokens": scoreTokens(),
    Responsive: scoreResponsive(browser),
    "API consistency": scoreApi(info, forwarding),
    "Component catalogue": scoreCatalog(info, docs),
    "Packaging & DX": scorePackaging(meta),
  };
  for (const a of Object.values(aspects)) a.score = round(a.score);
  return aspects;
}
