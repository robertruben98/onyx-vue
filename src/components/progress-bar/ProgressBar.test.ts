import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ProgressBar from "./ProgressBar.vue";

describe("ProgressBar (Vue)", () => {
  it("exposes role=progressbar with ARIA value attributes", () => {
    render(ProgressBar, { props: { value: 40, label: "Upload" } });
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("clamps the fill width to 0–100%", () => {
    const { container } = render(ProgressBar, { props: { value: 150 } });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("computes percentage against a custom max", () => {
    const { container } = render(ProgressBar, { props: { value: 1, max: 4 } });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(ProgressBar, { props: { indeterminate: true, label: "Loading" } });
    expect(
      screen.getByRole("progressbar").hasAttribute("aria-valuenow"),
    ).toBe(false);
  });

  it("has no axe violations (determinate)", async () => {
    const { container } = render(ProgressBar, {
      props: { value: 60, label: "Progress" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (indeterminate)", async () => {
    const { container } = render(ProgressBar, {
      props: { indeterminate: true, label: "Loading" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ProgressBar (Vue) — 0.8: end labels and size", () => {
  it("shows the end labels without changing the aria values", () => {
    const { container } = render(ProgressBar, { props: { value: 62, label: "Progress to level 19", startLabel: "18", endLabel: "19" } });
    const bar = screen.getByRole("progressbar", { name: "Progress to level 19" });
    expect(bar.getAttribute("aria-valuenow")).toBe("62");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    const ends = [...container.querySelectorAll(".ui-progress__end")];
    expect(ends.map((e) => e.textContent)).toEqual(["18", "19"]);
    for (const e of ends) expect(e.getAttribute("aria-hidden")).toBe("true");
    expect(bar.classList.contains("ui-progress--ends")).toBe(true);
  });

  it("renders no end labels and no size class by default", () => {
    const { container } = render(ProgressBar, { props: { value: 10, label: "x" } });
    expect(container.querySelector(".ui-progress__end")).toBeNull();
    expect(container.firstElementChild?.className).toBe("ui-progress-bar ui-progress");
  });

  it.each(["sm", "lg"] as const)("size %s is a class with its own height token", (size) => {
    const { container } = render(ProgressBar, { props: { value: 10, label: "x", size } });
    expect(container.firstElementChild?.classList.contains(`ui-progress--${size}`)).toBe(true);
    const css = readFileSync(join(process.cwd(), "src", "components", "progress-bar", "progress-bar.scss"), "utf8");
    expect(css).toMatch(new RegExp(`\\.ui-progress--${size} \\.ui-progress__track \\{[^}]*height: var\\(--ui-progress-height-${size}\\)`));
  });

  it("has no axe violations (end labels, lg)", async () => {
    const { container } = render(ProgressBar, { props: { value: 62, label: "Level", startLabel: "18", endLabel: "19", size: "lg" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ProgressBar: delta segment (#148)", () => {
  const widthOf = (c: Element, sel: string) => parseFloat((c.querySelector(sel) as HTMLElement).style.width);

  it("draws value and delta as two segments of the track", () => {
    const { container } = render(ProgressBar, { props: { value: 24, delta: 20, max: 150, label: "Commits today" } });
    expect(widthOf(container, ".ui-progress__fill")).toBeCloseTo(16, 5);
    expect(widthOf(container, ".ui-progress__delta")).toBeCloseTo(13.333, 2);
    expect(container.querySelector(".ui-progress")!.classList.contains("ui-progress--overflow")).toBe(false);
  });

  it("speaks the value, the max and the total with the delta", () => {
    render(ProgressBar, { props: { value: 24, delta: 20, max: 150, label: "Commits today" } });
    const bar = screen.getByRole("progressbar", { name: "Commits today" });
    expect(bar.getAttribute("aria-valuetext")).toBe("24 of 150, 44 with the change");
    expect(bar.getAttribute("aria-valuenow")).toBe("24");
  });

  it("valueText overrides the spoken text", () => {
    render(ProgressBar, { props: { value: 24, delta: 20, max: 150, label: "x", valueText: "24, 44 con la propuesta" } });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("24, 44 con la propuesta");
  });

  it("clamps an overflowing delta to the track and marks it as overflow", () => {
    const { container } = render(ProgressBar, { props: { value: 120, delta: 60, max: 150 } });
    const fill = widthOf(container, ".ui-progress__fill");
    const delta = widthOf(container, ".ui-progress__delta");
    expect(fill + delta).toBeCloseTo(100, 5);
    expect(container.querySelector(".ui-progress")!.classList.contains("ui-progress--overflow")).toBe(true);
    const css = readFileSync(join(process.cwd(), "src", "components", "progress-bar", "progress-bar.scss"), "utf8");
    expect(css).toMatch(/\.ui-progress--overflow \.ui-progress__delta\s*\{[^}]*var\(--ui-progress-overflow-bg\)/);
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    expect(tokens).toMatch(/--ui-progress-overflow-bg:\s*var\(--ui-color-danger\)/);
  });

  it("has no delta segment or valuetext without a delta, nor when indeterminate", () => {
    const plain = render(ProgressBar, { props: { value: 40 } });
    expect(plain.container.querySelector(".ui-progress__delta")).toBeNull();
    expect(plain.container.querySelector("[role=progressbar]")!.hasAttribute("aria-valuetext")).toBe(false);
    const busy = render(ProgressBar, { props: { indeterminate: true, delta: 10 } });
    expect(busy.container.querySelector(".ui-progress__delta")).toBeNull();
  });

  it("has no axe violations with a delta", async () => {
    const { container } = render(ProgressBar, { props: { value: 24, delta: 20, max: 150, label: "Commits today" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
