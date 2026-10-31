import { compile } from "sass";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import Checkbox from "./Checkbox.vue";

// A checkbox whose label wraps (0.13.1). jsdom has no layout engine, so these
// tests read the rules that decide it instead of measuring the box; the real
// sizes are checked in a browser (Playwright, 390px column) for the release.
//
// The box is a flex item of `.ui-checkbox__wrap`. Without `flex: none` it
// shrinks when the label needs the room, so in a narrow list the boxes with
// long labels came out smaller than their neighbours.

const scss = compile("src/components/checkbox/checkbox.scss").css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

function body(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`).exec(scss);
  if (!m) throw new Error(`no rule for ${selector}`);
  return m[1];
}

describe("Checkbox with a wrapping label", () => {
  it("never lets the box shrink or grow", () => {
    expect(body(".ui-checkbox__el")).toMatch(/flex:\s*none/);
  });

  it("lets the label wrap inside the row instead of pushing the box", () => {
    expect(body(".ui-checkbox__label")).toMatch(/min-width:\s*0/);
  });

  it("aligns the box with the first line of a labelled checkbox, not the middle of the block", () => {
    expect(body(".ui-checkbox__wrap--labelled")).toMatch(/align-items:\s*flex-start/);
    // Centred on the first line: half of (line box − box), from the label's own
    // font size and line height, so one line looks as it did before.
    expect(body(".ui-checkbox__wrap--labelled .ui-checkbox__el")).toMatch(/margin-top:\s*calc\(/);
    expect(body(".ui-checkbox__label")).toMatch(/line-height:\s*var\(--ui-checkbox-label-line-height\)/);
  });

  it("marks the wrap as labelled only when there is a label", () => {
    const labelled = render(Checkbox, { props: { label: "Free trial: one month, then it renews at the full price" } });
    expect(labelled.container.querySelector(".ui-checkbox__wrap--labelled")).not.toBeNull();
    const bare = render(Checkbox, { props: { ariaLabel: "Select row" } });
    expect(bare.container.querySelector(".ui-checkbox__wrap")).not.toBeNull();
    expect(bare.container.querySelector(".ui-checkbox__wrap--labelled")).toBeNull();
  });

  it("defines the tokens it uses", () => {
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    for (const t of scss.matchAll(/var\((--ui-checkbox-[a-z-]+)\)/g)) expect(tokens).toContain(`${t[1]}:`);
  });
});
