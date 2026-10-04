import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Tooltip, { type TooltipPlacement } from "./Tooltip.vue";

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
    expect(emitted().toggled).toEqual(emitted().toggle); // el nombre nuevo, mismo evento
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

  it("gives independent ids to two tooltips shown together", async () => {
    render({
      render() {
        return h("div", [
          h(Tooltip, { text: "First tip" }, { default: () => h("button", { type: "button" }, "One") }),
          h(Tooltip, { text: "Second tip" }, { default: () => h("button", { type: "button" }, "Two") }),
        ]);
      },
    });
    await fireEvent.mouseEnter(screen.getByRole("button", { name: "One" }).parentElement!);
    await fireEvent.mouseEnter(screen.getByRole("button", { name: "Two" }).parentElement!);

    const hostOne = screen.getByRole("button", { name: "One" }).parentElement!;
    const hostTwo = screen.getByRole("button", { name: "Two" }).parentElement!;
    const describedByOne = hostOne.getAttribute("aria-describedby");
    const describedByTwo = hostTwo.getAttribute("aria-describedby");
    expect(describedByOne).toBeTruthy();
    expect(describedByTwo).toBeTruthy();
    expect(describedByOne).not.toBe(describedByTwo);
    expect(document.getElementById(describedByOne!)?.textContent).toBe("First tip");
    expect(document.getElementById(describedByTwo!)?.textContent).toBe("Second tip");
  });
});

describe("Tooltip (Vue) — placement details", () => {
  const rect = (r: Partial<DOMRect>) => () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...r }) as DOMRect;

  it.each([
    ["top", "70px", "70px"],
    ["bottom", "120px", "70px"],
    ["left", "95px", "-10px"],
    ["right", "95px", "150px"],
  ] as [TooltipPlacement, string, string][])("places the tooltip %s of the trigger", async (placement, top, left) => {
    render(Tooltip, { props: { text: "Hint", placement }, slots: { default: `<button type="button">Hover me</button>` } });
    const button = screen.getByRole("button", { name: "Hover me" });
    const trigger = button.closest(".ui-tooltip__trigger") ?? button.parentElement!;
    (trigger as HTMLElement).getBoundingClientRect = rect({ top: 100, bottom: 120, left: 50, right: 150, width: 100, height: 20 });
    const proto = HTMLElement.prototype;
    const original = proto.getBoundingClientRect;
    proto.getBoundingClientRect = rect({ width: 60, height: 30 });
    await fireEvent.mouseEnter(trigger);
    const pane = (await screen.findByRole("tooltip")).closest("[style]") as HTMLElement;
    await waitFor(() => expect(pane.style.top).toBe(top));
    expect(pane.style.left).toBe(left);
    proto.getBoundingClientRect = original;
  });

  it("does not show twice, does not hide when hidden, and ignores other keys", async () => {
    const { emitted } = renderTooltip();
    const button = screen.getByRole("button", { name: "Hover me" });
    const trigger = (button.closest(".ui-tooltip__trigger") ?? button.parentElement!) as HTMLElement;
    await fireEvent.keyDown(trigger, { key: "Escape" }); // hidden: nothing to hide
    await fireEvent.mouseEnter(trigger);
    await fireEvent.focusIn(button); // already shown
    await fireEvent.keyDown(trigger, { key: "a" });
    expect(screen.getByRole("tooltip")).toBeTruthy();
    expect(emitted().toggled).toEqual([[true]]);
  });
});
