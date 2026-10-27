import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
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
  it("takes its name from a visible label when given its id", () => {
    // Un UiFieldRow pinta la etiqueta al lado; nombrar el combobox con ella en
    // vez de con un aria-label repetido es lo que hace que no se separen.
    render({
      components: { Select },
      template: `<div><span id="lbl">refresco</span><Select :options="options" aria-labelledby="lbl" aria-label="otro" /></div>`,
      data: () => ({ options: OPTIONS }),
    });
    const trigger = screen.getByRole("combobox", { name: "refresco" });
    expect(trigger.getAttribute("aria-label")).toBeNull();
  });

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
    expect(emitted().changed.at(-1)).toEqual(["rx"]);
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
    expect(emitted().changed.at(-1)).toEqual(["rx"]);
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
    expect(emitted().changed.at(-1)).toEqual(["ng"]);
  });

  it("does not select a disabled option on click", async () => {
    const { emitted } = renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    await fireEvent.click(
      await screen.findByRole("option", { name: "Style Dictionary" }),
    );
    expect(emitted().change).toBeFalsy();
    expect(emitted().changed).toBeFalsy();
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

  it("gives independent listbox ids to two selects open together", async () => {
    render({
      render() {
        return h("div", [
          h(Select, { options: OPTIONS }),
          h(Select, { options: [{ value: "x", label: "Other" }] }),
        ]);
      },
    });
    const triggers = screen.getAllByRole("combobox");
    await fireEvent.click(triggers[0]);
    await fireEvent.click(triggers[1]);

    const controlsA = triggers[0].getAttribute("aria-controls");
    const controlsB = triggers[1].getAttribute("aria-controls");
    expect(controlsA).toBeTruthy();
    expect(controlsB).toBeTruthy();
    expect(controlsA).not.toBe(controlsB);
    expect(document.getElementById(controlsA!)?.textContent).toContain("Angular");
    expect(document.getElementById(controlsB!)?.textContent).toContain("Other");
  });
});

describe("Select (Vue) — keyboard and pointer details", () => {
  const listboxActive = (listbox: HTMLElement) =>
    document.getElementById(listbox.getAttribute("aria-activedescendant") ?? "")?.textContent?.trim();

  it.each(["ArrowDown", "ArrowUp", "Enter", " "])("opens from the trigger with %j", async (key) => {
    renderSelect();
    await fireEvent.keyDown(screen.getByRole("combobox"), { key });
    expect(await screen.findByRole("listbox")).toBeTruthy();
  });

  it("ignores other keys on the trigger, and every key when disabled", async () => {
    const first = renderSelect();
    await fireEvent.keyDown(screen.getByRole("combobox"), { key: "a" });
    expect(screen.queryByRole("listbox")).toBeNull();
    first.unmount();
    renderSelect({ disabled: true });
    await fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("starts on the selected option and moves with Home, End and ArrowUp, wrapping past disabled ones", async () => {
    renderSelect({ modelValue: "rx" });
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listboxActive(listbox)).toBe("RxJS");
    await fireEvent.keyDown(listbox, { key: "Home" });
    expect(listboxActive(listbox)).toBe("Angular");
    await fireEvent.keyDown(listbox, { key: "End" });
    expect(listboxActive(listbox)).toBe("RxJS"); // the last one is disabled
    await fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(listboxActive(listbox)).toBe("Angular");
    await fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(listboxActive(listbox)).toBe("RxJS"); // wraps, skipping the disabled one
  });

  it("follows the pointer over enabled options only", async () => {
    renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await fireEvent.mouseEnter(screen.getByRole("option", { name: "RxJS" }));
    expect(listboxActive(listbox)).toBe("RxJS");
    await fireEvent.mouseEnter(screen.getByRole("option", { name: "Style Dictionary" }));
    expect(listboxActive(listbox)).toBe("RxJS");
  });

  it("closes with Tab and with a second click on the trigger", async () => {
    renderSelect();
    const trigger = screen.getByRole("combobox");
    await fireEvent.click(trigger);
    await fireEvent.keyDown(await screen.findByRole("listbox"), { key: "Tab" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await fireEvent.click(trigger);
    await screen.findByRole("listbox");
    await fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps focus inside the open listbox", async () => {
    renderSelect();
    await fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    await fireEvent.focusOut(listbox, { relatedTarget: outside });
    await waitFor(() => expect(document.activeElement).toBe(listbox));
    outside.remove();
  });

  it("selects nothing when every option is disabled or there are none", async () => {
    const off = render(Select, {
      props: { options: [{ value: "a", label: "A", disabled: true }] },
    });
    await fireEvent.click(screen.getByRole("combobox"));
    await fireEvent.keyDown(await screen.findByRole("listbox"), { key: "Enter" });
    expect(off.emitted().changed).toBeFalsy();
    off.unmount();
    const none = render(Select, { props: { options: [] } });
    await fireEvent.click(screen.getByRole("combobox"));
    await fireEvent.keyDown(await screen.findByRole("listbox"), { key: "ArrowDown" });
    expect(none.emitted().changed).toBeFalsy();
  });
});
