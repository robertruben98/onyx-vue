import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { UiTimeline } from "../../index";
import Timeline from "./Timeline.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const items = [
  { id: "a", title: "Opened", meta: "by robert", time: "10:00", tone: "info" as const },
  { id: "b", title: "Tests failed", tone: "danger" as const },
  { id: "c", title: "Reviewing", active: true },
];

describe("Timeline status history (items)", () => {
  it("is exported from the package entry", () => {
    expect(UiTimeline).toBe(Timeline);
  });

  it("renders an <ol> with one <li> per item, in the given order", () => {
    const { container } = render(Timeline, { props: { items, label: "Lifecycle" } });
    const ol = container.querySelector("ol")!;
    expect(ol.getAttribute("aria-label")).toBe("Lifecycle");
    const lis = ol.querySelectorAll(":scope > li");
    expect(lis.length).toBe(3);
    expect(lis[0]!.textContent).toContain("Opened");
    expect(screen.getByText("by robert")).toBeTruthy();
    expect(screen.getByText("10:00")).toBeTruthy();
  });

  it("shows an icon in the marker besides the colour for a danger item", () => {
    const { container } = render(Timeline, { props: { items } });
    const marker = container.querySelectorAll("li")[1]!.querySelector(".ui-timeline__status")!;
    expect(marker.classList.contains("ui-timeline__status--danger")).toBe(true);
    expect(marker.textContent?.trim()).toBe("✕");
  });

  it("marks the active item", () => {
    const { container } = render(Timeline, { props: { items } });
    const li = container.querySelectorAll("li")[2]!;
    expect(li.querySelector(".ui-timeline__status--active")).toBeTruthy();
    expect(li.getAttribute("aria-current")).toBe("step");
  });

  it("renders the item slot", () => {
    render(Timeline, {
      props: { items },
      slots: { item: `<template #item="{ item }"><b>custom {{ item.id }}</b></template>` },
    });
    expect(screen.getByText("custom a")).toBeTruthy();
  });

  it("compact: one marker per item inline, each with tooltip and accessible name", () => {
    const { container } = render(Timeline, { props: { items, variant: "compact" } });
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(3);
    expect(container.querySelector(".ui-timeline")!.classList.contains("ui-timeline--compact")).toBe(true);
    const m = lis[1]!.querySelector(".ui-timeline__status") as HTMLElement;
    expect(m.getAttribute("title")).toBe("Tests failed");
    expect(m.getAttribute("role")).toBe("img");
    expect(m.getAttribute("aria-label")).toBe("Tests failed");
    expect(container.querySelector(".ui-timeline__title")).toBeNull();
  });

  it("stops the pulse under prefers-reduced-motion", () => {
    const css = readFileSync(join(process.cwd(), "src", "components", "timeline", "timeline.scss"), "utf8");
    expect(css).toMatch(/\.ui-timeline__status--active\s*\{[^}]*animation:\s*[^;]*pulse/);
    const at = css.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(at).toBeGreaterThan(-1);
    expect(css.slice(at)).toMatch(/\.ui-timeline__status--active\s*\{\s*animation:\s*none/);
  });

  it("leaves the dated events mode untouched", () => {
    const { container } = render(Timeline, { props: { events: [{ date: "2026-01-01", title: "Old" }] } });
    expect(container.querySelector(".ui-timeline--status")).toBeNull();
    expect(container.querySelector(".ui-timeline__event")).toBeTruthy();
  });

  it.each(["list", "compact"] as const)("has no axe violations (%s)", async (variant) => {
    const { container } = render(Timeline, { props: { items, variant, label: "History" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
