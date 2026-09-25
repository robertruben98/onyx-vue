import { afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { nextTick } from "vue";
import ToastHost from "./ToastHost.vue";
import { useToast } from "./toast-store";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Toast (Vue)", () => {
  const { show, clear } = useToast();

  afterEach(() => {
    clear();
    vi.useRealTimers();
  });

  it("shows a message in the polite region", async () => {
    render(ToastHost);
    show("cola pausada");
    await nextTick();
    expect(screen.getByRole("status").textContent).toContain("cola pausada");
  });

  it("puts a danger toast in the assertive region", async () => {
    render(ToastHost);
    show("no se pudo lanzar", { tone: "danger" });
    await nextTick();
    expect(screen.getByRole("alert").textContent).toContain("no se pudo lanzar");
    expect(screen.getByRole("status").textContent).not.toContain("no se pudo lanzar");
  });

  it("keeps both live regions in the DOM while empty", () => {
    // Una region viva que se inserta junto con su texto no se anuncia.
    render(ToastHost);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("goes away on its own after the duration", async () => {
    vi.useFakeTimers();
    render(ToastHost);
    show("copiado", { duration: 1000 });
    await nextTick();
    expect(screen.queryByText("copiado")).toBeTruthy();
    vi.advanceTimersByTime(1001);
    await nextTick();
    expect(screen.queryByText("copiado")).toBeNull();
  });

  it("stays until dismissed with duration 0", async () => {
    vi.useFakeTimers();
    render(ToastHost, { props: { dismissLabel: "cerrar" } });
    show("fijo", { duration: 0 });
    await nextTick();
    vi.advanceTimersByTime(60_000);
    await nextTick();
    expect(screen.getByText("fijo")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "cerrar" }));
    expect(screen.queryByText("fijo")).toBeNull();
  });

  it("keeps at most three on screen, dropping the oldest", async () => {
    render(ToastHost);
    ["uno", "dos", "tres", "cuatro"].forEach((m) => show(m));
    await nextTick();
    expect(screen.queryByText("uno")).toBeNull();
    expect(screen.getByText("cuatro")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    render(ToastHost);
    show("guardado", { tone: "success" });
    show("fallo", { tone: "danger" });
    await nextTick();
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
