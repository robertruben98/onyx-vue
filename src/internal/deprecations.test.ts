import { cleanup, render } from "@testing-library/vue";
import { vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("DEV", true);
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
  vi.stubEnv("DEV", false);
  const { default: Select } = await import("../components/select/Select.vue");
  const { canonicalTone } = await import("./tone");
  render(Select, { props: { onChange: vi.fn() } });
  canonicalTone("ok");
  expect(console.warn).not.toHaveBeenCalled();
});
