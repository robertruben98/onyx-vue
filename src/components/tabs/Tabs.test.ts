import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick } from "vue";
import Tabs from "./Tabs.vue";
import Tab from "./Tab.vue";

/**
 * Renders Tabs with three tabs (the third disabled), mirroring the Angular spec.
 *
 * Child `Tab`s register with the parent during their own mount, so the trigger
 * list becomes available on the following tick — the Vue equivalent of the
 * Angular spec's `await renderTabs()`. We await a `nextTick` here so callers can
 * query synchronously, exactly as the Angular tests do.
 */
async function renderTabs(index = 0) {
  const Harness = defineComponent({
    components: { Tabs, Tab },
    data() {
      return { index };
    },
    render() {
      return h(
        Tabs,
        {
          ariaLabel: "Sections",
          selectedIndex: this.index,
          "onUpdate:selectedIndex": (v: number) => {
            this.index = v;
          },
        },
        () => [
          h(Tab, { label: "One" }, () => "First panel"),
          h(Tab, { label: "Two" }, () => "Second panel"),
          h(Tab, { label: "Three", disabled: true }, () => "Third panel"),
        ],
      );
    },
  });
  const utils = render(Harness);
  await nextTick();
  return utils;
}

describe("Tabs (Vue)", () => {
  it("renders a tablist with one tab per child", async () => {
    await renderTabs();
    const list = screen.getByRole("tablist", { name: "Sections" });
    expect(list).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("selects the first tab by default and wires ARIA", async () => {
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    expect(first.getAttribute("aria-selected")).toBe("true");
    const panel = screen.getByRole("tabpanel", { name: "One" });
    expect(panel.hasAttribute("hidden")).toBe(false);
  });

  it("switches panel on click", async () => {
    await renderTabs();
    await fireEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.getByRole("tabpanel", { name: "Two" }).hasAttribute("hidden"),
    ).toBe(false);
  });

  it("moves selection with arrow keys and skips disabled tabs", async () => {
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    await fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
    // Next ArrowRight skips disabled "Three" and wraps to "One".
    await fireEvent.keyDown(screen.getByRole("tab", { name: "Two" }), {
      key: "ArrowRight",
    });
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("supports Home and End keys", async () => {
    await renderTabs(1);
    const second = screen.getByRole("tab", { name: "Two" });
    second.focus();
    await fireEvent.keyDown(second, { key: "Home" });
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
    // End lands on the last enabled tab (skips disabled "Three" -> "Two").
    await fireEvent.keyDown(screen.getByRole("tab", { name: "One" }), {
      key: "End",
    });
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("does not select a disabled tab on click", async () => {
    await renderTabs();
    await fireEvent.click(screen.getByRole("tab", { name: "Three" }));
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("applies roving tabindex to the selected tab only", async () => {
    await renderTabs();
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("tabindex"),
    ).toBe("0");
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("tabindex"),
    ).toBe("-1");
  });

  it("has no axe violations", async () => {
    const { container } = await renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });
});
