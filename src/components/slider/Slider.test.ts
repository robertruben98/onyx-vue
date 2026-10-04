import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Slider from "./Slider.vue";

describe("Slider (Vue)", () => {
  it("is a range input named by its label, with min, max and step", () => {
    render(Slider, { props: { label: "Volume", min: 0, max: 10, step: 2, modelValue: 4 } });
    const el = screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
    expect(el.min).toBe("0");
    expect(el.max).toBe("10");
    expect(el.step).toBe("2");
    expect(el.value).toBe("4");
  });

  it("falls back to ariaLabel without a visible label", () => {
    render(Slider, { props: { ariaLabel: "Speed" } });
    expect(screen.getByRole("slider", { name: "Speed" })).toBeTruthy();
  });

  it("emits a number on input", async () => {
    const { emitted } = render(Slider, { props: { ariaLabel: "V" } });
    await fireEvent.update(screen.getByRole("slider"), "35");
    expect(emitted()["update:modelValue"]?.[0]).toEqual([35]);
    expect(emitted().valueChanged?.[0]).toEqual([35]);
  });

  it("shows the value and reads it as words with valueText", () => {
    render(Slider, {
      props: { label: "Speed", showValue: true, modelValue: 1.5, valueText: (v: number) => `${v}×` },
    });
    expect(screen.getByText("1.5×")).toBeTruthy();
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("1.5×");
  });

  it("shows the raw value without valueText and sets no aria-valuetext", () => {
    render(Slider, { props: { label: "N", showValue: true, modelValue: 7 } });
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByRole("slider").hasAttribute("aria-valuetext")).toBe(false);
  });

  it("paints the fill at the value, clamped to the range", () => {
    const at = (props: Record<string, unknown>) =>
      (render(Slider, { props: { ariaLabel: "x", ...props } }).container.firstElementChild as HTMLElement).style.getPropertyValue("--ui-slider-fill-at");
    expect(at({ modelValue: 25 })).toBe("25%");
    expect(at({ modelValue: 150 })).toBe("100%");
    expect(at({ min: 5, max: 5, modelValue: 5 })).toBe("0%");
  });

  it("forwards attributes to the input and disables it", () => {
    render(Slider, { props: { ariaLabel: "x", disabled: true }, attrs: { name: "volume", "aria-describedby": "hint" } });
    const el = screen.getByRole("slider") as HTMLInputElement;
    expect(el.name).toBe("volume");
    expect(el.getAttribute("aria-describedby")).toBe("hint");
    expect(el.disabled).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(Slider, { props: { label: "Volume", showValue: true } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
