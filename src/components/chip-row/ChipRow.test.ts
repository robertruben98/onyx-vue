import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ChipRow from "./ChipRow.vue";

const scss = readFileSync(join(process.cwd(), "src", "components", "chip-row", "chip-row.scss"), "utf8");
const body = (selector: string) => {
  const at = scss.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`no rule for ${selector}`);
  return scss.slice(at, scss.indexOf("}", at));
};

describe("ChipRow (Vue)", () => {
  it("wraps by default and has no role without a label", () => {
    const { container } = render(ChipRow, { slots: { default: "<button>A</button>" } });
    const row = container.querySelector(".ui-chip-row")!;
    expect(row.classList.contains("ui-chip-row--scroll")).toBe(false);
    expect(row.hasAttribute("role")).toBe(false);
  });

  it("is a named group when it has a label", () => {
    render(ChipRow, { props: { label: "Suggestions" }, slots: { default: "<button>A</button>" } });
    expect(screen.getByRole("group", { name: "Suggestions" })).toBeTruthy();
  });

  it("scroll mode keeps one line and leaves room so the first and last chip are not clipped", () => {
    const { container } = render(ChipRow, { props: { overflow: "scroll" }, slots: { default: "<button>A</button>" } });
    expect(container.querySelector(".ui-chip-row--scroll")).toBeTruthy();
    const rule = body(".ui-chip-row--scroll");
    expect(rule).toMatch(/flex-wrap:\s*nowrap/);
    expect(rule).toMatch(/overflow-x:\s*auto/);
    expect(rule).toMatch(/padding:\s*var\(--ui-chip-row-inset\)/);
    expect(rule).toMatch(/scroll-padding-inline:\s*var\(--ui-chip-row-inset\)/);
    // Chips never shrink inside the scrolling line.
    expect(body(".ui-chip-row--scroll > *")).toMatch(/flex:\s*none/);
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    expect(tokens).toMatch(/--ui-chip-row-inset:\s*calc\(var\(--ui-focus-ring-width\) \+ var\(--ui-focus-ring-offset\)\)/);
  });

  it("has no axe violations", async () => {
    const { container } = render(ChipRow, {
      props: { overflow: "scroll", label: "Suggestions" },
      slots: { default: "<button>Explain</button><button>Example</button>" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
