import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import Select, { type SelectOption } from "./Select.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const OPTIONS: SelectOption[] = [
  { value: "ng", label: "Angular" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary", disabled: true },
];

function renderSelect(props: Record<string, unknown> = {}) {
  return render(Select, { props: { options: OPTIONS, ...props } });
}

describe("Select (Vue)", () => {
  it("shows the placeholder and a collapsed combobox", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Select…");
  });

  it("opens a listbox of options on click", async () => {
    renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option, updates the model and closes", async () => {
    const { emitted } = renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    await fireEvent.click(await screen.findByRole("option", { name: "RxJS" }));

    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"].at(-1)).toEqual(["rx"]);
    expect(emitted().change.at(-1)).toEqual(["rx"]);
    expect(screen.getByRole("combobox").textContent).toContain("RxJS");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("selects with keyboard (arrow + enter)", async () => {
    const { emitted } = renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    // active starts at first enabled (Angular); ArrowDown -> RxJS; Enter selects.
    await fireEvent.keyDown(listbox, { key: "ArrowDown" });
    await fireEvent.keyDown(listbox, { key: "Enter" });
    expect(emitted().change.at(-1)).toEqual(["rx"]);
  });

  it("skips disabled options with the keyboard", async () => {
    const { emitted } = renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    // from RxJS, ArrowDown wraps past disabled "Style Dictionary" to Angular.
    await fireEvent.keyDown(listbox, { key: "ArrowDown" }); // RxJS
    await fireEvent.keyDown(listbox, { key: "ArrowDown" }); // wrap -> Angular
    await fireEvent.keyDown(listbox, { key: "Enter" });
    expect(emitted().change.at(-1)).toEqual(["ng"]);
  });

  it("does not select a disabled option on click", async () => {
    const { emitted } = renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    await fireEvent.click(
      await screen.findByRole("option", { name: "Style Dictionary" }),
    );
    expect(emitted().change).toBeFalsy();
    expect(screen.queryByRole("listbox")).toBeTruthy();
  });

  it("closes on Escape", async () => {
    renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await fireEvent.keyDown(listbox, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("does not open when disabled", async () => {
    renderSelect({ disabled: true });
    const trigger = screen.getByRole("combobox");
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    await fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("reflects the v-model value as the trigger label", () => {
    renderSelect({ modelValue: "ng" });
    expect(screen.getByRole("combobox").textContent).toContain("Angular");
  });

  it("uses ariaLabel as the accessible name when provided", () => {
    renderSelect({ ariaLabel: "Framework" });
    expect(
      screen.getByRole("combobox", { name: "Framework" }),
    ).toBeTruthy();
  });

  it("has no axe violations (closed and open)", async () => {
    const { container } = renderSelect();
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await fireEvent.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
