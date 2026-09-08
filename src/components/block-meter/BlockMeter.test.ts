import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import BlockMeter from "./BlockMeter.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function blocksOf(container: Element): string {
  return container.querySelector(".ui-block-meter__blocks")?.textContent ?? "";
}

describe("BlockMeter (Vue)", () => {
  it("fills the blocks in proportion to the value", () => {
    const { container } = render(BlockMeter, {
      props: { value: 3, max: 7, blocks: 7 },
    });
    expect(blocksOf(container)).toBe("▰▰▰▱▱▱▱");
  });

  it("always draws exactly `blocks` glyphs", () => {
    for (const value of [0, 1, 37, 99, 100]) {
      const { container } = render(BlockMeter, { props: { value, blocks: 8 } });
      expect(blocksOf(container).length).toBe(8);
    }
  });

  it("never overflows when the value goes past the max", () => {
    // Un remaining por encima del limite (o un max desfasado) no puede sacar
    // once bloques de una barra de ocho.
    const { container } = render(BlockMeter, {
      props: { value: 140, max: 100, blocks: 8 },
    });
    expect(blocksOf(container)).toBe("▰▰▰▰▰▰▰▰");
  });

  it("never goes negative", () => {
    const { container } = render(BlockMeter, {
      props: { value: -5, max: 100, blocks: 8 },
    });
    expect(blocksOf(container)).toBe("▱▱▱▱▱▱▱▱");
  });

  it("survives a max of zero instead of dividing by it", () => {
    const { container } = render(BlockMeter, {
      props: { value: 0, max: 0, blocks: 4 },
    });
    expect(blocksOf(container)).toBe("▱▱▱▱");
  });

  it("announces the measurement and not the glyphs", () => {
    const { container } = render(BlockMeter, {
      props: { value: 3, max: 7, blocks: 7, label: "workflow" },
    });
    const el = container.querySelector(".ui-block-meter");
    expect(el?.getAttribute("aria-label")).toBe("workflow: 3 of 7");
    expect(el?.getAttribute("aria-valuenow")).toBe("3");
    expect(el?.getAttribute("aria-valuemax")).toBe("7");
  });

  it("hides the glyphs from assistive tech", () => {
    const { container } = render(BlockMeter, { props: { value: 1, max: 2 } });
    expect(
      container
        .querySelector(".ui-block-meter__blocks")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("shows the ratio only when asked", () => {
    render(BlockMeter, {
      props: { value: 3, max: 7, blocks: 7, showRatio: true },
    });
    expect(screen.getByText("3/7")).toBeTruthy();
  });

  it("tones the filled part and leaves the track alone", () => {
    const { container } = render(BlockMeter, {
      props: { value: 2, max: 8, tone: "danger" },
    });
    expect(
      container
        .querySelector(".ui-block-meter")
        ?.classList.contains("ui-block-meter--danger"),
    ).toBe(true);
    expect(container.querySelector(".ui-block-meter__empty")).toBeTruthy();
  });

  it("takes custom glyphs", () => {
    const { container } = render(BlockMeter, {
      props: { value: 1, max: 2, blocks: 2, filledGlyph: "█", emptyGlyph: "░" },
    });
    expect(blocksOf(container)).toBe("█░");
  });

  it("has no axe violations", async () => {
    const { container } = render(BlockMeter, {
      props: { value: 3, max: 7, blocks: 7, label: "workflow" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
