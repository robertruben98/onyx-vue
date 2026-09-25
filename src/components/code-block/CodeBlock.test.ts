import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { nextTick } from "vue";
import CodeBlock from "./CodeBlock.vue";

const axeOptions = { rules: { region: { enabled: false } } };

/** jsdom has no layout: give the box a fake geometry. */
function geometry(el: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, get: () => scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, get: () => clientHeight });
}

describe("CodeBlock (Vue)", () => {
  it("renders the text in a pre", () => {
    const { container } = render(CodeBlock, { props: { text: "HTTP/1.1 200 OK" } });
    expect(container.querySelector("pre")?.textContent).toBe("HTTP/1.1 200 OK");
  });

  it("shows the empty text when there is nothing", () => {
    render(CodeBlock, { props: { emptyText: "(sin logs)" } });
    expect(screen.getByText("(sin logs)")).toBeTruthy();
  });

  it("shows a spinner and marks itself busy while loading", () => {
    const { container } = render(CodeBlock, { props: { text: "x", loading: true } });
    const pre = container.querySelector("pre") as HTMLElement;
    expect(pre.getAttribute("aria-busy")).toBe("true");
    expect(pre.textContent).not.toContain("x");
  });

  it("is a named region when labelled", () => {
    render(CodeBlock, { props: { text: "x", label: "logs de api-core" } });
    expect(screen.getByRole("region", { name: "logs de api-core" })).toBeTruthy();
  });

  it("follows the tail while the reader is at the end", async () => {
    const { container, rerender } = render(CodeBlock, { props: { text: "a", followTail: true } });
    const pre = container.querySelector("pre") as HTMLElement;
    geometry(pre, 500, 100);
    await rerender({ text: "a\nb", followTail: true });
    await nextTick();
    expect(pre.scrollTop).toBe(500);
  });

  it("keeps the reader's place after they scroll up", async () => {
    // Quien sube a leer un error no puede verse arrastrado al final por la
    // siguiente linea.
    const { container, rerender } = render(CodeBlock, { props: { text: "a", followTail: true } });
    const pre = container.querySelector("pre") as HTMLElement;
    geometry(pre, 500, 100);
    pre.scrollTop = 50;
    pre.dispatchEvent(new Event("scroll"));
    await rerender({ text: "a\nb", followTail: true });
    await nextTick();
    expect(pre.scrollTop).toBe(50);
  });

  it("carries the tone", () => {
    const { container } = render(CodeBlock, { props: { text: "500", tone: "danger" } });
    expect(container.querySelector(".ui-code-block--danger")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(CodeBlock, { props: { text: "{\n  \"ok\": true\n}", label: "respuesta" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
