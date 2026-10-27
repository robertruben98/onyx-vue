import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ProgressRing from "./ProgressRing.vue";

const sheet = (p: string) => readFileSync(join(process.cwd(), "src", ...p.split("/")), "utf8");

describe("ProgressRing (Vue)", () => {
  it("is a progressbar with its value, bounds and name", () => {
    render(ProgressRing, { props: { value: 34, max: 50, label: "Level 7", valueText: "34 of 50 XP" } });
    const bar = screen.getByRole("progressbar", { name: "Level 7" });
    expect(bar.getAttribute("aria-valuenow")).toBe("34");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("50");
    expect(bar.getAttribute("aria-valuetext")).toBe("34 of 50 XP");
  });

  it("clamps the value and draws the arc as the percentage left", () => {
    const { container, rerender } = render(ProgressRing, { props: { value: 150, label: "x" } });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(container.querySelector(".ui-ring__arc")?.getAttribute("stroke-dashoffset")).toBe("0");
    return rerender({ value: 25, max: 100, label: "x" }).then(() => {
      expect(container.querySelector(".ui-ring__arc")?.getAttribute("stroke-dashoffset")).toBe("75");
      expect(container.querySelector(".ui-ring__arc")?.getAttribute("pathLength")).toBe("100");
    });
  });

  it("draws no arc at zero (a round cap would still paint a dot)", () => {
    const { container } = render(ProgressRing, { props: { value: 0, label: "x" } });
    expect(container.querySelector(".ui-ring__track")).toBeTruthy();
    expect(container.querySelector(".ui-ring__arc")).toBeNull();
  });

  it("is role=img named by the label when indeterminate, with no value", () => {
    const { container } = render(ProgressRing, { props: { indeterminate: true, label: "Loading" } });
    const img = screen.getByRole("img", { name: "Loading" });
    expect(img.getAttribute("aria-valuenow")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(container.querySelector(".ui-ring--indeterminate")).toBeTruthy();
  });

  it("shows the rounded percentage with showValue, and the slot replaces it", async () => {
    const { container, rerender } = render(ProgressRing, { props: { value: 2, max: 3, showValue: true, label: "x" } });
    expect(container.querySelector(".ui-progress-ring__center")?.textContent).toBe("67%");
    await rerender({ value: 2, max: 3, showValue: false, label: "x" });
    expect(container.querySelector(".ui-progress-ring__center")).toBeNull();
    const slotted = render(ProgressRing, { props: { value: 2, label: "Level 7" }, slots: { default: "<b>7</b>" } });
    expect(slotted.container.querySelector(".ui-progress-ring__center b")?.textContent).toBe("7");
  });

  it("takes a token size or a px size", () => {
    const { container } = render(ProgressRing, { props: { size: "xl", label: "x" } });
    expect(container.querySelector(".ui-progress-ring--xl")).toBeTruthy();
    const px = render(ProgressRing, { props: { size: 96, label: "x" } });
    expect((px.container.querySelector(".ui-progress-ring") as HTMLElement).style.getPropertyValue("--ui-progress-ring-size")).toBe("96px");
  });

  it("paints the tone, or a gradient with a unique id", () => {
    const { container } = render(ProgressRing, { props: { value: 50, tone: "warning", label: "x" } });
    expect(container.querySelector(".ui-ring--warning")).toBeTruthy();
    const a = render(ProgressRing, { props: { value: 50, gradient: true, label: "a" } });
    const b = render(ProgressRing, { props: { value: 50, gradient: true, label: "b" } });
    const idA = a.container.querySelector("linearGradient")!.id;
    const idB = b.container.querySelector("linearGradient")!.id;
    expect(idA).not.toBe(idB);
    expect((a.container.querySelector(".ui-ring__arc") as SVGElement).style.stroke).toContain(idA);
  });

  it("thickness defaults to 12 for sm and 10 otherwise", () => {
    const sm = render(ProgressRing, { props: { size: "sm", value: 10, label: "x" } });
    expect(sm.container.querySelector(".ui-ring__arc")?.getAttribute("stroke-width")).toBe("12");
    const md = render(ProgressRing, { props: { value: 10, label: "x", thickness: 6 } });
    expect(md.container.querySelector(".ui-ring__arc")?.getAttribute("r")).toBe("47");
  });

  it("the drawing is hidden from assistive technology", () => {
    const { container } = render(ProgressRing, { props: { value: 10, label: "x" } });
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    [{ value: 40, label: "Readiness", showValue: true }],
    [{ indeterminate: true, label: "Loading" }],
    [{ value: 3, max: 4, gradient: true, size: "lg", label: "Lessons" }],
  ] as const)("has no axe violations (%o)", async (props) => {
    const { container } = render(ProgressRing, { props });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("respects reduced motion: no transition, no spin", () => {
    const css = sheet("internal/ring-svg.scss");
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.ui-ring__arc \{ transition: none; \}/);
    expect(reduced).toMatch(/\.ui-ring--indeterminate \{ animation: none; \}/);
    expect(css).toMatch(/transition: stroke-dashoffset var\(--ui-progress-ring-duration\)/);
  });
});
