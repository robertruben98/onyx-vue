import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import * as onyx from "../../index";
import { UiNote } from "./index";

const scss = readFileSync(join(process.cwd(), "src", "components", "note", "note.scss"), "utf8");

describe("UiNote (Vue)", () => {
  it("is exported by the package index and renders a muted <p class=ui-note>", () => {
    expect(onyx.UiNote).toBeDefined();
    const { container } = render(onyx.UiNote, { slots: { default: "Nothing here" } });
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("P");
    expect(el.classList.contains("ui-note")).toBe(true);
    expect(el.classList.contains("ui-note--muted")).toBe(true);
    expect(el.classList.contains("ui-note--md")).toBe(true);
    expect(el.classList.contains("ui-note--inline")).toBe(true);
    expect(el.textContent).toBe("Nothing here");
  });

  it("muted colour comes from the semantic muted text token", () => {
    expect(scss).toMatch(/\.ui-note\s*\{[^}]*color:\s*var\(--ui-color-text-muted\)/s);
  });

  it.each([
    ["success", "--ui-color-success"],
    ["warning", "--ui-color-warning"],
    ["danger", "--ui-color-danger"],
  ] as const)("tone=%s adds its modifier and routes to %s", (tone, token) => {
    const { container } = render(UiNote, { props: { tone }, slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).classList.contains(`ui-note--${tone}`)).toBe(true);
    expect(scss).toMatch(new RegExp(`\\.ui-note--${tone}\\s*\\{[^}]*color:\\s*var\\(${token}\\)`, "s"));
  });

  it.each(["sm", "md", "lg"] as const)("size=%s adds its modifier", (size) => {
    const { container } = render(UiNote, { props: { size }, slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).classList.contains(`ui-note--${size}`)).toBe(true);
  });

  it.each(["inline", "block", "empty"] as const)("variant=%s adds its modifier", (variant) => {
    const { container } = render(UiNote, { props: { variant }, slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).classList.contains(`ui-note--${variant}`)).toBe(true);
  });

  it("variant=empty spacing uses --ui-space-* tokens and no hard-coded px padding", () => {
    expect(scss).toMatch(/\.ui-note--empty\s*\{[^}]*padding:[^;]*var\(--ui-note-empty-padding-y\)/s);
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    expect(tokens).toMatch(/--ui-note-empty-padding-y:\s*var\(--ui-space-\d\)/);
    expect(tokens).toMatch(/--ui-note-empty-padding-x:\s*var\(--ui-space-\d\)/);
    const paddings = [...scss.matchAll(/padding[^:]*:[^;]+;/g)].map((m) => m[0]);
    expect(paddings.length).toBeGreaterThan(0);
    for (const p of paddings) expect(p).not.toMatch(/\d+(\.\d+)?(px|rem|em)/);
  });

  it("mono adds the monospace modifier", () => {
    const { container } = render(UiNote, { props: { mono: true }, slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).classList.contains("ui-note--mono")).toBe(true);
    expect(scss).toMatch(/\.ui-note--mono\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  });

  it("as changes the element", () => {
    const { container } = render(UiNote, { props: { as: "span" }, slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).tagName).toBe("SPAN");
  });

  it("has no role by default", () => {
    const { container } = render(UiNote, { slots: { default: "x" } });
    expect((container.firstElementChild as HTMLElement).hasAttribute("role")).toBe(false);
  });

  it("empty + live announces with role=status", () => {
    render(UiNote, { props: { variant: "empty", live: true }, slots: { default: "No results" } });
    expect(screen.getByRole("status").textContent).toBe("No results");
  });

  it("live without variant=empty gets no role; empty without live gets no role", () => {
    const a = render(UiNote, { props: { live: true }, slots: { default: "x" } });
    expect(a.container.querySelector("[role]")).toBeNull();
    const b = render(UiNote, { props: { variant: "empty" }, slots: { default: "x" } });
    expect(b.container.querySelector("[role]")).toBeNull();
  });

  it.each([
    ["muted", {}],
    ["success", { tone: "success" as const }],
    ["warning", { tone: "warning" as const }],
    ["danger", { tone: "danger" as const }],
    ["empty live", { variant: "empty" as const, live: true }],
    ["mono block", { variant: "block" as const, mono: true }],
  ])("has no axe violations (%s)", async (_n, props) => {
    const { container } = render(UiNote, { props, slots: { default: "Nothing here yet" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
