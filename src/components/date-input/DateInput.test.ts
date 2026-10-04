import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import DateInput from "./DateInput.vue";

const input = (c: Element) => c.querySelector("input") as HTMLInputElement;

describe("DateInput (Vue)", () => {
  it("is a date input named by its label", () => {
    const { container } = render(DateInput, { props: { label: "Release date", modelValue: "2026-10-04" } });
    expect(screen.getByLabelText("Release date")).toBe(input(container));
    expect(input(container).type).toBe("date");
    expect(input(container).value).toBe("2026-10-04");
  });

  it("renders time, datetime-local and month pickers", () => {
    for (const type of ["time", "datetime-local", "month"] as const) {
      const { container, unmount } = render(DateInput, { props: { type, ariaLabel: type } });
      expect(input(container).type).toBe(type);
      unmount();
    }
  });

  it("emits the ISO value on input", async () => {
    const { container, emitted } = render(DateInput, { props: { ariaLabel: "When" } });
    await fireEvent.update(input(container), "2026-12-24");
    expect(emitted()["update:modelValue"]?.[0]).toEqual(["2026-12-24"]);
    expect(emitted().valueChanged?.[0]).toEqual(["2026-12-24"]);
  });

  it("passes min and max, and leaves them off when empty", () => {
    const a = render(DateInput, { props: { ariaLabel: "a", min: "2026-01-01", max: "2026-12-31" } });
    expect(input(a.container).min).toBe("2026-01-01");
    expect(input(a.container).max).toBe("2026-12-31");
    a.unmount();
    const b = render(DateInput, { props: { ariaLabel: "b" } });
    expect(input(b.container).hasAttribute("min")).toBe(false);
  });

  it("reflects size, invalid and disabled", () => {
    const { container } = render(DateInput, { props: { ariaLabel: "x", size: "lg", invalid: true, disabled: true } });
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("ui-input--lg")).toBe(true);
    expect(root.classList.contains("ui-input--invalid")).toBe(true);
    expect(input(container).getAttribute("aria-invalid")).toBe("true");
    expect(input(container).disabled).toBe(true);
    const sm = render(DateInput, { props: { ariaLabel: "y", size: "sm" } });
    expect((sm.container.firstElementChild as HTMLElement).classList.contains("ui-input--sm")).toBe(true);
  });

  it("forwards attributes to the input", () => {
    const { container } = render(DateInput, { props: { ariaLabel: "x" }, attrs: { name: "due", "aria-describedby": "hint", class: "mine" } });
    expect(input(container).name).toBe("due");
    expect(input(container).getAttribute("aria-describedby")).toBe("hint");
    expect((container.firstElementChild as HTMLElement).classList.contains("mine")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(DateInput, { props: { label: "Release date" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
