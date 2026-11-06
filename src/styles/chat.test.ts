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
const norm = (v: string | undefined) => v?.toLowerCase().replace(/\s+/g, "");
const value = (css: string, name: string) => norm(new RegExp(`^\\s*${name}:\\s*([^;]+);`, "m").exec(css)?.[1].trim());

// Light is the default; `.app-dark` is the preset's night mode (the convention of pocket and classroom).
const light = block(chat, ".ui-theme-chat");
const night = block(chat, ".ui-theme-chat.app-dark");

/** Token, light, dark: the WhatsApp Web values of the reference (section 1). `--ui-chat-link` light is darkened from #027EB5 (4.07:1 on the outgoing bubble). */
const TOKENS: [string, string, string][] = [
  ["--ui-chat-app-bg", "#F7F5F3", "#1D1F1F"],
  ["--ui-chat-outer-bg", "#DBD8D4", "#262524"],
  ["--ui-chat-surface", "#FFFFFF", "#161717"],
  ["--ui-chat-surface-hover", "rgba(194,189,184,.15)", "rgba(255,255,255,.10)"],
  ["--ui-chat-line", "rgba(0,0,0,.10)", "rgba(255,255,255,.10)"],
  ["--ui-chat-outline", "rgba(0,0,0,.20)", "rgba(255,255,255,.10)"],
  ["--ui-chat-ink", "#0A0A0A", "#FAFAFA"],
  ["--ui-chat-ink-soft", "rgba(0,0,0,.60)", "rgba(255,255,255,.60)"],
  ["--ui-chat-ink-faint", "#BDBDBD", "#424445"],
  ["--ui-chat-accent", "#1DAA61", "#21C063"],
  ["--ui-chat-accent-strong", "#1B8755", "#21C063"],
  ["--ui-chat-accent-soft", "#D9FDD3", "#103529"],
  ["--ui-chat-on-accent-soft", "#15603E", "#D9FDD3"],
  ["--ui-chat-on-accent", "#FFFFFF", "#0A0A0A"],
  ["--ui-chat-unread", "#1DAA61", "#21C063"],
  ["--ui-chat-bubble-in", "#FFFFFF", "#242626"],
  ["--ui-chat-bubble-out", "#D9FDD3", "#144D37"],
  ["--ui-chat-bubble-system", "rgba(255,255,255,.90)", "#1D1F1F"],
  ["--ui-chat-meta", "rgba(0,0,0,.60)", "rgba(255,255,255,.60)"],
  ["--ui-chat-read", "#007BFC", "#53BDEB"],
  ["--ui-chat-bg", "#F5F1EB", "#161717"],
  ["--ui-chat-wallpaper-ink", "#EAE0D3", "rgba(255,255,255,.10)"],
  ["--ui-chat-composer", "#FFFFFF", "#242626"],
  ["--ui-chat-danger", "#EA0038", "#FB5061"],
  ["--ui-chat-warning", "#FFB938", "#FFD279"],
  ["--ui-chat-link", "#02749F", "#53BDEB"],
  ["--ui-chat-status-ring", "#25D366", "#25D366"],
];
// "rgba(0,0,0,.60)" and "rgba(0,0,0,0.6)" are the same colour.
const canon = (v: string) => v.toLowerCase().replace(/\s+/g, "").replace(/(^|[(,])\.(\d)/g, "$10.$2").replace(/(\.\d*?)0+(?=[,)])/g, "$1");
const expected = (v: string) => canon(v);
const actual = (css: string, name: string) => canon(value(css, name) ?? "");

const AVATARS: [string, string, string][] = [
  ["green", "#1B8755", "#D9FDD3"],
  ["cobalt", "#0063CB", "#D2E8FE"],
  ["purple", "#5E47DE", "#E8E0FF"],
  ["pink", "#D42A66", "#FFDAE7"],
  ["orange", "#C4532D", "#FEE2D8"],
  ["teal", "#028377", "#CBF2EE"],
  ["sky", "#027EB5", "#CAECFA"],
  ["yellow", "#9D6C2C", "#FFF0D4"],
  ["red", "#B80531", "#FBD8DC"],
  ["brown", "#855538", "#F4DED1"],
  ["gray", "#757778", "#EEEEEE"],
];

describe("chat preset", () => {
  it("is imported by the token layer", () => {
    expect(index).toContain('@import "./chat.css"');
  });

  it("is light by default and has its own night mode under .app-dark", () => {
    expect(light).not.toBe("");
    expect(night).not.toBe("");
    expect(chat).not.toContain(".app-light");
    expect(light).toContain("background-color: var(--ui-chat-app-bg)");
  });

  it.each(TOKENS)("%s carries the reference value in light and in dark", (token, lightValue, darkValue) => {
    expect(actual(light, token)).toBe(expected(lightValue));
    expect(actual(night, token)).toBe(expected(darkValue));
  });

  it.each(AVATARS)("avatar %s has the reference ink and tint", (name, ink, tint) => {
    expect(actual(light, `--ui-chat-avatar-${name}`)).toBe(expected(ink));
    expect(actual(light, `--ui-chat-avatar-${name}-bg`)).toBe(expected(tint));
  });

  it("dark restates every colour primitive of the light default", () => {
    const primitives = [...assigned(light)].filter(
      (t) => t.startsWith("--ui-chat-") && !/-(radius(-\d+)?|space-\d|shadow-\w+)$/.test(t) && !t.startsWith("--ui-chat-avatar-"),
    );
    expect(primitives.length).toBeGreaterThan(25);
    expect(primitives.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("ink-soft and meta are 60% of the ink, not a separate grey", () => {
    expect(actual(light, "--ui-chat-ink-soft")).toBe("rgba(0,0,0,0.6)");
    expect(actual(night, "--ui-chat-ink-soft")).toBe("rgba(255,255,255,0.6)");
    expect(actual(light, "--ui-chat-meta")).toBe(actual(light, "--ui-chat-ink-soft"));
    expect(actual(night, "--ui-chat-meta")).toBe(actual(night, "--ui-chat-ink-soft"));
  });

  it("the outgoing bubble differs from the incoming one in both modes", () => {
    for (const css of [light, night]) {
      expect(value(css, "--ui-chat-bubble-out")).toBeDefined();
      expect(value(css, "--ui-chat-bubble-out")).not.toBe(value(css, "--ui-chat-bubble-in"));
    }
  });

  it("nothing stays teal-blue: no leftover of the old palette", () => {
    for (const old of ["#0b141a", "#111b21", "#1f2c34", "#005c4b", "#34d27b", "#e9eef1", "#07694a", "#25343c", "#b3c7c1", "#4d5f69", "#70838c", "#9fb2bb", "#e6edf0"]) {
      expect(chat.toLowerCase()).not.toContain(old);
    }
  });

  it("shadows are tokens with the reference values", () => {
    expect(value(light, "--ui-chat-shadow-header")).toBe("01px4pxrgba(10,10,10,0.12)");
    expect(value(light, "--ui-chat-shadow-bubble")).toBe("01px0.5pxrgba(11,20,26,0.13)");
    expect(value(light, "--ui-chat-shadow-composer")).toBe("01px6pxrgba(0,0,0,0.12)");
    expect(value(light, "--ui-chat-shadow-chip")).toBe("001px1pxrgba(0,0,0,0.06),01px00rgba(0,0,0,0.05)");
  });

  it("uses WhatsApp's radius scale (4, 6, 8, 12, 16, 20, 24, 28) and a 4px rhythm", () => {
    for (const r of [4, 6, 8, 12, 16, 20, 24, 28]) expect(value(light, `--ui-chat-radius-${r}`)).toBe(`${r}px`);
    expect(value(light, "--ui-chat-bubble-radius")).toBe("7.5px");
    [4, 8, 12, 16, 20, 24].forEach((px, i) => expect(value(light, `--ui-chat-space-${i + 1}`)).toBe(`${px}px`));
  });

  it("the font is Roboto Variable, served by the preset only", () => {
    expect(value(light, "--ui-font-family-body")).toBe('"robotovariable",roboto,"helveticaneue",helvetica,sans-serif');
    expect(chat).toContain('@import "@fontsource-variable/roboto/wght.css"');
    // (index.css imports chat.css, which brings the font along: not listed.)
    for (const other of ["acme", "classroom", "console", "matrix", "pocket", "base", "dark", "tokens"]) {
      expect(read(`${other}.css`)).not.toContain("fontsource");
    }
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.dependencies["@fontsource-variable/roboto"]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("controls are 32 / 40 / 52px and stay so under a coarse pointer, which only widens the hit area to 44px", () => {
    expect(value(light, "--ui-size-control-sm")).toBe("2rem");
    expect(value(light, "--ui-size-control-md")).toBe("2.5rem");
    expect(value(light, "--ui-size-control-lg")).toBe("3.25rem");
    const start = chat.indexOf("@media (pointer: coarse)");
    expect(start).toBeGreaterThan(0);
    const coarse = chat.slice(start, chat.indexOf("\n}\n", chat.indexOf("::after", start)) + 3);
    // Visual size untouched: no size token and no height/min-height/padding on the button itself.
    expect(coarse).not.toMatch(/--ui-size-control/);
    expect(coarse.replace(/::after\s*\{[^}]*\}/, "")).not.toMatch(/(?:min-)?height:|padding/);
    // Hit area: a centred ::after of at least 44px that grows beyond the button, on a positioned button.
    const after = /\.ui-theme-chat \.ui-button__el::after\s*\{([^}]*)\}/.exec(coarse)?.[1] ?? "";
    expect(after).toContain("width: max(100%, 44px)");
    expect(after).toContain("height: max(100%, 44px)");
    expect(after).toContain("position: absolute");
    expect(after).toMatch(/translate\(-50%, -50%\)/);
    expect(coarse).toMatch(/\.ui-theme-chat \.ui-button__el\s*\{[^}]*position:\s*relative/);
  });

  it("covers every semantic token that the dark preset remaps", () => {
    const semantic = [...assigned(dark)];
    expect(semantic.filter((t) => !assigned(light).has(t))).toEqual([]);
  });

  it("the night mode restates every semantic token that is a literal colour (var() ones follow the primitives)", () => {
    const literals = [...assigned(dark)].filter((t) => !/^var\(/.test(value(light, t) ?? "var("));
    expect(literals.length).toBeGreaterThan(4);
    expect(literals.filter((t) => !assigned(night).has(t))).toEqual([]);
  });

  it("never reaches past its own palette for colour", () => {
    const generic = ["slate", "red", "amber", "blue", "green", "emerald"];
    const pattern = new RegExp(`var\\(--ui-(?:(?:${generic.join("|")})-[0-9]+|white|black)\\)`, "g");
    expect([...chat.matchAll(pattern)].map((m) => m[0])).toEqual([]);
  });

  describe("contrast", () => {
    type Rgba = [number, number, number, number];
    const parse = (v: string): Rgba => {
      const h = /^#([0-9a-f]{6})$/i.exec(v);
      if (h) return [0, 2, 4].map((i) => parseInt(h[1].slice(i, i + 2), 16)).concat(1) as Rgba;
      const m = /^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(canon(v));
      if (!m) throw new Error(`not a literal colour: ${v}`);
      return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    };
    const flat = (fg: Rgba, bg: Rgba): [number, number, number] =>
      [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])) as [number, number, number];
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const modes = [["light", light], ["dark", night]] as const;
    const get = (css: string, name: string) => value(css, name) ?? value(light, name)!;
    /** Contrast of `fg` (translucent colours resolved over `bg`) on `bg` (translucent ones over the surface). */
    const contrast = (css: string, fg: string, bg: string) => {
      const ground = flat(parse(get(css, bg)), [...parse(get(css, "--ui-chat-surface")).slice(0, 3), 1] as Rgba);
      return ratio(flat(parse(get(css, fg)), [...ground, 1] as Rgba), ground);
    };

    const TEXT_ON: [string, string[]][] = [
      // Hover / selected rows and the active rail item paint ink on the translucent surface-hover wash (over the surface).
      ["--ui-chat-ink", ["--ui-chat-surface-hover", "--ui-chat-bg", "--ui-chat-app-bg", "--ui-chat-surface", "--ui-chat-bubble-in", "--ui-chat-bubble-out", "--ui-chat-composer", "--ui-chat-bubble-system", "--ui-chat-accent-soft"]],
      ["--ui-chat-ink-soft", ["--ui-chat-surface-hover", "--ui-chat-bg", "--ui-chat-app-bg", "--ui-chat-surface", "--ui-chat-bubble-in", "--ui-chat-bubble-out", "--ui-chat-composer", "--ui-chat-bubble-system"]],
      ["--ui-chat-meta", ["--ui-chat-surface-hover", "--ui-chat-bubble-in", "--ui-chat-bubble-out", "--ui-chat-bg"]],
      ["--ui-chat-accent-ink", ["--ui-chat-bg", "--ui-chat-app-bg", "--ui-chat-surface", "--ui-chat-bubble-in"]],
      // strong is for white surfaces (4.52:1); on the warm app-bg / wallpaper the darker accent-ink takes over.
      ["--ui-chat-accent-strong", ["--ui-chat-surface", "--ui-chat-bubble-in"]],
      ["--ui-chat-on-accent-soft", ["--ui-chat-accent-soft"]],
      ["--ui-chat-link", ["--ui-chat-bubble-in", "--ui-chat-bubble-out"]],
      ["--ui-chat-right", ["--ui-chat-bg", "--ui-chat-surface", "--ui-chat-app-bg"]],
      ["--ui-chat-wrong", ["--ui-chat-bg", "--ui-chat-surface", "--ui-chat-app-bg"]],
      ["--ui-chat-careful", ["--ui-chat-bg", "--ui-chat-surface", "--ui-chat-app-bg"]],
      // The primary button label.
      ["--ui-chat-on-accent", ["--ui-chat-accent-ink", "--ui-chat-accent-hover", "--ui-chat-accent-active", "--ui-chat-accent-strong"]],
    ];

    it.each(modes)("every text colour reaches 4.5:1 on every background it is painted on (%s)", (mode, css) => {
      const fails: string[] = [];
      for (const [fg, bgs] of TEXT_ON) {
        for (const bg of bgs) {
          const r = contrast(css, fg, bg);
          if (r < 4.5) fails.push(`${mode} ${fg} on ${bg}: ${r.toFixed(2)}`);
        }
      }
      expect(fails).toEqual([]);
    });

    it.each(modes)("meaningful non-text colours reach 3:1 on the surface (%s)", (mode, css) => {
      const fails: string[] = [];
      // danger is an icon/fill colour; warning (#FFB938 / #FFD279) is a decorative fill that always
      // sits next to dark ink text, so it is not asked for 3:1 (the text version is --ui-chat-careful).
      for (const fg of ["--ui-chat-accent", "--ui-chat-unread", "--ui-chat-danger", "--ui-chat-read", "--ui-chat-status-ring"]) {
        const r = contrast(css, fg, "--ui-chat-surface");
        // The WhatsApp status ring #25D366 is a hairline accent around an avatar, never the only cue.
        if (fg === "--ui-chat-status-ring" && mode === "light") continue;
        if (r < 3) fails.push(`${mode} ${fg}: ${r.toFixed(2)}`);
      }
      expect(fails).toEqual([]);
    });

    // EXEMPTION (controller ruling W1, 2026-11-03): the unread-badge numerals are 600 12px, white on
    // #1DAA61 (3.0:1) in light and #0A0A0A on #21C063 in dark, exactly as WhatsApp paints them. That is
    // below 4.5:1 in light. The count is also given to assistive tech as text and the row's accessible
    // name, so the colour is not the only channel. Pinned here so a drift cannot go unnoticed.
    it.each(modes)("unread badge numerals follow WhatsApp, below 4.5:1 in light by exemption (%s)", (mode, css) => {
      const r = contrast(css, "--ui-chat-on-accent", "--ui-chat-unread");
      if (mode === "light") {
        expect(r).toBeGreaterThanOrEqual(3);
        expect(r).toBeLessThan(4.5);
      } else {
        expect(r).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("disabled ink is exempt from contrast, as in WCAG", () => {
      // #BDBDBD on white is 1.9:1: decorative state, listed so the exemption is explicit.
      expect(contrast(light, "--ui-chat-ink-faint", "--ui-chat-surface")).toBeLessThan(3);
    });
  });
});
