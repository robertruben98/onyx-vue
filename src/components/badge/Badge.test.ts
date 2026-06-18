import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Badge from "./Badge.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const variants = ["neutral", "info", "success", "warning", "danger"] as const;

describe("Badge (Vue)", () => {
  it("projects its content", () => {
    render(Badge, { slots: { default: "New" } });
    expect(screen.getByText("New")).toBeTruthy();
  });

  it("applies the variant class on the root", () => {
    const { container } = render(Badge, {
      props: { variant: "success" },
      slots: { default: "OK" },
    });
    expect(
      container.querySelector(".ui-badge")?.classList.contains("ui-badge--success"),
    ).toBe(true);
  });

  it("defaults to the neutral variant", () => {
    const { container } = render(Badge, { slots: { default: "Default" } });
    expect(
      container.querySelector(".ui-badge")?.classList.contains("ui-badge--neutral"),
    ).toBe(true);
  });

  it.each(variants)("has no axe violations (%s variant)", async (variant) => {
    const { container } = render(Badge, {
      props: { variant },
      slots: { default: "Label" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
