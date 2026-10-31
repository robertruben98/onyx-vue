/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/vue";
import { afterEach } from "vitest";
import { defineComponent, h, createApp } from "vue";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { provideOnyxLocale, ES_MESSAGES, DEFAULT_MESSAGES } from "./locale";
import Select from "./components/select/Select.vue";
import Dialog from "./components/dialog/Dialog.vue";
import DataTable from "./components/data-table/DataTable.vue";
import StateBar from "./components/state-bar/StateBar.vue";
import Countdown from "./components/countdown/Countdown.vue";
import MetricChip from "./components/metric-chip/MetricChip.vue";
import RelativeTime from "./components/relative-time/RelativeTime.vue";
import Stepper from "./components/stepper/Stepper.vue";
import Pagination from "./components/pagination/Pagination.vue";

afterEach(cleanup);
function fixture(spanish = false, override = false) {
  return defineComponent({
    setup() {
      if (spanish) provideOnyxLocale(ES_MESSAGES);
      return () => [
        h(Select, { options: [], ...(override ? { placeholder: "Choose mine" } : {}) }),
        h(Dialog, { open: true, heading: "Example", ...(override ? { closeLabel: "Close mine" } : {}) }),
        h(DataTable, { columns: [], rows: [], ...(override ? { emptyText: "Empty mine" } : {}) }),
        h(StateBar, { counts: {}, total: 2 }),
      ];
    },
  });
}
describe("locale defaults", () => {
  it("provides Spanish throughout the subtree, including teleports", () => {
    render(fixture(true));
    expect(screen.getByRole("combobox").textContent).toContain("Selecciona…");
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
    expect(screen.getByText("Sin datos")).toBeTruthy();
  });
  it("keeps explicit props above the provider", () => {
    render(fixture(true, true));
    expect(screen.getByRole("combobox").textContent).toContain("Choose mine");
    expect(screen.getByRole("button", { name: "Close mine" })).toBeTruthy();
    expect(screen.getByText("Empty mine")).toBeTruthy();
  });
  it("keeps English without a provider, with an English StateBar", () => {
    render(fixture());
    expect(screen.getByRole("combobox").textContent).toContain("Select…");
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    expect(screen.getByText("No data")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Run progress: 0 of 2. 2 pending." })).toBeTruthy();
    expect(Object.keys(ES_MESSAGES)).toEqual(Object.keys(DEFAULT_MESSAGES));
  });
});

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? sources(join(dir, entry.name)) : entry.name.endsWith(".vue") ? [join(dir, entry.name)] : []);
}
it("keeps user-facing prop defaults and template prose in the messages module", () => {
  const violations: string[] = [];
  for (const file of sources("src/components")) {
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|<!--[^]*?-->|\/\/[^\n]*/g, "");
    // Reviewed implementation tokens, not copy: reject new literal defaults even
    // when a new prop has an unfamiliar name (including arrays and factories).
    const tokens = new Set(["400px", "F8", "absolute", "auto", "bottom", "boxed", "button",
      "card", "cells", "circle", "danger", "date", "default", "div", "elevated", "end",
      "filled", "h3", "higher-is-better", "horizontal", "info", "known", "lg", "long",
      "md", "medium", "neutral", "none", "paginated", "pending", "plain", "primary",
      "region", "right", "secondary", "sm", "stacked", "start", "stretch", "text",
      "top", "unknown", "vertical", "wrap", "xl"]);
    for (const script of source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
      const ast = ts.createSourceFile(file, script[1], ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && node.expression.getText(ast) === "withDefaults" && node.arguments[1]) {
          function checkDefault(child: ts.Node) {
            if (ts.isStringLiteralLike(child) && /[a-zA-Z]/.test(child.text) && !tokens.has(child.text))
              violations.push(file + ": " + child.text);
            ts.forEachChild(child, checkDefault);
          }
          checkDefault(node.arguments[1]);
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
    const patterns = [
      /\b(?:\w*Label|label|placeholder|\w*Placeholder|\w*Text|armedHint|tableSummary|categoryHeader|tableHeaders|noun|title|heading|summary)\s*:\s*["'`][^"'\n`]*[a-zA-Z][^"'\n`]*["'`]/g,
      /(?<!:)\b(?:aria-label|title|placeholder)="[^"]*[a-zA-Z][^"]*"/g,
      />\s*[A-Za-z][^<{]*</g,
    ];
    // A template literal may interpolate data, but its surrounding words belong in the catalog.
    for (const literal of source.matchAll(/`([^`]+)`/g)) {
      const prose = literal[1].replace(/\$\{[^}]*\}/g, "");
      if (!/^\((?:min|max)-width:/.test(prose) && /\b[a-zA-Z]+ [a-zA-Z]+\b|: [a-zA-Z]+| of /.test(prose)) violations.push(file + ": " + literal[0]);
    }
    for (const [index, pattern] of patterns.entries()) for (const match of (index === 2 ? source.slice(source.indexOf("<template>")) : source).matchAll(pattern)) violations.push(file + ": " + match[0]);
  }
  expect(violations).toEqual([]);
});

it("supports app-level provision without leaking into other apps", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(Select, { options: [] });
  provideOnyxLocale(ES_MESSAGES, app);
  app.mount(host);
  expect(host.textContent).toContain("Selecciona…");
  app.unmount();
  host.remove();
  render(Select, { props: { options: [] } });
  expect(screen.getByRole("combobox").textContent).toContain("Select…");
});

it("lets a nearer provider override its ancestor", () => {
  const Child = defineComponent({
    setup() {
      provideOnyxLocale({ ...DEFAULT_MESSAGES, selectPlaceholder: "Local choice" });
      return () => h(Select, { options: [] });
    },
  });
  render(defineComponent({
    setup() {
      provideOnyxLocale(ES_MESSAGES);
      return () => h(Child);
    },
  }));
  expect(screen.getByRole("combobox").textContent).toContain("Local choice");
});

// Exercise Vue's actual default-prop resolution for every catalog-backed prop,
// without needing unrelated required data, timers or geometry for each component.
const components = import.meta.glob("./components/**/*.vue", { eager: true, import: "default" });
for (const file of sources("src/components")) {
  const source = readFileSync(file, "utf8");
  const defaults = [...source.matchAll(/(\w+): \(\) => useOnyxLocale\(\)\.(\w+)/g)];
  if (!defaults.length) continue;
  const component = components["./" + file.slice(4)] as { props: Record<string, unknown> };
  it.each([false, true])(`resolves all localized props in ${file} (Spanish: %s)`, (spanish) => {
    const catalog = spanish ? ES_MESSAGES : DEFAULT_MESSAGES;
    const probe = defineComponent({
      props: Object.fromEntries(defaults.map(([, prop]) => [prop, component.props[prop]])) as never,
      setup(props) {
        for (const [, prop, key] of defaults) {
          expect((props as Record<string, unknown>)[prop]).toEqual(catalog[key as keyof typeof catalog]);
        }
        return () => null;
      },
    });
    render(defineComponent({
      setup() {
        if (spanish) provideOnyxLocale(ES_MESSAGES);
        return () => h(probe);
      },
    }));
  });
}

it("localizes computed announcements and merges partial unit/state prop overrides", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  render(defineComponent({
    setup() {
      provideOnyxLocale(ES_MESSAGES);
      return () => [
        h(Countdown, { to: now.getTime() + 3_660_000, now, units: ["hours", "minutes"],
          unitLabels: { hours: { short: "H", one: "hora personalizada", other: "horas personalizadas" } } }),
        h(MetricChip, { label: "Issues", value: 4, previous: 2 }),
        h(RelativeTime, { date: new Date("2025-12-01T00:00:00Z"), now }),
        h(Stepper, { steps: [{ label: "First", state: "done" }, { label: "Second", state: "active" }],
          stateLabels: { done: "Terminado" } }),
        h(Pagination, { pageCount: 2 }),
      ];
    },
  }));
  expect(screen.getByRole("timer").textContent).toContain("1 hora personalizada y 1 minuto");
  expect(screen.getByText("sube 2")).toBeTruthy();
  expect(screen.getByText("1mes")).toBeTruthy();
  expect(screen.getByText("(Terminado)")).toBeTruthy();
  expect(screen.getByText("(en curso)")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Página 2" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Página siguiente" })).toBeTruthy();
});
