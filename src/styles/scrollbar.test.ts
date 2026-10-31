import { readFileSync } from "node:fs";
import { join } from "node:path";

// Static checks, like the other style tests: jsdom does not paint scrollbars.
const read = (...p: string[]) => readFileSync(join(process.cwd(), ...p), "utf8");

describe("scrollbars follow the theme", () => {
  it("base.css loads scrollbar.css, so every consumer gets it", () => {
    expect(read("src", "styles", "base.css")).toMatch(/@import "\.\/scrollbar\.css";/);
  });

  it("the root sets a thin bar coloured by tokens, not raw colours", () => {
    const css = read("src", "styles", "scrollbar.css");
    expect(css).toMatch(/scrollbar-width:\s*thin/);
    expect(css).toMatch(/scrollbar-color:\s*var\(--ui-scrollbar-thumb\)\s+var\(--ui-scrollbar-track\)/);
    expect(css).toMatch(/scrollbar-color:\s*var\(--ui-scrollbar-thumb-hover\)/);
  });

  it("the tokens exist and the track is transparent", () => {
    const tokens = read("src", "styles", "tokens.css");
    expect(tokens).toMatch(/--ui-scrollbar-thumb:\s*var\(--ui-color-border-strong\)/);
    expect(tokens).toMatch(/--ui-scrollbar-track:\s*transparent/);
  });
});

describe("button label", () => {
  it("stays on one line unless wrap is asked for", () => {
    const scss = read("src", "components", "button", "button.scss");
    const el = scss.match(/\n\.ui-button__el \{([^}]*)\}/);
    expect(el?.[1]).toMatch(/white-space:\s*nowrap/);
    expect(scss).toMatch(/\.ui-button--wrap \.ui-button__el \{[^}]*white-space:\s*normal/);
  });
});
