import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Dialog from "./Dialog.vue";

const axeOptions = { rules: { region: { enabled: false } } };

type DialogProps = Record<string, unknown>;

function renderDialog(props: DialogProps = {}, slots: Record<string, unknown> = {}) {
  return render(Dialog, {
    props: { open: true, heading: "Confirm", ...props },
    slots: { default: () => h("p", "Dialog body"), ...slots },
  });
}

describe("Dialog (Vue)", () => {
  it("renders nothing until opened", () => {
    renderDialog({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("exposes role=dialog with aria-modal and is labelled by the heading", async () => {
    renderDialog({ open: true, heading: "Confirm" });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Confirm" })).toBeTruthy();
  });

  it("uses aria-label when no heading is provided", async () => {
    renderDialog({ open: true, heading: "", ariaLabel: "Settings" });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toBe("Settings");
  });

  it("moves focus into the dialog on open (focus trap)", async () => {
    renderDialog({ open: true });
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it("emits opened after attach", async () => {
    const { emitted } = renderDialog({ open: true });
    await screen.findByRole("dialog");
    await waitFor(() => expect(emitted().opened).toBeTruthy());
  });

  it("closes on Escape and emits closed", async () => {
    const { emitted } = renderDialog({ open: true });
    const dialog = await screen.findByRole("dialog");

    await fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(emitted().closed).toBeTruthy();
    expect(emitted()["update:open"]).toBeTruthy();
  });

  it("does not close on Escape when closeOnEsc is false", async () => {
    renderDialog({ open: true, closeOnEsc: false });
    const dialog = await screen.findByRole("dialog");

    await fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("closes when the backdrop is clicked", async () => {
    renderDialog({ open: true });
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(".ui-dialog__backdrop") as HTMLElement;
    expect(backdrop).toBeTruthy();
    await fireEvent.click(backdrop);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("does not close on backdrop click when closeOnBackdrop is false", async () => {
    renderDialog({ open: true, closeOnBackdrop: false });
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(".ui-dialog__backdrop") as HTMLElement;
    await fireEvent.click(backdrop);

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not close when clicking inside the panel", async () => {
    renderDialog({ open: true });
    const dialog = await screen.findByRole("dialog");

    await fireEvent.click(dialog);

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("closes and emits when the close button is activated", async () => {
    const { emitted } = renderDialog({ open: true });
    await screen.findByRole("dialog");

    await fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(emitted().closed).toBeTruthy();
  });

  it("restores focus to the trigger when closed", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(Dialog, {
      props: { open: false, heading: "Confirm" },
      slots: { default: () => h("p", "Body") },
    });

    await rerender({ open: true, heading: "Confirm" });
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await rerender({ open: false, heading: "Confirm" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    trigger.remove();
  });

  it("applies the size modifier class", async () => {
    renderDialog({ open: true, size: "lg" });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("ui-dialog__panel--lg")).toBe(true);
  });

  it("renders footer slot content", async () => {
    renderDialog(
      { open: true },
      { footer: () => h("button", { type: "button" }, "Cancel") },
    );
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("has no axe violations when open", async () => {
    renderDialog({ open: true, heading: "Confirm" });
    const dialog = await screen.findByRole("dialog");
    expect(await axe(dialog, axeOptions)).toHaveNoViolations();
  });
});
