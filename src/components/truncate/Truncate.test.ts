import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Truncate from "./Truncate.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const long = "treew-inc/supervision-api-payment";

describe("Truncate (Vue)", () => {
  it("renders the text", () => {
    render(Truncate, { props: { text: long } });
    expect(screen.getByText(long)).toBeTruthy();
  });

  it("carries the full text in the title, so nothing is lost to the ellipsis", () => {
    const { container } = render(Truncate, { props: { text: long } });
    expect(container.querySelector(".ui-truncate")?.getAttribute("title")).toBe(long);
  });

  it("clamps to one line by default", () => {
    const { container } = render(Truncate, { props: { text: long } });
    const el = container.querySelector(".ui-truncate") as HTMLElement;
    expect(el.classList.contains("ui-truncate--single")).toBe(true);
  });

  it("clamps to several lines when asked", () => {
    const { container } = render(Truncate, { props: { text: long, lines: 2 } });
    const el = container.querySelector(".ui-truncate") as HTMLElement;
    expect(el.classList.contains("ui-truncate--single")).toBe(false);
    expect(el.style.getPropertyValue("--ui-truncate-lines")).toBe("2");
  });

  it("lets an explicit title win over the text", () => {
    const { container } = render(Truncate, {
      props: { text: long, title: "the full repository path" },
    });
    expect(container.querySelector(".ui-truncate")?.getAttribute("title")).toBe(
      "the full repository path",
    );
  });

  it.each([
    ["single line", { text: long }],
    ["clamped", { text: long, lines: 2 }],
    ["explicit title", { text: long, title: "the full repository path" }],
  ] as const)("has no axe violations (%s)", async (_name, props) => {
    const { container } = render(Truncate, { props });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
