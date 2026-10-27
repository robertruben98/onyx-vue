import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Popover from "./Popover.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function renderPopover(props: Record<string, unknown> = {}) {
  return render(Popover, {
    props: { label: "Details", ...props },
    slots: {
      trigger: (slotProps: { expanded: boolean }) =>
        h(
          "button",
          {
            type: "button",
            "aria-haspopup": "dialog",
            "aria-expanded": slotProps.expanded ? "true" : "false",
          },
          "Open",
        ),
      content: () => [
        h("p", "Popover body"),
        h("button", { type: "button" }, "Action"),
      ],
    },
  });
}

describe("Popover (Vue)", () => {
  it("is collapsed initially", () => {
    renderPopover();
    expect(
      screen.getByRole("button", { name: "Open" }).closest("[aria-expanded]")
        ?.getAttribute("aria-expanded") ??
        screen
          .getByText("Open")
          .closest("[aria-expanded]")
          ?.getAttribute("aria-expanded"),
    ).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on click and exposes a labelled dialog", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Details" });
    expect(dialog.textContent).toContain("Popover body");
    const expanded = screen
      .getByText("Open")
      .closest("[aria-expanded]")
      ?.getAttribute("aria-expanded");
    expect(expanded).toBe("true");
  });

  it("toggles closed on a second trigger click", async () => {
    renderPopover();
    const trigger = screen.getByRole("button", { name: "Open" });
    await fireEvent.click(trigger);
    await screen.findByRole("dialog");
    await fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes on Escape", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    await fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes on backdrop (outside) click", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    const backdrop = document.querySelector(
      ".ui-popover__backdrop",
    ) as HTMLElement;
    await fireEvent.click(backdrop);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("emits toggle with the new open state", async () => {
    const { emitted } = renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(emitted().toggle?.[0]).toEqual([true]);
    expect(emitted().toggled?.[0]).toEqual([true]);
  });

  it("has no axe violations while open", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});

describe("Popover (Vue) — placement and focus details", () => {
  const rect = (r: Partial<DOMRect>) => () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...r }) as DOMRect;

  async function openWith(placement: string) {
    renderPopover({ placement });
    const trigger = document.querySelector(".ui-popover__trigger") as HTMLElement;
    trigger.getBoundingClientRect = rect({ top: 100, bottom: 120, left: 50, right: 150 });
    const proto = HTMLElement.prototype;
    const original = proto.getBoundingClientRect;
    proto.getBoundingClientRect = rect({ width: 80, height: 30 });
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const pane = document.querySelector(".ui-popover__pane") as HTMLElement;
    await waitFor(() => expect(pane.style.top).not.toBe(""));
    proto.getBoundingClientRect = original;
    return pane;
  }

  it.each([
    ["bottom", "120px", "50px"],
    ["top", "70px", "50px"],
    ["left", "100px", "-30px"],
    ["right", "100px", "150px"],
  ])("places the panel %s of the trigger", async (placement, top, left) => {
    const pane = await openWith(placement);
    expect(pane.style.top).toBe(top);
    expect(pane.style.left).toBe(left);
  });

  it("keeps focus on the panel when it has nothing focusable that is laid out", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const panel = await screen.findByRole("dialog");
    await fireEvent.keyDown(panel, { key: "Tab" });
    expect(document.activeElement).toBe(panel);
    await fireEvent.keyDown(panel, { key: "a" });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("wraps Tab and Shift+Tab inside the panel", async () => {
    // jsdom no maqueta: offsetParent es null siempre y el filtro de visibles se
    // quedaria sin nadie. Se simula que todo esta en pantalla.
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");
    Object.defineProperty(HTMLElement.prototype, "offsetParent", { configurable: true, get: () => document.body });
    try {
      render(Popover, {
        props: { label: "Details" },
        slots: {
          trigger: () => h("button", { type: "button" }, "Open"),
          content: () => [h("button", { type: "button" }, "One"), h("button", { type: "button" }, "Two")],
        },
      });
      await fireEvent.click(screen.getByRole("button", { name: "Open" }));
      const panel = await screen.findByRole("dialog");
      const one = screen.getByRole("button", { name: "One" });
      const two = screen.getByRole("button", { name: "Two" });
      two.focus();
      await fireEvent.keyDown(panel, { key: "Tab" });
      expect(document.activeElement).toBe(one);
      await fireEvent.keyDown(panel, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(two);
    } finally {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "offsetParent", descriptor);
    }
  });

  it("re-positions on resize and scroll while open, and cleans up when unmounted open", async () => {
    const { unmount } = renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    const trigger = document.querySelector(".ui-popover__trigger") as HTMLElement;
    trigger.getBoundingClientRect = rect({ bottom: 300, left: 10 });
    window.dispatchEvent(new Event("resize"));
    const pane = document.querySelector(".ui-popover__pane") as HTMLElement;
    await waitFor(() => expect(pane.style.top).toBe("300px"));
    window.dispatchEvent(new Event("scroll"));
    unmount();
    window.dispatchEvent(new Event("resize"));
  });
});
