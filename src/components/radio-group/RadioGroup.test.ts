import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import RadioGroup from "./RadioGroup.vue";
import type { RadioOption } from "./RadioGroup.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const OPTIONS: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

describe("RadioGroup (Vue)", () => {
  it("renders a named radiogroup with one radio per option", () => {
    render(RadioGroup, { props: { label: "Size", options: OPTIONS } });
    expect(screen.getByRole("radiogroup", { name: /size/i })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("emits valueChange with the selected value on click", async () => {
    const { emitted } = render(RadioGroup, {
      props: { label: "Size", options: OPTIONS },
    });
    await fireEvent.click(screen.getByRole("radio", { name: /medium/i }));
    const events = emitted().valueChange as unknown[][];
    expect(events).toBeTruthy();
    expect(events[events.length - 1]).toEqual(["md"]);
  });

  it("updates v-model on selection", async () => {
    const { emitted } = render(RadioGroup, {
      props: { label: "Size", options: OPTIONS },
    });
    await fireEvent.click(screen.getByRole("radio", { name: /small/i }));
    const updates = emitted()["update:modelValue"] as unknown[][];
    expect(updates[updates.length - 1]).toEqual(["sm"]);
  });

  it("reflects the model value as checked", () => {
    render(RadioGroup, {
      props: { label: "Size", options: OPTIONS, modelValue: "lg" },
    });
    const large = screen.getByRole("radio", { name: /large/i }) as HTMLInputElement;
    expect(large.checked).toBe(true);
  });

  it("disables an individual option", () => {
    render(RadioGroup, {
      props: {
        label: "Size",
        options: [...OPTIONS, { label: "X-Large", value: "xl", disabled: true }],
      },
    });
    const xl = screen.getByRole("radio", { name: /x-large/i }) as HTMLInputElement;
    expect(xl.disabled).toBe(true);
  });

  it("disables the whole group", () => {
    render(RadioGroup, {
      props: { label: "Size", options: OPTIONS, disabled: true },
    });
    screen
      .getAllByRole("radio")
      .forEach((r) => expect((r as HTMLInputElement).disabled).toBe(true));
  });

  it("does not emit valueChange when the group is disabled", async () => {
    const { emitted } = render(RadioGroup, {
      props: { label: "Size", options: OPTIONS, disabled: true },
    });
    await fireEvent.click(screen.getByRole("radio", { name: /medium/i }));
    expect(emitted().valueChange).toBeFalsy();
  });

  it("sets aria-invalid when invalid", () => {
    render(RadioGroup, {
      props: { label: "Size", options: OPTIONS, invalid: true },
    });
    expect(
      screen.getByRole("radiogroup").getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("uses ariaLabel as the accessible name when no visible label", () => {
    render(RadioGroup, { props: { ariaLabel: "Pick a size", options: OPTIONS } });
    expect(screen.getByRole("radiogroup", { name: /pick a size/i })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(RadioGroup, {
      props: { label: "Size", options: OPTIONS },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
