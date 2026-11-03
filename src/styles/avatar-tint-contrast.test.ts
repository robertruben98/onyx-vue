import { readFileSync } from "node:fs";
import { join } from "node:path";

// Tinted avatar initials: coloured ink on its soft surface. Light pairs are the
// reference palette (3.6-5.1:1; initials are 20 px medium, "large text", 3:1).
// Dark pairs are derived and must reach 4.5:1.
const scss = readFileSync(join(process.cwd(), "src", "components", "avatar", "avatar.scss"), "utf8");
const block = (sel: string) => scss.slice(scss.indexOf(`${sel} {`), scss.indexOf("\n}", scss.indexOf(`${sel} {`)));
const pairs = (css: string) => {
  const v = Object.fromEntries([...css.matchAll(/--ui-avatar-tint-(\w+)-(ink|surface):\s*(#[0-9a-f]{6})/g)].map((m) => [`${m[1]}-${m[2]}`, m[3]]));
  return [...new Set(Object.keys(v).map((k) => k.replace(/-(ink|surface)$/, "")))].map((n) => [n, v[`${n}-ink`], v[`${n}-surface`]] as const);
};
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (c: number[]) => {
  const [r, g, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("tinted avatar contrast", () => {
  it("defines 11 pairs in light and in dark", () => {
    expect(pairs(block(":root"))).toHaveLength(11);
    expect(pairs(block(".app-dark"))).toHaveLength(11);
  });
  it("light initials reach 3:1 (large text) on their surface", () => {
    const fails = pairs(block(":root")).filter(([, i, s]) => ratio(i, s) < 3).map(([n]) => n);
    expect(fails).toEqual([]);
  });
  it("dark initials reach 4.5:1 on their surface", () => {
    const fails = pairs(block(".app-dark")).filter(([, i, s]) => ratio(i, s) < 4.5).map(([n]) => n);
    expect(fails).toEqual([]);
  });
});
