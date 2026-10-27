import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import SequenceGrid, { formatRanges } from "./SequenceGrid.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function states(container: Element): string[] {
  return [...container.querySelectorAll(".ui-sequence-grid__cell")].map((c) =>
    c.classList.contains("ui-sequence-grid__cell--missing") ? "missing" : "present",
  );
}

describe("formatRanges", () => {
  it("collapses runs of three or more", () => {
    expect(formatRanges([1, 2, 3, 7, 9, 10])).toBe("1-3, 7, 9, 10");
  });

  it("sorts and de-duplicates", () => {
    expect(formatRanges([5, 3, 4, 4])).toBe("3-5");
  });

  it("is empty for nothing", () => {
    expect(formatRanges([])).toBe("");
  });
});

describe("SequenceGrid (Vue)", () => {
  it("renders one cell per number, printed", () => {
    const { container } = render(SequenceGrid, { props: { max: 4 } });
    const cells = container.querySelectorAll(".ui-sequence-grid__cell");
    expect(cells.length).toBe(4);
    expect(cells[2].textContent).toContain("3");
  });

  it("marks the missing numbers and only those", () => {
    const { container } = render(SequenceGrid, { props: { max: 5, missing: [2, 5] } });
    expect(states(container)).toEqual(["present", "missing", "present", "present", "missing"]);
  });

  it("starts where it is told to", () => {
    const { container } = render(SequenceGrid, { props: { start: 25, max: 27 } });
    const cells = [...container.querySelectorAll(".ui-sequence-grid__cell")];
    expect(cells.map((c) => c.firstChild?.textContent?.trim())).toEqual(["25", "26", "27"]);
  });

  it("ignores a missing number outside the run", () => {
    const { container } = render(SequenceGrid, { props: { max: 3, missing: [9] } });
    expect(states(container)).toEqual(["present", "present", "present"]);
  });

  it("names the run with its count and its gaps as ranges", () => {
    const { getByRole } = render(SequenceGrid, {
      props: { max: 12, missing: [4, 10, 11, 12], label: "Season 1 episodes" },
    });
    expect(getByRole("list").getAttribute("aria-label")).toBe(
      "Season 1 episodes: 8 of 12 present, missing 4, 10-12",
    );
  });

  it("says the state of each cell in words, not only in colour", () => {
    const { container } = render(SequenceGrid, {
      props: { max: 2, missing: [2], itemLabel: "Episode" },
    });
    const cells = container.querySelectorAll(".ui-sequence-grid__cell");
    expect(cells[1].textContent).toContain("missing");
    expect(cells[1].getAttribute("title")).toBe("Episode 2: missing");
  });

  it("renders an empty list when the run is empty", () => {
    const { container } = render(SequenceGrid, { props: { max: 0 } });
    expect(container.querySelectorAll(".ui-sequence-grid__cell").length).toBe(0);
  });

  it("works from what is present: every other number is a gap", () => {
    const { container } = render(SequenceGrid, { props: { present: [1, 2, 5] } });
    expect(states(container)).toEqual(["present", "present", "missing", "missing", "present"]);
  });

  it("takes max over present when both are given, and ignores missing then", () => {
    const { container } = render(SequenceGrid, { props: { present: [2], max: 3, missing: [2] } });
    expect(states(container)).toEqual(["missing", "present", "missing"]);
  });

  it("renders nothing for an empty present list with no max", () => {
    const { container } = render(SequenceGrid, { props: { present: [] } });
    expect(container.querySelectorAll(".ui-sequence-grid__cell").length).toBe(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(SequenceGrid, {
      props: { max: 8, missing: [3, 4], label: "Episodes" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
