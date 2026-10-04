import { render } from "@testing-library/vue";
import type { Component } from "vue";
import { canonicalTone } from "./tone";
import { UiBlockMeter } from "../components/block-meter";
import { UiCodeBlock } from "../components/code-block";
import { UiFilterChip } from "../components/filter-chip";
import { UiMetricChip } from "../components/metric-chip";
import { UiReadout } from "../components/readout";
import { UiTriStateCount } from "../components/tri-state-count";

describe("canonicalTone", () => {
  it("translates the legacy spellings and leaves the rest alone", () => {
    expect(canonicalTone("ok")).toBe("success");
    expect(canonicalTone("warn")).toBe("warning");
    expect(canonicalTone("default")).toBe("neutral");
    expect(canonicalTone("danger")).toBe("danger");
    expect(canonicalTone("info")).toBe("info");
  });
});

// Un componente pinta lo mismo con el nombre canonico que con el antiguo: el
// alias no es un camino distinto, es el mismo con otra palabra.
const PAIRS: { name: string; comp: unknown; props: Record<string, unknown>; legacy: string; canonical: string }[] = [
  { name: "UiBlockMeter", comp: UiBlockMeter, props: { value: 3, max: 10 }, legacy: "ok", canonical: "success" },
  { name: "UiBlockMeter", comp: UiBlockMeter, props: { value: 3, max: 10 }, legacy: "warn", canonical: "warning" },
  { name: "UiMetricChip", comp: UiMetricChip, props: { label: "PRs", value: 4 }, legacy: "ok", canonical: "success" },
  { name: "UiMetricChip", comp: UiMetricChip, props: { label: "PRs", value: 4 }, legacy: "warn", canonical: "warning" },
  { name: "UiTriStateCount", comp: UiTriStateCount, props: { value: 2 }, legacy: "ok", canonical: "success" },
  { name: "UiTriStateCount", comp: UiTriStateCount, props: { value: 2 }, legacy: "warn", canonical: "warning" },
  { name: "UiFilterChip", comp: UiFilterChip, props: { label: "Open", count: 3, pressed: true }, legacy: "ok", canonical: "success" },
  { name: "UiFilterChip", comp: UiFilterChip, props: { label: "Open", count: 3, pressed: true }, legacy: "warn", canonical: "warning" },
  { name: "UiCodeBlock", comp: UiCodeBlock, props: { text: "x" }, legacy: "default", canonical: "neutral" },
  { name: "UiReadout", comp: UiReadout, props: { label: "Time", value: 6 }, legacy: "default", canonical: "neutral" },
];

describe.each(PAIRS)("$name: tone $legacy and $canonical", ({ comp, props, legacy, canonical }) => {
  it("render the same markup", () => {
    const a = render(comp as Component, { props: { ...props, tone: legacy } }).container.innerHTML;
    const b = render(comp as Component, { props: { ...props, tone: canonical } }).container.innerHTML;
    expect(b).toBe(a);
  });
});
