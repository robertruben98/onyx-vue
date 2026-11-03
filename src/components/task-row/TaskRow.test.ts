import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render } from "@testing-library/vue";
import { axe } from "jest-axe";
import TaskRow from "./TaskRow.vue";

const text = "mandame por whatsapp el valor de X";
const meta = "Robert · OpenID-Payment-Seguridad · hace 2 h";

describe("TaskRow (Vue)", () => {
  it("emits toggle(true) when ticked while not done", async () => {
    const { getByRole, emitted } = render(TaskRow, { props: { text } });
    await fireEvent.click(getByRole("checkbox"));
    expect(emitted().toggle).toEqual([[true]]);
  });

  it("emits toggle(false) when unticked while done", async () => {
    const { getByRole, emitted } = render(TaskRow, { props: { text, done: true } });
    expect((getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    await fireEvent.click(getByRole("checkbox"));
    expect(emitted().toggle).toEqual([[false]]);
  });

  it("clicking the task text toggles it too", async () => {
    const { getByText, emitted } = render(TaskRow, { props: { text } });
    await fireEvent.click(getByText(text));
    expect(emitted().toggle).toEqual([[true]]);
  });

  it("busy disables the checkbox, shows a spinner and emits nothing", async () => {
    const { getByRole, container, emitted } = render(TaskRow, { props: { text, busy: true } });
    const box = getByRole("checkbox") as HTMLInputElement;
    expect(box.disabled).toBe(true);
    expect(container.querySelector(".ui-spinner")).not.toBeNull();
    expect(container.querySelector(".ui-task-row")?.getAttribute("aria-busy")).toBe("true");
    await fireEvent.click(box);
    expect(emitted().toggle).toBeUndefined();
  });

  it("disabled emits nothing and shows no spinner", async () => {
    const { getByRole, container, emitted } = render(TaskRow, { props: { text, disabled: true } });
    await fireEvent.click(getByRole("checkbox"));
    expect(emitted().toggle).toBeUndefined();
    expect(container.querySelector(".ui-spinner")).toBeNull();
  });

  it("done adds the done class; open rows do not have it", () => {
    const done = render(TaskRow, { props: { text, done: true } });
    expect(done.container.querySelector(".ui-task-row--done")).not.toBeNull();
    const open = render(TaskRow, { props: { text } });
    expect(open.container.querySelector(".ui-task-row--done")).toBeNull();
  });

  it("the accessible name is the task text and the meta describes it", () => {
    const { getByRole } = render(TaskRow, { props: { text, meta } });
    const box = getByRole("checkbox", { name: text });
    const described = box.getAttribute("aria-describedby")!;
    expect(document.getElementById(described)?.textContent).toBe(meta);
  });

  it("omits the meta line and aria-describedby without meta", () => {
    const { getByRole, container } = render(TaskRow, { props: { text } });
    expect(container.querySelector(".ui-task-row__meta")).toBeNull();
    expect(getByRole("checkbox").getAttribute("aria-describedby")).toBeNull();
  });

  it("long text wraps instead of overflowing, and the row is at least 44px", () => {
    const long = "x".repeat(300);
    const { getByText } = render(TaskRow, { props: { text: long, meta: long } });
    expect(getByText(long, { selector: ".ui-checkbox__label" })).toBeTruthy();
    const scss = readFileSync(join(__dirname, "task-row.scss"), "utf8");
    expect(scss).toContain("overflow-wrap: anywhere");
    expect(scss).toContain("min-width: 0");
    expect(scss.match(/min-height: 2\.75rem/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("has no axe violations (open, done, busy)", async () => {
    for (const props of [{ text, meta }, { text, done: true, meta }, { text, busy: true }]) {
      const { container, unmount } = render(TaskRow, { props });
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
