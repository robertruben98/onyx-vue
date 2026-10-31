import { cleanup, render } from "@testing-library/vue";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it("warns once across metric chip instances, with replacement and removal version", async () => {
  const { default: Chip } = await import("../components/metric-chip/MetricChip.vue");
  render(Chip, { props: { label: "One", tone: "ok" } });
  render(Chip, { props: { label: "Two", tone: "ok" } });
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/ok.*success.*1\.0/));
});

it("warns on subscribing to change without needing an emission, once across instances", async () => {
  const { default: Select } = await import("../components/select/Select.vue");
  render(Select, { props: { onChange: vi.fn() } });
  render(Select, { props: { onChange: vi.fn() } });
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/change.*changed.*1\.0/));
});

it("does not warn for canonical names or absent legacy listeners", async () => {
  const { default: Select } = await import("../components/select/Select.vue");
  const { canonicalTone } = await import("./tone");
  render(Select);
  render(Select, { props: { onChanged: vi.fn() } });
  canonicalTone("success");
  expect(console.warn).not.toHaveBeenCalled();
});

it("warns for listeners added on update, including once listeners", async () => {
  const { default: Select } = await import("../components/select/Select.vue");
  const view = render(Select);
  await view.rerender({ onChangeOnce: vi.fn() });
  expect(console.warn).toHaveBeenCalledTimes(1);
});

it("does not warn with the production flag", async () => {
  vi.stubEnv("NODE_ENV", "production");
  const { default: Select } = await import("../components/select/Select.vue");
  const { canonicalTone } = await import("./tone");
  render(Select, { props: { onChange: vi.fn() } });
  canonicalTone("ok");
  expect(console.warn).not.toHaveBeenCalled();
});

it("warns even when an error state does not render the supplied tone", async () => {
  const { default: Chip } = await import("../components/metric-chip/MetricChip.vue");
  render(Chip, { props: { label: "Failed", state: "error", tone: "warn" } });
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/warn.*warning.*1\.0/));
});

it("warns independently for every legacy tone, but only once per spelling", async () => {
  const { canonicalTone } = await import("./tone");
  for (const tone of ["ok", "warn", "default", "ok", "warn", "default"]) canonicalTone(tone);
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/default.*neutral.*1\.0/));
});

it("recognizes all declared deprecated events and ignores undeclared native listeners", async () => {
  const { defineComponent, h } = await import("vue");
  const { useDeprecatedEvents } = await import("./deprecated-events");
  const { DEPRECATED_EVENTS } = await import("../deprecations");
  for (const [name, replacement] of Object.entries(DEPRECATED_EVENTS)) {
    const Component = defineComponent({
      emits: [name, replacement],
      setup() { useDeprecatedEvents(); return () => h("div"); },
    });
    render(Component, { props: { [`on${name[0].toUpperCase()}${name.slice(1)}Once`]: vi.fn() } });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`use "${replacement}"`));
  }
  expect(console.warn).toHaveBeenCalledTimes(Object.keys(DEPRECATED_EVENTS).length);
  vi.mocked(console.warn).mockClear();
  const Native = defineComponent({
    emits: ["clicked"],
    setup() { useDeprecatedEvents(); return () => h("div"); },
  });
  render(Native, { attrs: { onChange: vi.fn() } });
  expect(console.warn).not.toHaveBeenCalled();
});

it("warns on @checkedChange on UiCheckbox (the call must run inside setup)", async () => {
  const { default: Checkbox } = await import("../components/checkbox/Checkbox.vue");
  render(Checkbox, { props: { label: "x", onCheckedChange: vi.fn() } });
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/checkedChange.*checkedChanged.*1\.0/));
});

it("never asks import.meta.env: the library build would freeze it to false", () => {
  // Vite replaces `import.meta.env.DEV` when it builds the library, so the
  // warnings were stripped from `dist` and a tgz consumer never saw one. The
  // decision belongs to the consumer's bundler, via `isDev()`.
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|vue)$/.test(f) && !/\.test\.ts$/.test(f) ? [p] : [];
    });
  const offenders = walk(join(process.cwd(), "src")).filter((f) =>
    readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .some((l) => !/^\s*\/\//.test(l) && l.includes("import.meta.env")),
  );
  expect(offenders).toEqual([]);
});
