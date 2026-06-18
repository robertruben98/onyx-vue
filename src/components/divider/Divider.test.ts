import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Divider from "./Divider.vue";

describe("Divider (Vue)", () => {
  it("exposes role=separator with horizontal orientation by default", () => {
    render(Divider);
    const sep = screen.getByRole("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("reflects vertical orientation", () => {
    render(Divider, { props: { orientation: "vertical" } });
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });

  it("renders a label when provided", () => {
    render(Divider, { props: { label: "OR" } });
    expect(screen.getByText("OR")).toBeTruthy();
    expect(
      screen.getByRole("separator").classList.contains("ui-divider--labelled"),
    ).toBe(true);
  });

  it("does not render a label when empty", () => {
    render(Divider);
    expect(screen.queryByText("OR")).toBeNull();
    expect(
      screen.getByRole("separator").classList.contains("ui-divider--labelled"),
    ).toBe(false);
  });

  it.each([
    ["plain horizontal", {}],
    ["vertical", { orientation: "vertical" as const }],
    ["labelled", { label: "Section" }],
  ])("has no axe violations (%s)", async (_name, props) => {
    const { container } = render(Divider, { props });
    expect(await axe(container)).toHaveNoViolations();
  });
});
