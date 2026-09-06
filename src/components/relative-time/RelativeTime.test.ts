import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import RelativeTime, { formatRelative } from "./RelativeTime.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const now = new Date("2026-09-06T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatRelative", () => {
  it("counts minutes under an hour", () => {
    expect(formatRelative(ago(5 * MIN), now)).toBe("5m");
  });

  it("shows a fresh timestamp as zero minutes, not as empty", () => {
    expect(formatRelative(ago(10_000), now)).toBe("0m");
  });

  it("counts hours under a day", () => {
    expect(formatRelative(ago(3 * HOUR), now)).toBe("3h");
  });

  it("counts days under a month", () => {
    expect(formatRelative(ago(2 * DAY), now)).toBe("2d");
  });

  it("counts months past thirty-one days", () => {
    expect(formatRelative(ago(120 * DAY), now)).toBe("4mo");
  });

  it("never goes negative when a clock runs ahead", () => {
    expect(formatRelative(new Date(now.getTime() + HOUR), now)).toBe("0m");
  });

  it("pins the minutes/hours boundary: 59 stays minutes, 60 rolls to hours", () => {
    expect(formatRelative(ago(59 * MIN), now)).toBe("59m");
    expect(formatRelative(ago(60 * MIN), now)).toBe("1h");
  });

  it("pins the hours/days boundary: neither side ever reads 24h", () => {
    expect(formatRelative(ago(1439 * MIN), now)).toBe("1d");
    expect(formatRelative(ago(1440 * MIN), now)).toBe("1d");
  });

  it("never renders 24h — 23h is followed directly by 1d", () => {
    expect(formatRelative(ago(1409 * MIN), now)).toBe("23h");
    expect(formatRelative(ago(1410 * MIN), now)).toBe("1d");
  });
});

describe("RelativeTime (Vue)", () => {
  it("renders the compact age", () => {
    render(RelativeTime, { props: { date: ago(2 * HOUR), now } });
    expect(screen.getByText("2h")).toBeTruthy();
  });

  it("carries the machine-readable date", () => {
    const date = ago(DAY);
    const { container } = render(RelativeTime, { props: { date, now } });
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(date);
  });

  it("puts the absolute date in the title, so the age is never the only record", () => {
    const { container } = render(RelativeTime, { props: { date: ago(DAY), now } });
    expect(container.querySelector("time")?.getAttribute("title")).toBeTruthy();
  });

  it("marks a row stale past the threshold", () => {
    const { container } = render(RelativeTime, { props: { date: ago(4 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("does not mark a fresh row stale", () => {
    const { container } = render(RelativeTime, { props: { date: ago(2 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(false);
  });

  it("counts a month as stale, which the string-matching original did not", () => {
    const { container } = render(RelativeTime, { props: { date: ago(30 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("marks a row stale exactly at the threshold, not only past it", () => {
    const { container } = render(RelativeTime, { props: { date: ago(3 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("honours a custom threshold", () => {
    const { container } = render(RelativeTime, {
      props: { date: ago(2 * DAY), now, staleAfterDays: 1 },
    });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(RelativeTime, { props: { date: ago(DAY), now } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
