import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import SectionHeader from "./SectionHeader.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("SectionHeader (Vue)", () => {
  it("renders the title as a heading", () => {
    render(SectionHeader, { props: { title: "pull requests" } });
    expect(screen.getByRole("heading", { name: "pull requests" })).toBeTruthy();
  });

  it("defaults to an h2", () => {
    const { container } = render(SectionHeader, { props: { title: "alerts" } });
    expect(container.querySelector("h2")).toBeTruthy();
  });

  it("honours a different heading level, so a page keeps a sane outline", () => {
    const { container } = render(SectionHeader, {
      props: { title: "alerts", headingLevel: 3 },
    });
    expect(container.querySelector("h3")).toBeTruthy();
    expect(container.querySelector("h2")).toBe(null);
  });

  it("renders the count when given", () => {
    render(SectionHeader, { props: { title: "issues", count: 12 } });
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("renders a string count, because the console pages pass prose there", () => {
    render(SectionHeader, {
      props: { title: "issues", count: "12 · GitHub dice 40" },
    });
    expect(screen.getByText("12 · GitHub dice 40")).toBeTruthy();
  });

  it("omits the count element entirely when there is none", () => {
    const { container } = render(SectionHeader, { props: { title: "issues" } });
    expect(container.querySelector(".ui-section-header__count")).toBe(null);
  });

  it("treats a zero count as a value, not as absent", () => {
    const { container } = render(SectionHeader, {
      props: { title: "issues", count: 0 },
    });
    expect(container.querySelector(".ui-section-header__count")?.textContent).toBe("0");
  });

  it("projects actions", () => {
    render(SectionHeader, {
      props: { title: "pull requests" },
      slots: { actions: "<button>agrupar por repo</button>" },
    });
    expect(screen.getByRole("button", { name: "agrupar por repo" })).toBeTruthy();
  });

  it("projects controls", () => {
    render(SectionHeader, {
      props: { title: "pull requests" },
      slots: { controls: "<span>orden</span>" },
    });
    expect(screen.getByText("orden")).toBeTruthy();
  });

  it("applies the quiet modifier", () => {
    const { container } = render(SectionHeader, {
      props: { title: "secrets", quiet: true },
    });
    expect(
      container
        .querySelector(".ui-section-header")
        ?.classList.contains("ui-section-header--quiet"),
    ).toBe(true);
  });

  it.each([
    ["plain", {}],
    ["with count", { count: 3 }],
    ["quiet", { quiet: true }],
  ] as const)("has no axe violations (%s)", async (_name, extra) => {
    const { container } = render(SectionHeader, {
      props: { title: "pull requests", ...extra },
      slots: { actions: "<button>ver todo</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
