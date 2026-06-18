import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
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
    expect((emitted().itemSelect as unknown[][])[0][0]).toMatchObject({
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
});
