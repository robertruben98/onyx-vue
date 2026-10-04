// npm run score — mide la libreria y escribe SCORECARD.md.
//
//   node scorecard/run.mjs           todo
//   node scorecard/run.mjs --quick   reutiliza cobertura y navegador de la
//                                    ultima pasada (para iterar rapido)
//
// Sale con 1 si algun aspecto no pasa de THRESHOLD.
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { measureBrowser } from "./browser.mjs";
import { computeScores } from "./score.mjs";

export const THRESHOLD = 90;
const ROOT = process.cwd();
const OUT = join(ROOT, "scorecard", ".out");
const quick = process.argv.includes("--quick");
mkdirSync(OUT, { recursive: true });

function step(label, cmd, opts = {}) {
  const t0 = Date.now();
  try {
    execSync(cmd, { stdio: "pipe", cwd: opts.cwd ?? ROOT, maxBuffer: 64 * 1024 * 1024 });
    console.log(`  ✓ ${label} (${Math.round((Date.now() - t0) / 1000)}s)`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${label} (${Math.round((Date.now() - t0) / 1000)}s)`);
    const tail = String(e.stdout ?? "").split("\n").slice(-15).join("\n");
    if (tail.trim()) console.log(tail);
    return false;
  }
}

console.log("scorecard: measuring");
step("introspection and forwarding probes", "npx vitest run --config scorecard/vitest.config.ts");
if (!quick || !existsSync(join(OUT, "coverage", "coverage-summary.json"))) {
  step(
    "test suite with coverage",
    "npx vitest run src --coverage --coverage.provider=v8 " +
      "--coverage.include='src/**/*.{ts,vue}' --coverage.exclude='src/**/*.test.ts' " +
      "--coverage.exclude='src/**/*.docs.ts' --coverage.exclude='src/test-setup.ts' " +
      `--coverage.reporter=json-summary --coverage.reportsDirectory=${join(OUT, "coverage")}`,
  );
}
const meta = {
  typecheckOk: step("vue-tsc --noEmit", "npx vue-tsc --noEmit"),
  buildOk: step("library build (bundle + type declarations)", "npm run build"),
  // El script de la doc (vue-tsc + vite build), no solo vite: el typecheck de la doc
  // incluye los tests de src y es el que se rompe si uno usa un global de vitest.
  docsBuildOk: step("docs build (typecheck + bundle)", "npm run build", { cwd: join(ROOT, "docs") }),
};
meta.dtsBuilt =
  existsSync(join(ROOT, "dist")) &&
  readdirSync(join(ROOT, "dist"), { recursive: true }).some((f) => String(f).endsWith(".d.ts"));

if (!quick || !existsSync(join(OUT, "browser.json"))) {
  const t0 = Date.now();
  const docs = JSON.parse(readFileSync(join(OUT, "docs.json"), "utf8")).map((d) => d.id);
  const patterns = readdirSync(join(ROOT, "docs", "src", "patterns"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  await measureBrowser({ docs, patterns });
  console.log(`  ✓ browser: axe × themes, layout × widths (${Math.round((Date.now() - t0) / 1000)}s)`);
}

const aspects = computeScores(meta);
const rows = Object.entries(aspects);
const width = Math.max(...rows.map(([k]) => k.length));
console.log("\nscorecard:");
for (const [name, a] of rows) {
  const mark = a.score > THRESHOLD ? "✓" : "✗";
  console.log(`  ${mark} ${name.padEnd(width)}  ${String(a.score).padStart(5)}  ${a.summary}`);
}

const date = new Date().toISOString().slice(0, 10);
const md = [
  "# Onyx Vue scorecard",
  "",
  `Measured ${date} by \`npm run score\`. Every aspect must score above ${THRESHOLD}. How each one is measured: [scorecard/README.md](scorecard/README.md).`,
  "",
  "| Aspect | Score | Measured |",
  "|---|---|---|",
  ...rows.map(([name, a]) => `| ${name} | ${a.score > THRESHOLD ? "✅" : "❌"} ${a.score} | ${a.summary} |`),
  "",
  ...rows.flatMap(([name, a]) =>
    a.findings.length
      ? [`## ${name} — what costs points`, "", ...a.findings.slice(0, 60).map((f) => `- ${f}`), ...(a.findings.length > 60 ? [`- … and ${a.findings.length - 60} more`] : []), ""]
      : [],
  ),
].join("\n");
writeFileSync(join(ROOT, "SCORECARD.md"), md);
writeFileSync(
  join(ROOT, "scorecard", "report.json"),
  JSON.stringify({ date, threshold: THRESHOLD, aspects: Object.fromEntries(rows.map(([k, a]) => [k, { score: a.score, summary: a.summary, findings: a.findings.length }])) }, null, 2),
);
console.log("\nwrote SCORECARD.md and scorecard/report.json");
process.exit(rows.every(([, a]) => a.score > THRESHOLD) ? 0 : 1);
