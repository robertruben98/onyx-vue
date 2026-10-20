import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import GroupHeader from "./GroupHeader.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("GroupHeader (Vue)", () => {
  it("renders the name", () => {
    render(GroupHeader, { props: { name: "supervision-api-payment" } });
    expect(screen.getByText("supervision-api-payment")).toBeTruthy();
  });

  it("renders the long form when given", () => {
    render(GroupHeader, {
      props: { name: "supervision-api-payment", full: "treew-inc/supervision-api-payment" },
    });
    expect(screen.getByText("treew-inc/supervision-api-payment")).toBeTruthy();
  });

  it("omits the long form when there is none", () => {
    const { container } = render(GroupHeader, { props: { name: "core-api" } });
    expect(container.querySelector(".ui-group-header__full")).toBe(null);
  });

  it("projects marks", () => {
    render(GroupHeader, {
      props: { name: "core-api" },
      slots: { marks: "<span>3 listas</span>" },
    });
    expect(screen.getByText("3 listas")).toBeTruthy();
  });

  it("is a plain container by default, with nothing to activate", () => {
    const { container } = render(GroupHeader, { props: { name: "core-api" } });
    expect(container.querySelector("button")).toBe(null);
    expect(container.querySelector(".ui-group-header")?.tagName).toBe("DIV");
  });

  it("becomes a real button when interactive, so a keyboard can reach it", () => {
    render(GroupHeader, { props: { name: "core-api", interactive: true } });
    expect(screen.getByRole("button", { name: /core-api/ })).toBeTruthy();
  });

  it("emits selected when activated", async () => {
    const { emitted } = render(GroupHeader, {
      props: { name: "core-api", interactive: true },
    });
    (screen.getByRole("button") as HTMLButtonElement).click();
    expect(emitted().selected).toBeTruthy();
    expect(emitted().selected!.length).toBe(1);
  });

  it("does not emit when it is not interactive", () => {
    const { container, emitted } = render(GroupHeader, { props: { name: "core-api" } });
    (container.querySelector(".ui-group-header") as HTMLElement).click();
    expect(emitted().selected).toBeFalsy();
  });

  it.each([
    ["plain", { name: "core-api" }],
    ["with long form", { name: "core-api", full: "treew-inc/core-api" }],
    ["interactive", { name: "core-api", interactive: true }],
  ] as const)("has no axe violations (%s)", async (_n, props) => {
    const { container } = render(GroupHeader, {
      props,
      slots: { marks: "<span>2 PR</span>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
