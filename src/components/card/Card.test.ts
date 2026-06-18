import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Card from "./Card.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Card (Vue)", () => {
  it("projects default content", () => {
    render(Card, { slots: { default: "Body content" } });
    expect(screen.getByText("Body content")).toBeTruthy();
  });

  it("projects header and footer slots", () => {
    render(Card, {
      slots: { header: "Header", default: "Body", footer: "Footer" },
    });
    expect(screen.getByText("Header")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });

  it("does not render the header region when no header slot is provided", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(container.querySelector(".ui-card__header")).toBeNull();
  });

  it("does not render the footer region when no footer slot is provided", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(container.querySelector(".ui-card__footer")).toBeNull();
  });

  it("defaults to the elevated variant", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(
      container.querySelector(".ui-card")?.classList.contains("ui-card--elevated"),
    ).toBe(true);
  });

  it("applies the variant class to the root", () => {
    const { container } = render(Card, {
      props: { variant: "outlined" },
      slots: { default: "Body" },
    });
    expect(
      container.querySelector(".ui-card")?.classList.contains("ui-card--outlined"),
    ).toBe(true);
  });

  it.each(["elevated", "outlined"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(Card, {
        props: { variant },
        slots: {
          header: "Title",
          default: "Content",
          footer: "Actions",
        },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
