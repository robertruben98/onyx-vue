import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Disclosure from "./Disclosure.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Disclosure (Vue)", () => {
  it("renders a native details with its summary", () => {
    const { container } = render(Disclosure, {
      props: { summary: "ver tabla" },
      slots: { default: "<p>cuerpo</p>" },
    });
    expect(container.querySelector("details")).toBeTruthy();
    expect(container.querySelector("summary")?.textContent).toContain("ver tabla");
  });

  it("starts closed and follows the model", async () => {
    const { container, rerender } = render(Disclosure, { props: { summary: "x" } });
    const details = container.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await rerender({ summary: "x", open: true });
    expect(details.open).toBe(true);
  });

  it("reports the reader opening it", async () => {
    const { container, emitted } = render(Disclosure, { props: { summary: "x" } });
    const details = container.querySelector("details") as HTMLDetailsElement;
    details.open = true;
    await fireEvent(details, new Event("toggle"));
    expect(emitted()["update:open"]?.[0]).toEqual([true]);
  });

  it("keeps an opened fold open across a parent repaint", async () => {
    // Lo que se pedia en /agents/: un <details> abierto no se cierra solo
    // porque la tabla se vuelva a pintar cada cinco segundos.
    const { container, rerender } = render(Disclosure, { props: { summary: "a", open: true } });
    await rerender({ summary: "b", open: true });
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
  });

  it("lets the summary slot replace the text", () => {
    render(Disclosure, { slots: { summary: "<b>#123</b> fix login" } });
    expect(screen.getByText("#123")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(Disclosure, {
      props: { summary: "prompt", open: true },
      slots: { default: "<pre>claude -p ...</pre>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
