import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import Menu, { type MenuItem } from "./Menu.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const ITEMS: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "dup", label: "Duplicate" },
  { id: "del", label: "Delete", disabled: true },
];

function renderMenu() {
  return render(Menu, {
    props: { items: ITEMS },
    slots: { default: "Actions" },
  });
}

describe("Menu (Vue)", () => {
  it("renders a collapsed trigger with aria-haspopup=menu", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens the menu and lists items", async () => {
    renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("emits the chosen item and closes on click", async () => {
    const { emitted } = renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    await fireEvent.click(
      await screen.findByRole("menuitem", { name: "Duplicate" }),
    );
    expect(emitted().itemSelect).toBeTruthy();
    expect(emitted().itemSelected).toBeTruthy();
    expect((emitted().itemSelect as unknown[][])[0][0]).toMatchObject({
      id: "dup",
    });
    expect((emitted().itemSelected as unknown[][])[0][0]).toMatchObject({
      id: "dup",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("focuses the first item on open and moves with ArrowDown", async () => {
    renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Edit" })).toBe(
        document.activeElement,
      ),
    );
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toBe(
      document.activeElement,
    );
  });

  it("does not emit for a disabled item", async () => {
    const { emitted } = renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    await fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(emitted().itemSelect).toBeFalsy();
    expect(emitted().itemSelected).toBeFalsy();
  });

  it("closes on Escape", async () => {
    renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    await fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("has no axe violations while open", async () => {
    renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });

  it("gives independent panel ids to two menus open together", async () => {
    render({
      render() {
        return h("div", [
          h(Menu, { items: [{ id: "a1", label: "Alpha" }] }, { default: () => "Menu A" }),
          h(Menu, { items: [{ id: "b1", label: "Beta" }] }, { default: () => "Menu B" }),
        ]);
      },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Menu A" }));
    await fireEvent.click(screen.getByRole("button", { name: "Menu B" }));

    const controlsA = screen.getByRole("button", { name: "Menu A" }).getAttribute("aria-controls");
    const controlsB = screen.getByRole("button", { name: "Menu B" }).getAttribute("aria-controls");
    expect(controlsA).toBeTruthy();
    expect(controlsB).toBeTruthy();
    expect(controlsA).not.toBe(controlsB);
    expect(document.getElementById(controlsA!)?.textContent).toContain("Alpha");
    expect(document.getElementById(controlsB!)?.textContent).toContain("Beta");
  });
});

describe("Menu (Vue) — keyboard and positioning details", () => {
  it.each(["ArrowDown", "ArrowUp", "Enter", " "])("opens from the trigger with %j", async (key) => {
    renderMenu();
    await fireEvent.keyDown(screen.getByRole("button", { name: "Actions" }), { key });
    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  it("ignores other keys on the trigger", async () => {
    renderMenu();
    await fireEvent.keyDown(screen.getByRole("button", { name: "Actions" }), { key: "x" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("moves with ArrowUp, Home and End, wrapping and skipping disabled items", async () => {
    renderMenu();
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(document.activeElement?.textContent).toContain("Edit"));
    await fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toContain("Duplicate");
    await fireEvent.keyDown(menu, { key: "Home" });
    expect(document.activeElement?.textContent).toContain("Edit");
    await fireEvent.keyDown(menu, { key: "End" });
    expect(document.activeElement?.textContent).toContain("Duplicate");
  });

  it("closes with Tab and with a second click on the trigger", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    await fireEvent.click(trigger);
    await fireEvent.keyDown(await screen.findByRole("menu"), { key: "Tab" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await fireEvent.click(trigger);
    await screen.findByRole("menu");
    await fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("follows the trigger on scroll and resize while open, and stops listening when closed", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    let bottom = 40;
    trigger.getBoundingClientRect = () => ({ bottom, left: 12, top: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    await fireEvent.click(trigger);
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu.style.top).toBe("40px"));
    bottom = 90;
    window.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(menu.style.top).toBe("90px"));
    bottom = 120;
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(menu.style.top).toBe("120px"));
    await fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    window.dispatchEvent(new Event("resize"));
  });

  it("does nothing on keys when every item is disabled", async () => {
    render(Menu, { props: { items: [{ id: "x", label: "Locked", disabled: true }] }, slots: { default: "Actions" } });
    await fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    await fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeTruthy();
  });
});
