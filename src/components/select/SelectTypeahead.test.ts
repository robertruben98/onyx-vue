import { fireEvent, render, screen } from "@testing-library/vue";
import { vi } from "vitest";
import Select from "./Select.vue";

const options = [
  "Aprobada", "Cancelada", "Cerrada (disabled)", "Completada",
  "Done", "Dropped", "Única", "Unida",
].map((label, i) => ({ label, value: String(i), disabled: i === 2 }));
const active = (list: HTMLElement) =>
  document.getElementById(list.getAttribute("aria-activedescendant")!)?.textContent?.trim();
async function opened(modelValue?: string) {
  const result = render(Select, { props: { options, modelValue } });
  await fireEvent.click(screen.getByRole("combobox"));
  return { ...result, list: screen.getByRole("listbox") };
}
async function type(el: HTMLElement, text: string) {
  for (const key of text) await fireEvent.keyDown(el, { key });
}

it("cycles repeated letters through enabled matches without selecting", async () => {
  const { list, emitted } = await opened();
  await type(list, "c");
  expect(active(list)).toBe("Cancelada");
  await type(list, "c");
  expect(active(list)).toBe("Completada");
  await type(list, "c");
  expect(active(list)).toBe("Cancelada");
  expect(emitted().changed).toBeUndefined();
});

it("matches a prefix and resets after 500 ms", async () => {
  const { list } = await opened();
  const now = vi.spyOn(Date, "now").mockReturnValue(1000);
  try {
    await type(list, "d");
    expect(active(list)).toBe("Done");
    await type(list, "r");
    expect(active(list)).toBe("Dropped");
    now.mockReturnValue(1501);
    await type(list, "c");
    expect(active(list)).toBe("Cancelada");
  } finally { now.mockRestore(); }
});

it("selects from the focused closed trigger and emits changed without opening", async () => {
  const { emitted } = render(Select, { props: { options } });
  const trigger = screen.getByRole("combobox");
  trigger.focus();
  await type(trigger, "c");
  expect(trigger.textContent).toContain("Cancelada");
  expect(emitted().changed.at(-1)).toEqual(["1"]);
  await type(trigger, "c");
  expect(emitted().changed.at(-1)).toEqual(["3"]);
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it.each(["aprob", "un", "Ún"])("matches case and accent insensitive input %s", async (text) => {
  const { list } = await opened("4");
  await type(list, text);
  expect(active(list)).toBe(text === "aprob" ? "Aprobada" : "Única");
});

it("ignores shortcuts and composition", async () => {
  const { list } = await opened();
  for (const modifier of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }]) {
    await fireEvent.keyDown(list, { key: "c", ...modifier });
    expect(active(list)).toBe("Aprobada");
  }
});

it("shows fades only at clipped edges and removes them when the list fits", async () => {
  const { list } = await opened();
  // jsdom has no layout: simulated dimensions verify classes only.
  // browser/select.browser.mjs verifies actual overflow, scrolling and screenshots.
  Object.defineProperties(list, {
    clientHeight: { configurable: true, value: 100 },
    scrollHeight: { configurable: true, value: 300 },
  });
  await fireEvent.scroll(list);
  expect(list.classList.contains("ui-select__listbox--more-below")).toBe(true);
  expect(list.classList.contains("ui-select__listbox--more-above")).toBe(false);
  list.scrollTop = 100;
  await fireEvent.scroll(list);
  expect(list.classList.contains("ui-select__listbox--more-above")).toBe(true);
  expect(list.classList.contains("ui-select__listbox--more-below")).toBe(true);
  list.scrollTop = 200;
  await fireEvent.scroll(list);
  expect(list.classList.contains("ui-select__listbox--more-below")).toBe(false);
  Object.defineProperty(list, "scrollHeight", { value: 100 });
  list.scrollTop = 0;
  await fireEvent.scroll(list);
  expect(list.className).not.toMatch(/--more-/);
});
