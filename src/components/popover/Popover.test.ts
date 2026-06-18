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
  });

  it("has no axe violations while open", async () => {
    renderPopover();
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
