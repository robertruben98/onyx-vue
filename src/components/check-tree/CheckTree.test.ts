import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import CheckTree from "./CheckTree.vue";
import type { CheckTreeGroup } from "./CheckTree.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const GROUPS: CheckTreeGroup[] = [
  {
    key: "work",
    label: "sm23",
    note: "33 repos",
    items: [
      { key: "work/api", label: "api", note: "19 hoy" },
      { key: "work/pay", label: "pay", note: "15 hoy" },
    ],
  },
  {
    key: "mine",
    label: "robertdev",
    items: [
      { key: "mine/panel", label: "panel" },
      { key: "mine/onyx", label: "onyx" },
    ],
  },
  { key: "loose", label: "suelto" },
];

function mount(excluded: string[] = []) {
  return render(CheckTree, {
    props: { groups: GROUPS, excluded, label: "que cuenta" },
  });
}

/** El `role="group"` de cada grupo lleva su mismo nombre: hay que pedir el input. */
function box(label: string): HTMLInputElement {
  return screen.getByLabelText(label, { selector: "input" }) as HTMLInputElement;
}

describe("CheckTree (Vue)", () => {
  it("renders every group and leaf, and the notes", () => {
    mount();
    expect(box("sm23").checked).toBe(true);
    expect(box("api").checked).toBe(true);
    expect(screen.getByText("33 repos")).toBeTruthy();
    expect(screen.getByText("19 hoy")).toBeTruthy();
  });

  it("takes a group with no items", () => {
    mount();
    expect(box("suelto").checked).toBe(true);
  });

  it("leaves a leaf unchecked when its own key is off", () => {
    mount(["work/pay"]);
    expect(box("pay").checked).toBe(false);
    expect(box("api").checked).toBe(true);
  });

  it("a group with one leaf off shows a dash, not a tick or an empty box", () => {
    // Con marca afirmaria "todo" y sin marca "nada", teniendo delante "algunos".
    mount(["work/pay"]);
    expect(box("sm23").indeterminate).toBe(true);
    expect(box("sm23").checked).toBe(true);
  });

  it("a group that is off drags its leaves with it, marks and all", () => {
    mount(["work"]);
    expect(box("sm23").checked).toBe(false);
    expect(box("sm23").indeterminate).toBe(false);
    expect(box("api").checked).toBe(false);
    expect(box("api").disabled).toBe(true);
  });

  it("adds the group key when the group is unchecked", async () => {
    const user = userEvent.setup();
    const { emitted } = mount();
    await user.click(box("sm23"));
    expect(emitted()["update:excluded"].at(-1)).toEqual([["work"]]);
    expect(emitted().toggled.at(-1)).toEqual(["work", false]);
  });

  it("checking a group drops the exceptions it had inside", async () => {
    // Una casilla marcada que siguiera dejando cosas fuera seria una casilla
    // que miente.
    const user = userEvent.setup();
    const { emitted } = mount(["work", "work/pay"]);
    await user.click(box("sm23"));
    expect(emitted()["update:excluded"].at(-1)).toEqual([[]]);
  });

  it("stores just the leaf when one of several is unchecked", async () => {
    const user = userEvent.setup();
    const { emitted } = mount();
    await user.click(box("pay"));
    expect(emitted()["update:excluded"].at(-1)).toEqual([["work/pay"]]);
  });

  it("promotes to the group when the last leaf goes off", async () => {
    // "todas las hojas fuera" y "el grupo fuera" se ven igual en pantalla: si
    // ademas se guardaran distinto, uno de los dos heredaria lo que llegue
    // manana y el otro no, sin nada que lo explique.
    const user = userEvent.setup();
    const { emitted } = mount(["work/api"]);
    await user.click(box("pay"));
    expect(emitted()["update:excluded"].at(-1)).toEqual([["work"]]);
  });

  it("does not touch other groups' keys", async () => {
    const user = userEvent.setup();
    const { emitted } = mount(["mine"]);
    await user.click(box("api"));
    expect(emitted()["update:excluded"].at(-1)).toEqual([["mine", "work/api"]]);
  });

  it("says so when there is nothing to choose from", () => {
    render(CheckTree, { props: { groups: [], emptyText: "aun no hay datos" } });
    expect(screen.getByText("aun no hay datos")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = mount(["work"]);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
