import { afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick } from "vue";
import ConfirmButton from "./ConfirmButton.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("ConfirmButton (Vue)", () => {
  afterEach(() => vi.useRealTimers());

  it("arms on the first click instead of confirming", async () => {
    const { emitted } = render(ConfirmButton, { props: { label: "publicar", confirmLabel: "confirmar" } });
    await fireEvent.click(screen.getByRole("button", { name: "publicar" }));
    expect(emitted().armed).toHaveLength(1);
    expect(emitted().confirmed).toBeUndefined();
    expect(screen.getByRole("button", { name: "confirmar" })).toBeTruthy();
  });

  it("confirms on the second click", async () => {
    const { emitted } = render(ConfirmButton, { props: { label: "publicar", confirmLabel: "confirmar" } });
    await fireEvent.click(screen.getByRole("button"));
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().confirmed).toHaveLength(1);
    expect(screen.getByRole("button", { name: "publicar" })).toBeTruthy();
  });

  it("disarms by itself after the timeout", async () => {
    vi.useFakeTimers();
    const { emitted } = render(ConfirmButton, { props: { label: "cerrar PR", timeout: 1000 } });
    await fireEvent.click(screen.getByRole("button"));
    vi.advanceTimersByTime(1001);
    await nextTick();
    expect(emitted().disarmed).toHaveLength(1);
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().confirmed).toBeUndefined();
  });

  it("disarms on Esc", async () => {
    const { emitted } = render(ConfirmButton, { props: { label: "publicar" } });
    await fireEvent.click(screen.getByRole("button"));
    await fireEvent.keyDown(screen.getByRole("button"), { key: "Escape" });
    expect(emitted().disarmed).toHaveLength(1);
  });

  it("disarms when focus leaves it", async () => {
    const { emitted } = render(ConfirmButton, { props: { label: "publicar" } });
    await fireEvent.click(screen.getByRole("button"));
    await fireEvent.focusOut(screen.getByRole("button"), { relatedTarget: document.body });
    expect(emitted().disarmed).toHaveLength(1);
  });

  it("keeps only one button armed on the page", async () => {
    const Two = defineComponent({
      setup: () => () =>
        h("div", [
          h(ConfirmButton, { label: "uno", confirmLabel: "confirmar uno" }),
          h(ConfirmButton, { label: "dos", confirmLabel: "confirmar dos" }),
        ]),
    });
    render(Two);
    await fireEvent.click(screen.getByRole("button", { name: "uno" }));
    await fireEvent.click(screen.getByRole("button", { name: "dos" }));
    expect(screen.getByRole("button", { name: "uno" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "confirmar dos" })).toBeTruthy();
  });

  it("does nothing while disabled", async () => {
    const { emitted } = render(ConfirmButton, { props: { label: "publicar", disabled: true } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().armed).toBeUndefined();
  });

  it("announces the question when it arms", async () => {
    const { container } = render(ConfirmButton, {
      props: { label: "publicar", confirmLabel: "¿publicar?", armedHint: "pulsa otra vez" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("[aria-live]")?.textContent).toBe("¿publicar? — pulsa otra vez");
  });

  it("has no axe violations, resting and armed", async () => {
    const { container } = render(ConfirmButton, { props: { label: "publicar" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await fireEvent.click(screen.getByRole("button"));
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
