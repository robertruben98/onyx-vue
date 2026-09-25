import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { nextTick } from "vue";
import AnsiTerminal from "./AnsiTerminal.vue";
import { createAnsiParser, stripAnsi } from "./ansi";

const axeOptions = { rules: { region: { enabled: false } } };
const ESC = "\u001b";

describe("createAnsiParser", () => {
  it("splits text by the attributes open over it", () => {
    const segs = createAnsiParser().feed(`ok ${ESC}[31merror${ESC}[0m done`);
    expect(segs).toEqual([
      { text: "ok ", fg: null, bold: false, dim: false },
      { text: "error", fg: 31, bold: false, dim: false },
      { text: " done", fg: null, bold: false, dim: false },
    ]);
  });

  it("carries an open colour into the next chunk", () => {
    // El caso que motiva el estado: un rojo abierto en un tramo sigue abierto
    // en el siguiente.
    const p = createAnsiParser();
    p.feed(`${ESC}[1;33mwarn: `);
    expect(p.feed("still yellow")[0]).toMatchObject({ fg: 33, bold: true });
  });

  it("handles 22 and 39 as partial resets", () => {
    const p = createAnsiParser();
    const segs = p.feed(`${ESC}[1;2;32ma${ESC}[22mb${ESC}[39mc`);
    expect(segs.map((s) => [s.text, s.fg, s.bold, s.dim])).toEqual([
      ["a", 32, true, true],
      ["b", 32, false, false],
      ["c", null, false, false],
    ]);
  });

  it("drops non-SGR escapes instead of printing them", () => {
    const segs = createAnsiParser().feed(`a${ESC}[2Kb${ESC}[?25lc`);
    expect(segs.map((s) => s.text).join("")).toBe("abc");
  });

  it("strips escapes for copying", () => {
    expect(stripAnsi(`${ESC}[31mred${ESC}[0m`)).toBe("red");
  });
});

describe("AnsiTerminal (Vue)", () => {
  it("renders coloured output as classed spans", () => {
    const { container } = render(AnsiTerminal, { props: { lines: [`${ESC}[32mPASS${ESC}[0m 12 tests`] } });
    const span = container.querySelector(".ui-ansi-fg-32");
    expect(span?.textContent).toBe("PASS");
    expect(container.querySelector("pre")?.textContent).toContain("PASS 12 tests");
  });

  it("never interprets output as markup", () => {
    const { container } = render(AnsiTerminal, { props: { lines: ["<img src=x onerror=alert(1)>"] } });
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });

  it("appends new lines without repainting the old ones", async () => {
    const lines = ["uno"];
    const { container, rerender } = render(AnsiTerminal, { props: { lines } });
    const firstNode = container.querySelector(".ui-ansi-terminal__out")?.firstChild;
    await rerender({ lines: ["uno", "dos"] });
    const out = container.querySelector(".ui-ansi-terminal__out") as HTMLElement;
    expect(out.firstChild).toBe(firstNode);
    expect(out.textContent).toBe("uno\ndos");
  });

  it("carries a colour across appended lines", async () => {
    const { container, rerender } = render(AnsiTerminal, { props: { lines: [`${ESC}[31merror:`] } });
    await rerender({ lines: [`${ESC}[31merror:`, "still red"] });
    const reds = [...container.querySelectorAll(".ui-ansi-fg-31")].map((e) => e.textContent);
    expect(reds.join("")).toContain("still red");
  });

  it("starts over when given another session", async () => {
    const { container, rerender } = render(AnsiTerminal, { props: { lines: ["s1 a", "s1 b"] } });
    await rerender({ lines: ["s2 a"] });
    expect(container.querySelector(".ui-ansi-terminal__out")?.textContent).toBe("s2 a");
  });

  it("shows the caret only while live", async () => {
    const { container, rerender } = render(AnsiTerminal, { props: { lines: ["x"], live: true } });
    expect(container.querySelector(".ui-ansi-terminal__caret")).toBeTruthy();
    await rerender({ lines: ["x"], live: false });
    expect(container.querySelector(".ui-ansi-terminal__caret")).toBeNull();
  });

  it("follows the end while follow is on", async () => {
    const { container, rerender } = render(AnsiTerminal, { props: { lines: ["a"] } });
    const pre = container.querySelector("pre") as HTMLElement;
    Object.defineProperty(pre, "scrollHeight", { configurable: true, get: () => 900 });
    await rerender({ lines: ["a", "b"] });
    await nextTick();
    expect(pre.scrollTop).toBe(900);
  });

  it("stays put when follow is off", async () => {
    const { container, rerender } = render(AnsiTerminal, { props: { lines: ["a"], follow: false } });
    const pre = container.querySelector("pre") as HTMLElement;
    Object.defineProperty(pre, "scrollHeight", { configurable: true, get: () => 900 });
    await rerender({ lines: ["a", "b"], follow: false });
    expect(pre.scrollTop).toBe(0);
  });

  it("is a named log that does not read every line aloud", () => {
    render(AnsiTerminal, { props: { lines: ["x"], label: "sesion s1" } });
    const log = screen.getByRole("log", { name: "sesion s1" });
    expect(log.getAttribute("aria-live")).toBe("off");
  });

  it("has no axe violations", async () => {
    const { container } = render(AnsiTerminal, { props: { lines: [`${ESC}[33mwarn${ESC}[0m`], live: true } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
