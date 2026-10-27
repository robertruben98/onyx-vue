// Mediciones que solo un navegador de verdad puede hacer, sobre el sitio de
// documentacion construido (`docs/dist`):
//
//  - Accessibility: axe-core con TODAS sus reglas, incluido el contraste, que
//    en jsdom no se calcula. Solo sobre las demos (`.demo__preview`): el cromo
//    de la doc no es la libreria. Una pasada por tema, porque cada preset
//    cambia los colores y el contraste es por preset.
//  - Responsive: cada pagina de componente a 360, 768 y 1280 px y cada pattern
//    a 640, 1000 y 1440 px, buscando contenido que se sale de su sitio.
//
// Escribe `scorecard/.out/browser.json`.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const DIST = join(ROOT, "docs", "dist");
const OUT = join(ROOT, "scorecard", ".out");
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

export const THEMES = [
  { id: "default", preset: "default", dark: false },
  { id: "dark", preset: "default", dark: true },
  { id: "acme", preset: "acme", dark: false },
  { id: "console", preset: "console", dark: false },
  { id: "matrix", preset: "matrix", dark: false },
];
const COMPONENT_WIDTHS = [360, 768, 1280];
const PATTERN_WIDTHS = [640, 1000, 1440];

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file = join(DIST, path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function withPage(browser, theme, width, fn) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  await context.addInitScript(([preset, dark]) => {
    localStorage.setItem("onyx-preset", preset);
    localStorage.setItem("onyx-dark", String(dark));
  }, [theme.preset, theme.dark]);
  const page = await context.newPage();
  try {
    return await fn(page);
  } finally {
    await context.close();
  }
}

/** Corre `jobs` con `n` a la vez. */
async function pool(jobs, n) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const i = next++;
      results[i] = await jobs[i]();
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}

async function axeOn(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".demo__preview", { timeout: 10000 });
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run(
      { include: [".demo__preview"] },
      { resultTypes: ["violations"] },
    );
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      sample: v.nodes[0]?.target?.join(" ") ?? "",
    }));
  });
}

/**
 * Contenido que se sale: scroll horizontal de la pagina, o un elemento cuyo
 * contenido desborda su caja sin que nada lo recorte. Lo que vive en un
 * contenedor con scroll o recorte, o en una capa posicionada (tooltip,
 * popover), no cuenta: ahi desbordar es lo que se pretende.
 */
async function spillOn(page, url, scope) {
  await page.goto(url, { waitUntil: "networkidle" });
  if (scope) await page.waitForSelector(scope, { timeout: 10000 });
  await page.waitForTimeout(200);
  return page.evaluate((scopeSel) => {
    const doc = document.documentElement;
    const pageScroll = doc.scrollWidth > doc.clientWidth + 1;
    const roots = scopeSel ? [...document.querySelectorAll(scopeSel)] : [document.body];
    const spills = [];
    const clipped = (el, root) => {
      for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (["auto", "scroll", "hidden", "clip"].includes(s.overflowX)) return true;
        if (["absolute", "fixed"].includes(s.position)) return true;
      }
      return false;
    };
    for (const root of roots) {
      const box = root.getBoundingClientRect();
      for (const el of root.querySelectorAll("*")) {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden") continue;
        if (["absolute", "fixed"].includes(s.position)) continue;
        if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
        if (clipped(el, root)) continue;
        const r = el.getBoundingClientRect();
        const outside = r.width > 0 && r.right > box.right + 1;
        const overflowing =
          s.overflowX === "visible" &&
          el.clientWidth > 0 &&
          el.scrollWidth > el.clientWidth + 1 &&
          [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (outside || overflowing) {
          const label = (el.getAttribute("class") ?? el.tagName).split(" ")[0];
          spills.push(`${el.tagName.toLowerCase()}.${label}`);
          if (spills.length > 5) break;
        }
      }
    }
    return { pageScroll, spills };
  }, scope);
}

export async function measureBrowser({ docs, patterns, concurrency = 6 }) {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    const a11yJobs = [];
    for (const theme of THEMES) {
      for (const d of docs) {
        a11yJobs.push(async () => {
          try {
            const violations = await withPage(browser, theme, 1280, (p) =>
              axeOn(p, `${base}/components/${d}`),
            );
            return { component: d, theme: theme.id, violations };
          } catch (e) {
            return { component: d, theme: theme.id, error: String(e).slice(0, 200) };
          }
        });
      }
    }
    const spillJobs = [];
    for (const width of COMPONENT_WIDTHS) {
      for (const d of docs) {
        spillJobs.push(async () => {
          try {
            const r = await withPage(browser, THEMES[0], width, (p) =>
              spillOn(p, `${base}/components/${d}`, ".demo__preview"),
            );
            return { target: `component:${d}`, width, ...r };
          } catch (e) {
            return { target: `component:${d}`, width, error: String(e).slice(0, 200) };
          }
        });
      }
    }
    for (const width of PATTERN_WIDTHS) {
      for (const p of patterns) {
        spillJobs.push(async () => {
          try {
            const r = await withPage(browser, THEMES[0], width, (pg) =>
              spillOn(pg, `${base}/patterns/${p}/frame`, null),
            );
            return { target: `pattern:${p}`, width, ...r };
          } catch (e) {
            return { target: `pattern:${p}`, width, error: String(e).slice(0, 200) };
          }
        });
      }
    }
    const a11y = await pool(a11yJobs, concurrency);
    const responsive = await pool(spillJobs, concurrency);
    mkdirSync(OUT, { recursive: true });
    const result = { a11y, responsive };
    writeFileSync(join(OUT, "browser.json"), JSON.stringify(result, null, 2));
    return result;
  } finally {
    await browser.close();
    server.close();
  }
}

// Uso directo: node scorecard/browser.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const docs = JSON.parse(readFileSync(join(OUT, "docs.json"), "utf8")).map((d) => d.id);
  const patterns = ["ops-overview", "run-view"];
  const t0 = Date.now();
  const r = await measureBrowser({ docs, patterns });
  console.log(`browser: ${r.a11y.length} axe runs, ${r.responsive.length} layout runs in ${Math.round((Date.now() - t0) / 1000)}s`);
}
