import { readFileSync } from "node:fs";
import { join } from "node:path";

// Desde la raiz del proyecto, como pocket.test.ts: bajo jsdom `import.meta.url`
// no apunta al disco.
const dir = join(process.cwd(), "src", "styles");
const read = (f: string) => readFileSync(join(dir, f), "utf8");

const chat = read("chat.css");
const dark = read("dark.css");
const index = read("index.css");

/** Custom properties assigned inside a CSS text, e.g. `--ui-color-text: ...`. */
function assigned(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
}
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return "";
  return css.slice(start, css.indexOf("\n}", start));
}
const value = (css: string, name: string) => new RegExp(`^\\s*${name}:\\s*([^;]+);`, "m").exec(css)?.[1].trim();

// Dark by default; `.app-light` is the day variant.
const night = block(chat, ".ui-theme-chat");
const day = block(chat, ".ui-theme-chat.app-light");

const PUBLIC_TOKENS = [
  "--ui-chat-bg",
  "--ui-chat-bubble-in",
  "--ui-chat-bubble-out",
  "--ui-chat-bubble-draft-border",
  "--ui-chat-meta",
  "--ui-chat-unread",
];

describe("chat preset", () => {
  it("is imported by the token layer", () => {
    expect(index).toContain('@import "./chat.css"');
  });

  it("defines both the dark default and the .app-light variant", () => {
    expect(night).not.toBe("");
    expect(day).not.toBe("");
  });

  it.each(PUBLIC_TOKENS)("%s is defined in dark and in .app-light", (token) => {
    expect(assigned(night).has(token)).toBe(true);
    expect(assigned(day).has(token)).toBe(true);
  });

  it("the outgoing bubble differs from the incoming one in both modes", () => {
    for (const css of [night, day]) {
      expect(value(css, "--ui-chat-bubble-out")).toBeDefined();
      expect(value(css, "--ui-chat-bubble-out")).not.toBe(value(css, "--ui-chat-bubble-in"));
    }
  });

  it("bubbles are rounded 8-10px and the font is the system one", () => {
    expect(night).toMatch(/--ui-chat-bubble-radius:\s*(8|9|10)px/);
    expect(night).toContain("system-ui");
  });

  it("covers every semantic token that the dark preset remaps", () => {
    const semantic = [...assigned(dark)];
    expect(semantic.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("the light mode restates every semantic token that is a literal colour (var() ones follow the primitives)", () => {
    const literals = [...assigned(dark)].filter((t) => !/^var\(/.test(value(night, t) ?? "var("));
    expect(literals.length).toBeGreaterThan(4);
    expect(literals.filter((t) => !assigned(day).has(t))).toEqual([]);
  });

  it("the light mode redefines every colour primitive of the dark default", () => {
    const primitives = [...assigned(night)].filter((t) => t.startsWith("--ui-chat-") && !t.endsWith("-radius"));
    expect(primitives.length).toBeGreaterThan(10);
    expect(primitives.filter((t) => !assigned(day).has(t))).toEqual([]);
  });

  it("never reaches past its own palette for colour", () => {
    const generic = ["slate", "red", "amber", "blue", "green", "emerald"];
    const pattern = new RegExp(`var\\(--ui-(?:(?:${generic.join("|")})-[0-9]+|white|black)\\)`, "g");
    expect([...chat.matchAll(pattern)].map((m) => m[0])).toEqual([]);
  });

  it("paints the page background so the preset is a whole look", () => {
    expect(night).toContain("background-color: var(--ui-chat-bg)");
  });

  it("every text colour reaches 4.5:1 (WCAG AA) on every background it is painted on", () => {
    const hex = (css: string, name: string) => {
      const v = value(css, name);
      return v && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined;
    };
    const lum = (h: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const pairs: [string, string][] = [
      ...["--ui-chat-ink", "--ui-chat-ink-soft", "--ui-chat-accent", "--ui-chat-right", "--ui-chat-wrong", "--ui-chat-careful"].flatMap((t) =>
        ["--ui-chat-bg", "--ui-chat-surface", "--ui-chat-surface-hover"].map((b): [string, string] => [t, b]),
      ),
      ["--ui-chat-ink", "--ui-chat-bubble-in"],
      ["--ui-chat-ink", "--ui-chat-bubble-out"],
      ["--ui-chat-meta", "--ui-chat-bubble-in"],
      ["--ui-chat-meta", "--ui-chat-bubble-out"],
      ["--ui-chat-meta", "--ui-chat-bg"],
      ["--ui-chat-on-accent", "--ui-chat-accent"],
      ["--ui-chat-on-accent", "--ui-chat-unread"],
    ];
    const fails: string[] = [];
    for (const [mode, css] of [["dark", night], ["light", day]] as const) {
      for (const [t, b] of pairs) {
        // The light block only restates what changes: fall back to the dark one.
        const fg = hex(css, t) ?? hex(night, t);
        const bg = hex(css, b) ?? hex(night, b);
        if (!fg || !bg) { fails.push(`${mode} ${t}/${b}: not a literal colour`); continue; }
        if (ratio(fg, bg) < 4.5) fails.push(`${mode} ${t} on ${b}: ${ratio(fg, bg).toFixed(2)}`);
      }
    }
    expect(fails).toEqual([]);
  });
});
