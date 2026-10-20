import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import SparkBars from "./SparkBars.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function heights(container: Element): string[] {
  return [...container.querySelectorAll(".ui-spark-bars__fill")].map(
    (f) => (f as HTMLElement).style.height,
  );
}

const week = [
  { label: "lun", value: 0 },
  { label: "mar", value: 50 },
  { label: "hoy", value: 100, current: true },
];

describe("SparkBars (Vue)", () => {
  it("renders one bar per entry, with its value and its label", () => {
    const { container, getByText } = render(SparkBars, { props: { bars: week } });
    expect(container.querySelectorAll(".ui-spark-bars__bar").length).toBe(3);
    expect(getByText("mar")).toBeTruthy();
    expect(getByText("50")).toBeTruthy();
  });

  it("scales the series to its own peak by default", () => {
    const { container } = render(SparkBars, { props: { bars: week } });
    expect(heights(container)).toEqual(["0%", "50%", "100%"]);
  });

  it("scales to an explicit max when the series is read against a target", () => {
    const { container } = render(SparkBars, {
      props: { bars: [{ label: "p50", value: 50 }], max: 200 },
    });
    expect(heights(container)).toEqual(["25%"]);
  });

  it("gives a tiny value a visible floor", () => {
    // Un 1 contra un pico de 200 redondea a 1% y se lee como un cero, que es
    // justo lo contrario de lo que paso.
    const { container } = render(SparkBars, {
      props: {
        bars: [{ label: "a", value: 1 }, { label: "b", value: 200 }],
        minFilled: 8,
      },
    });
    expect(heights(container)[0]).toBe("8%");
  });

  it("leaves a real zero at zero height", () => {
    const { container } = render(SparkBars, {
      props: { bars: [{ label: "sab", value: 0 }] },
    });
    expect(heights(container)).toEqual(["0%"]);
  });

  it("survives a series that is all zeros instead of dividing by zero", () => {
    const { container } = render(SparkBars, {
      props: { bars: [{ label: "a", value: 0 }, { label: "b", value: 0 }] },
    });
    expect(heights(container)).toEqual(["0%", "0%"]);
  });

  it("marks the current bar", () => {
    const { container } = render(SparkBars, { props: { bars: week } });
    const bars = container.querySelectorAll(".ui-spark-bars__bar");
    expect(bars[2].classList.contains("ui-spark-bars__bar--current")).toBe(true);
    expect(bars[1].classList.contains("ui-spark-bars__bar--current")).toBe(false);
  });

  it("reads the whole series out in the accessible name", () => {
    const { container } = render(SparkBars, {
      props: { bars: week, label: "commits per day" },
    });
    expect(
      container.querySelector(".ui-spark-bars")?.getAttribute("aria-label"),
    ).toBe("commits per day: lun 0, mar 50, hoy 100");
  });

  it("titles a bar with the caller's text when it gives one", () => {
    const { container } = render(SparkBars, {
      props: { bars: [{ label: "hoy", value: 2, title: "2026-09-07: 2 commits" }] },
    });
    expect(
      container.querySelector(".ui-spark-bars__bar")?.getAttribute("title"),
    ).toBe("2026-09-07: 2 commits");
  });

  it("has no axe violations", async () => {
    const { container } = render(SparkBars, {
      props: { bars: week, label: "commits per day" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
