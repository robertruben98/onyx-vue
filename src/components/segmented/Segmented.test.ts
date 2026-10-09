import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import Segmented from "./Segmented.vue";

// jsdom no trae CSS.escape, y user-event lo usa para buscar los radios del
// mismo grupo al mover con las flechas. En un navegador existe.
beforeAll(() => {
  const css = (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS ?? {};
  if (!css.escape) {
    css.escape = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
    (globalThis as { CSS?: unknown }).CSS = css;
  }
});

const OPTIONS = [
  { value: "calendar", label: "Calendar" },
  { value: "list", label: "List" },
  { value: "board", label: "Board", disabled: true },
];

describe("Segmented (Vue)", () => {
  it("is a named radio group with one radio per option", () => {
    render(Segmented, { props: { options: OPTIONS, ariaLabel: "View", modelValue: "list" } });
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    expect(screen.getAllByRole("radio").length).toBe(3);
    expect((screen.getByRole("radio", { name: "List" }) as HTMLInputElement).checked).toBe(true);
  });

  it("selects on click and emits the value", async () => {
    const { emitted } = render(Segmented, { props: { options: OPTIONS, modelValue: "calendar" } });
    await fireEvent.click(screen.getByRole("radio", { name: "List" }));
    expect(emitted()["update:modelValue"]?.[0]).toEqual(["list"]);
    expect(emitted().changed?.[0]).toEqual(["list"]);
  });

  it("moves between options with the arrow keys", async () => {
    const user = userEvent.setup();
    const { emitted } = render(Segmented, { props: { options: OPTIONS.slice(0, 2), modelValue: "calendar" } });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Calendar" }));
    await user.keyboard("{ArrowRight}");
    expect(emitted().changed?.[0]).toEqual(["list"]);
  });

  it("does not emit for a disabled option or a disabled control", async () => {
    const one = render(Segmented, { props: { options: OPTIONS, modelValue: "calendar" } });
    const board = screen.getByRole("radio", { name: "Board" }) as HTMLInputElement;
    expect(board.disabled).toBe(true);
    one.unmount();
    const all = render(Segmented, { props: { options: OPTIONS, modelValue: "calendar", disabled: true } });
    screen.getAllByRole("radio").forEach((r) => expect((r as HTMLInputElement).disabled).toBe(true));
    await fireEvent.click(screen.getByRole("radio", { name: "List" }));
    expect(all.emitted().changed).toBeFalsy();
  });

  it("does not emit when the selected option is picked again", async () => {
    const { emitted } = render(Segmented, { props: { options: OPTIONS, modelValue: "list" } });
    await fireEvent.change(screen.getByRole("radio", { name: "List" }));
    expect(emitted().changed).toBeFalsy();
  });

  it("marks the selected segment and the size", () => {
    const { container } = render(Segmented, { props: { options: OPTIONS, modelValue: "list", size: "sm" } });
    expect(container.querySelector(".ui-segmented--sm")).toBeTruthy();
    const selected = container.querySelector(".ui-segmented__item--selected");
    expect(selected?.textContent).toContain("List");
  });

  it("has no axe violations", async () => {
    const { container } = render(Segmented, { props: { options: OPTIONS, ariaLabel: "View", modelValue: "list" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
