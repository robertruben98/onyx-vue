import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h, nextTick } from "vue";
import Drawer from "./Drawer.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function renderDrawer(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return render(Drawer, {
    props: { open: true, heading: "run 2026-09-25-1004", ...props },
    slots: {
      default: () => h("p", [h("button", { type: "button" }, "retry"), "body"]),
      ...slots,
    },
  });
}

describe("Drawer (Vue)", () => {
  it("renders nothing until opened", () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is a modal dialog named by its heading", async () => {
    renderDrawer();
    const dialog = await screen.findByRole("dialog", { name: "run 2026-09-25-1004" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("falls back to aria-label without a heading", async () => {
    renderDrawer({ heading: "", ariaLabel: "Run detail" });
    expect(await screen.findByRole("dialog", { name: "Run detail" })).toBeTruthy();
  });

  it("moves focus to the sheet on open", async () => {
    renderDrawer();
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(dialog));
  });

  it("closes on Esc and emits the model update", async () => {
    const { emitted } = renderDrawer();
    const dialog = await screen.findByRole("dialog");
    await fireEvent.keyDown(dialog, { key: "Escape" });
    expect(emitted()["update:open"]?.[0]).toEqual([false]);
  });

  it("ignores Esc when closeOnEsc is false", async () => {
    const { emitted } = renderDrawer({ closeOnEsc: false });
    await fireEvent.keyDown(await screen.findByRole("dialog"), { key: "Escape" });
    expect(emitted()["update:open"]).toBeUndefined();
  });

  it("closes from the close button", async () => {
    const { emitted } = renderDrawer({ closeLabel: "cerrar" });
    await fireEvent.click(await screen.findByRole("button", { name: "cerrar" }));
    expect(emitted()["update:open"]?.[0]).toEqual([false]);
  });

  it("closes on a backdrop click but not on a click inside", async () => {
    const { emitted } = renderDrawer();
    const dialog = await screen.findByRole("dialog");
    await fireEvent.click(dialog);
    expect(emitted()["update:open"]).toBeUndefined();
    await fireEvent.click(dialog.parentElement as HTMLElement);
    expect(emitted()["update:open"]?.[0]).toEqual([false]);
  });

  it("wraps Tab from the last focusable back to the first", async () => {
    renderDrawer({ closeLabel: "cerrar" });
    const close = await screen.findByRole("button", { name: "cerrar" });
    const retry = screen.getByRole("button", { name: "retry" });
    retry.focus();
    await fireEvent.keyDown(retry, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("hands focus back to the trigger on close", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = renderDrawer({ open: false });
    await rerender({ open: true, heading: "x" });
    await nextTick();
    await rerender({ open: false, heading: "x" });
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("renders toolbar and footer regions only when given", async () => {
    renderDrawer({}, { toolbar: () => h("span", "tabs"), footer: () => h("span", "pie") });
    expect(await screen.findByText("tabs")).toBeTruthy();
    expect(screen.getByText("pie")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    renderDrawer({ subheading: "pr-fix · 4 PRs" });
    const dialog = await screen.findByRole("dialog");
    expect(await axe(dialog, axeOptions)).toHaveNoViolations();
  });
});
