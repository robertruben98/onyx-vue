import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import { nextTick } from "vue";
import Segmented from "./Segmented.vue";

const read = (...p: string[]) => readFileSync(join(process.cwd(), "src", ...p), "utf8");
const scss = read("components", "segmented", "segmented.scss");
const pocket = read("styles", "pocket.css");

/** The body of the first rule whose selector is exactly `selector`. */
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return "";
  return css.slice(start, css.indexOf("\n}", start));
}
const token = (css: string, name: string) => css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("Segmented thumb", () => {
  it("keeps the fluid control border-box, so it never overflows its parent", () => {
    expect(block(scss, ".ui-segmented")).toMatch(/box-sizing:\s*border-box/);
    expect(block(scss, ".ui-segmented--fluid")).toMatch(/width:\s*100%/);
  });

  it("pocket: the selected segment is not the primary button colour", () => {
    const light = block(pocket, ".ui-theme-pocket");
    const selected = token(light, "--ui-segmented-selected-bg");
    expect(selected).toBeTruthy();
    expect(selected).not.toBe("var(--ui-color-primary)");
    expect(selected).not.toContain("--ui-pocket-accent");
    expect(token(light, "--ui-segmented-bg")).toBe("var(--ui-color-neutral-surface)");
    expect(token(light, "--ui-segmented-thumb-shadow")).toBeTruthy();
    expect(token(light, "--ui-segmented-selected-text")).not.toBe("var(--ui-color-on-primary)");
  });

  it("renders a thumb that is a decorative sibling of the segments", () => {
    const { container } = render(Segmented, { props: { options: OPTIONS, modelValue: "b" } });
    const thumb = container.querySelector(".ui-segmented__thumb");
    expect(thumb).toBeTruthy();
    expect(thumb?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll("[role=radiogroup] > *")[0]).toBe(thumb);
  });

  it("moves the thumb with a transform when the selection changes", async () => {
    const offsets: Record<string, number> = { Alpha: 0, Beta: 100 };
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft");
    Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
      configurable: true,
      get() { return offsets[this.textContent?.trim() ?? ""] ?? 0; },
    });
    try {
      const r = render(Segmented, { props: { options: OPTIONS, modelValue: "a" } });
      await nextTick();
      const thumb = r.container.querySelector<HTMLElement>(".ui-segmented__thumb")!;
      expect(thumb.style.transform).toBe("translate(0px, 0px)");
      await r.rerender({ modelValue: "b" });
      await nextTick();
      await nextTick();
      expect(thumb.style.transform).toBe("translate(100px, 0px)");
    } finally {
      if (desc) Object.defineProperty(HTMLElement.prototype, "offsetLeft", desc);
      else delete (HTMLElement.prototype as { offsetLeft?: number }).offsetLeft;
    }
  });

  it("animates the thumb for at least 150ms and not under reduced motion", () => {
    const rule = block(scss, ".ui-segmented__thumb--ready");
    const duration = rule.match(/transition:[^;]*?([\d.]+)(m?s)/);
    expect(duration).toBeTruthy();
    const ms = duration![2] === "s" ? Number(duration![1]) * 1000 : Number(duration![1]);
    expect(ms).toBeGreaterThanOrEqual(150);
    expect(rule).toContain("transform");
    const reduced = scss.slice(scss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toContain(".ui-segmented__thumb");
    expect(reduced).toMatch(/transition:\s*none/);
  });

  it("shows the selection through the thumb, not a label background", () => {
    expect(block(scss, ".ui-segmented__item--selected .ui-segmented__label")).not.toMatch(/background:\s*var\(--ui-segmented-selected-bg\)/);
    expect(block(scss, ".ui-segmented__thumb")).toMatch(/background:\s*var\(--ui-segmented-selected-bg\)/);
  });
});
