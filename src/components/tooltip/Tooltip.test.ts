import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import Tooltip from "./Tooltip.vue";

function renderTooltip(text = "Helpful hint") {
  return render(Tooltip, {
    props: { text },
    slots: { default: `<button type="button">Hover me</button>` },
  });
}

describe("Tooltip (Vue)", () => {
  it("shows a tooltip on hover and wires aria-describedby", async () => {
    renderTooltip("Helpful hint");
    const trigger = screen.getByRole("button", { name: "Hover me" });

    await fireEvent.mouseEnter(trigger.parentElement!);

    const tip = await screen.findByRole("tooltip");
    expect(tip.textContent).toBe("Helpful hint");
    expect(trigger.parentElement!.getAttribute("aria-describedby")).toBe(tip.id);
  });

  it("hides the tooltip on unhover", async () => {
    renderTooltip();
    const trigger = screen.getByRole("button");
    const host = trigger.parentElement!;
    await fireEvent.mouseEnter(host);
    await screen.findByRole("tooltip");

    await fireEvent.mouseLeave(host);
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).toBeNull(),
    );
    expect(host.getAttribute("aria-describedby")).toBeNull();
  });

  it("shows on focus and hides on Escape", async () => {
    renderTooltip();
    const host = screen.getByRole("button").parentElement!;

    await fireEvent.focusIn(host);
    await screen.findByRole("tooltip");

    await fireEvent.keyDown(host, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).toBeNull(),
    );
  });

  it("does not show when text is empty", async () => {
    render(Tooltip, {
      props: { text: "" },
      slots: { default: `<button type="button">No tip</button>` },
    });
    await fireEvent.mouseEnter(screen.getByRole("button").parentElement!);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("emits toggle when shown and hidden", async () => {
    const { emitted } = renderTooltip();
    const host = screen.getByRole("button").parentElement!;
    await fireEvent.mouseEnter(host);
    await screen.findByRole("tooltip");
    await fireEvent.mouseLeave(host);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());

    const events = emitted().toggle as unknown[][];
    expect(events[0]).toEqual([true]);
    expect(events[1]).toEqual([false]);
  });

  it("has no axe violations while shown", async () => {
    renderTooltip();
    await fireEvent.mouseEnter(screen.getByRole("button").parentElement!);
    await screen.findByRole("tooltip");
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
