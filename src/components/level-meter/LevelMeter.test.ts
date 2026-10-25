import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import LevelMeter from "./LevelMeter.vue";

const scaleOf = (el: Element) => Number((el as HTMLElement).style.transform.match(/scaleY\(([\d.]+)\)/)![1]);
const bars = (container: Element) => [...container.querySelectorAll(".ui-level-meter__bar")];

describe("LevelMeter (Vue)", () => {
  it("draws five bars at the floor in silence, hidden from assistive tech", () => {
    const { container } = render(LevelMeter);
    const all = bars(container);
    expect(all).toHaveLength(5);
    expect(all.map(scaleOf)).toEqual([0.15, 0.15, 0.15, 0.15, 0.15]);
    expect(container.querySelector(".ui-level-meter")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("rises with the level, the middle bar highest", () => {
    const { container } = render(LevelMeter, { props: { level: 0.5 } });
    const s = bars(container).map(scaleOf);
    expect(s[2]).toBeGreaterThan(s[1]);
    expect(s[1]).toBeGreaterThan(s[0]);
    expect(s[0]).toBeCloseTo(s[4]);
    expect(s[2]).toBeGreaterThan(0.15);
  });

  it("clamps the level and the bar count", () => {
    const { container } = render(LevelMeter, { props: { level: 7, bars: 1 } });
    const s = bars(container).map(scaleOf);
    expect(s).toHaveLength(3);
    expect(Math.max(...s)).toBe(1);
    const { container: neg } = render(LevelMeter, { props: { level: -2 } });
    expect(bars(neg).map(scaleOf).every((v) => v === 0.15)).toBe(true);
  });

  it("is a named image when labelled, without the value in the name", () => {
    render(LevelMeter, { props: { level: 0.4, label: "Microphone level" } });
    const img = screen.getByRole("img", { name: "Microphone level" });
    expect(img.hasAttribute("aria-hidden")).toBe(false);
  });

  it("smooths with a transition that reduced motion turns off", () => {
    const scss = readFileSync(join(process.cwd(), "src", "components", "level-meter", "level-meter.scss"), "utf8");
    expect(scss).toMatch(/transition: transform var\(--ui-level-meter-smoothing\)/);
    expect(scss.slice(scss.indexOf("prefers-reduced-motion"))).toMatch(/transition: none/);
  });

  it("has no axe violations", async () => {
    const { container } = render(LevelMeter, { props: { level: 0.5, label: "Microphone level" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
