import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ProgressBar from "./ProgressBar.vue";

describe("ProgressBar (Vue)", () => {
  it("exposes role=progressbar with ARIA value attributes", () => {
    render(ProgressBar, { props: { value: 40, label: "Upload" } });
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("clamps the fill width to 0–100%", () => {
    const { container } = render(ProgressBar, { props: { value: 150 } });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("computes percentage against a custom max", () => {
    const { container } = render(ProgressBar, { props: { value: 1, max: 4 } });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(ProgressBar, { props: { indeterminate: true, label: "Loading" } });
    expect(
      screen.getByRole("progressbar").hasAttribute("aria-valuenow"),
    ).toBe(false);
  });

  it("has no axe violations (determinate)", async () => {
    const { container } = render(ProgressBar, {
      props: { value: 60, label: "Progress" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (indeterminate)", async () => {
    const { container } = render(ProgressBar, {
      props: { indeterminate: true, label: "Loading" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
