import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import StatusDot from "./StatusDot.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const states = ["live", "dead", "warn", "off", "unknown"] as const;

describe("StatusDot (Vue)", () => {
  it("defaults to the unknown state", () => {
    const { container } = render(StatusDot);
    expect(
      container.querySelector(".ui-status-dot")?.classList.contains("ui-status-dot--unknown"),
    ).toBe(true);
  });

  it("applies the state class on the root", () => {
    const { container } = render(StatusDot, { props: { state: "live" } });
    expect(
      container.querySelector(".ui-status-dot")?.classList.contains("ui-status-dot--live"),
    ).toBe(true);
  });

  it("exposes the label as an image role so the state is not colour-only", () => {
    render(StatusDot, { props: { state: "dead", label: "Down" } });
    expect(screen.getByRole("img", { name: "Down" })).toBeTruthy();
  });

  it("is hidden from assistive tech when it carries no label", () => {
    const { container } = render(StatusDot, { props: { state: "live" } });
    const dot = container.querySelector(".ui-status-dot");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.getAttribute("role")).toBe(null);
  });

  it.each(states)("has no axe violations (%s state)", async (state) => {
    const { container } = render(StatusDot, { props: { state, label: "Status" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
