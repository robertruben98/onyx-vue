import { afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
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

  describe("action (0.6)", () => {
    it("renders the action as a named button that runs onAction and closes the toast", async () => {
      const onAction = vi.fn();
      render(ToastHost);
      show("Removed from today", { action: { label: "Undo", onAction } });
      await nextTick();
      await fireEvent.click(screen.getByRole("button", { name: "Undo" }));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Removed from today")).toBeNull();
    });

    it("has no action button when none is given", async () => {
      render(ToastHost);
      show("saved");
      await nextTick();
      expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["Dismiss"]);
    });

    it("is reachable with Tab and activates with Enter, then gives focus back", async () => {
      const onAction = vi.fn();
      const trigger = document.createElement("button");
      trigger.textContent = "Done";
      document.body.prepend(trigger);
      render(ToastHost);
      show("Marked done", { action: { label: "Undo", onAction } });
      await nextTick();
      const user = userEvent.setup();
      trigger.focus();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
      await user.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });

    it("waits 6000ms by default when it has an action, 3200 without", async () => {
      vi.useFakeTimers();
      render(ToastHost);
      show("plain");
      show("with action", { action: { label: "Undo", onAction: () => {} } });
      await nextTick();
      vi.advanceTimersByTime(3300);
      await nextTick();
      expect(screen.queryByText("plain")).toBeNull();
      expect(screen.getByText("with action")).toBeTruthy();
      vi.advanceTimersByTime(2800);
      await nextTick();
      expect(screen.queryByText("with action")).toBeNull();
    });

    it("stays while focused and resumes with the time it had left", async () => {
      vi.useFakeTimers();
      render(ToastHost);
      show("Removed", { duration: 1000, action: { label: "Undo", onAction: () => {} } });
      await nextTick();
      vi.advanceTimersByTime(600);
      const undo = screen.getByRole("button", { name: "Undo" });
      await fireEvent.focusIn(undo);
      vi.advanceTimersByTime(10_000);
      await nextTick();
      expect(screen.getByText("Removed")).toBeTruthy();
      await fireEvent.focusOut(undo, { relatedTarget: document.body });
      vi.advanceTimersByTime(300);
      await nextTick();
      expect(screen.getByText("Removed")).toBeTruthy();
      vi.advanceTimersByTime(150);
      await nextTick();
      expect(screen.queryByText("Removed")).toBeNull();
    });

    it("stays while the pointer is over it", async () => {
      vi.useFakeTimers();
      render(ToastHost);
      show("Hovered", { duration: 1000 });
      await nextTick();
      const box = screen.getByText("Hovered").closest(".ui-toast")!;
      await fireEvent.mouseEnter(box);
      vi.advanceTimersByTime(5000);
      await nextTick();
      expect(screen.getByText("Hovered")).toBeTruthy();
      await fireEvent.mouseLeave(box);
      vi.advanceTimersByTime(1001);
      await nextTick();
      expect(screen.queryByText("Hovered")).toBeNull();
    });

    it("has no axe violations with an action", async () => {
      render(ToastHost);
      show("Removed", { action: { label: "Undo", onAction: () => {} } });
      show("Failed", { tone: "danger", action: { label: "Retry", onAction: () => {} } });
      await nextTick();
      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });
  });

  it("has no axe violations", async () => {
    render(ToastHost);
    show("guardado", { tone: "success" });
    show("fallo", { tone: "danger" });
    await nextTick();
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
