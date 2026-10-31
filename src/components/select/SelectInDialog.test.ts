import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { defineComponent, ref } from "vue";
import Dialog from "../dialog/Dialog.vue";
import Select, { type SelectOption } from "./Select.vue";

// UiSelect inside UiDialog (0.13.1). The select teleports to `body` like the
// dialog, so only z-index orders them. It used `--ui-overlay-z` (1000), below
// `--ui-dialog-z` (1100): the list opened behind the modal and the next field
// intercepted the click on an option painted over it.

const OPTIONS: SelectOption[] = [
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
  { value: "dropped", label: "Dropped" },
];

const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
const scss = readFileSync(join(process.cwd(), "src", "components", "select", "select.scss"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

function tokenValue(name: string): number {
  const m = new RegExp(`${name}:\\s*([^;]+);`).exec(tokens);
  if (!m) throw new Error(`${name} is not defined`);
  return Number(m[1].trim());
}

/** The token a rule's z-index asks for, e.g. `--ui-select-z`. */
function zTokenOf(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`${esc}\\s*\\{[^}]*z-index:\\s*var\\((--[\\w-]+)`).exec(scss);
  if (!m) throw new Error(`no z-index token on ${selector}`);
  return m[1];
}

describe("Select inside a Dialog — layering", () => {
  it("paints the open list above the dialog", () => {
    expect(tokenValue(zTokenOf(".ui-select__pane"))).toBeGreaterThan(tokenValue("--ui-dialog-z"));
  });

  it("puts its click-outside backdrop above the dialog too", () => {
    // Below the dialog, a click outside the list would land on the dialog's
    // fields instead of closing the list.
    expect(tokenValue(zTokenOf(".ui-select__backdrop"))).toBeGreaterThan(tokenValue("--ui-dialog-z"));
  });

  it("keeps the tooltip above the select", () => {
    expect(tokenValue("--ui-tooltip-z")).toBeGreaterThan(tokenValue(zTokenOf(".ui-select__pane")));
  });
});

const Harness = defineComponent({
  components: { UiDialog: Dialog, UiSelect: Select },
  setup() {
    return { open: ref(true), state: ref("open"), result: ref("open") };
  },
  template: `
    <UiDialog v-model:open="open" heading="Edit row">
      <UiSelect v-model="state" :options="options" aria-label="State" />
      <UiSelect v-model="result" :options="options" aria-label="Result" />
    </UiDialog>
    <output data-testid="open">{{ open }}</output>
    <output data-testid="state">{{ state }}</output>`,
  data: () => ({ options: OPTIONS }),
});

describe("Select inside a Dialog — behaviour", () => {
  async function openFirst() {
    render(Harness);
    await fireEvent.click(screen.getByRole("combobox", { name: "State" }));
    return screen.findByRole("listbox");
  }

  it("selects any option of the open list", async () => {
    await openFirst();
    await fireEvent.click(screen.getByRole("option", { name: "Dropped" }));
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("dropped"));
    expect(screen.getByTestId("open").textContent).toBe("true");
  });

  it("a click outside the list closes the list and leaves the dialog open", async () => {
    await openFirst();
    const backdrop = document.querySelector(".ui-select__backdrop")!;
    await fireEvent.mouseDown(backdrop);
    await fireEvent.click(backdrop);
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("Esc closes the list first, and only a second Esc closes the dialog", async () => {
    const listbox = await openFirst();
    await fireEvent.keyDown(listbox, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByTestId("open").textContent).toBe("true");
    // Focus went back to the trigger, inside the dialog panel.
    const trigger = screen.getByRole("combobox", { name: "State" });
    expect(document.activeElement).toBe(trigger);
    await fireEvent.keyDown(trigger, { key: "Escape" });
    await waitFor(() => expect(screen.getByTestId("open").textContent).toBe("false"));
  });
});
