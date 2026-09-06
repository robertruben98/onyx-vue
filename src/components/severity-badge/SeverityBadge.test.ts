import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import SeverityBadge, { severityRank } from "./SeverityBadge.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const severities = ["critical", "high", "moderate", "medium", "low", "unknown"] as const;

describe("SeverityBadge (Vue)", () => {
  it("renders the severity as its own label", () => {
    render(SeverityBadge, { props: { severity: "critical" } });
    expect(screen.getByText("critical")).toBeTruthy();
  });

  it("lets a slot override the visible text", () => {
    render(SeverityBadge, {
      props: { severity: "high" },
      slots: { default: "HIGH (2)" },
    });
    expect(screen.getByText("HIGH (2)")).toBeTruthy();
  });

  it("applies the severity class on the root", () => {
    const { container } = render(SeverityBadge, { props: { severity: "moderate" } });
    expect(
      container
        .querySelector(".ui-severity-badge")
        ?.classList.contains("ui-severity-badge--moderate"),
    ).toBe(true);
  });

  it("treats medium as moderate, which is the same rung under another name", () => {
    const { container } = render(SeverityBadge, { props: { severity: "medium" } });
    expect(
      container
        .querySelector(".ui-severity-badge")
        ?.classList.contains("ui-severity-badge--moderate"),
    ).toBe(true);
  });

  it.each(severities)("has no axe violations (%s)", async (severity) => {
    const { container } = render(SeverityBadge, { props: { severity } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("severityRank", () => {
  it("orders worst first", () => {
    const shuffled = ["low", "critical", "unknown", "moderate", "high"];
    expect([...shuffled].sort((a, b) => severityRank(a) - severityRank(b))).toEqual([
      "critical",
      "high",
      "moderate",
      "low",
      "unknown",
    ]);
  });

  it("ranks medium alongside moderate", () => {
    expect(severityRank("medium")).toBe(severityRank("moderate"));
  });

  it("is case-insensitive, because GitHub shouts its severities", () => {
    expect(severityRank("CRITICAL")).toBe(severityRank("critical"));
  });

  it("sends anything it does not recognise to the back", () => {
    expect(severityRank("banana")).toBe(9);
  });
});
