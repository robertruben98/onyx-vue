import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import TriStateCount, { resolveTriState } from "./TriStateCount.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("TriStateCount (Vue)", () => {
  it("shows the number when the value is known", () => {
    render(TriStateCount, { props: { state: "known", value: 5 } });
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("shows zero as a number, because zero is a fact", () => {
    render(TriStateCount, { props: { state: "known", value: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("shows the pending glyph while the data is in flight", () => {
    render(TriStateCount, { props: { state: "pending" } });
    expect(screen.getByText("·")).toBeTruthy();
  });

  it("shows the unrequested glyph when nobody asked", () => {
    render(TriStateCount, { props: { state: "unrequested" } });
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("names the meaning and not the glyph", () => {
    const { container } = render(TriStateCount, { props: { state: "unrequested" } });
    const label = container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label");
    expect(label).toBe("not requested");
    expect(label).not.toContain("—");
  });

  it("distinguishes pending from unrequested in the accessible name", () => {
    const { container } = render(TriStateCount, { props: { state: "pending" } });
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("loading");
  });

  it("reads the count out with its label when one is given", () => {
    const { container } = render(TriStateCount, {
      props: { state: "known", value: 3, label: "open alerts" },
    });
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("3 open alerts");
  });

  it("applies the tone class on the root", () => {
    const { container } = render(TriStateCount, {
      props: { state: "known", value: 2, tone: "danger" },
    });
    expect(
      container
        .querySelector(".ui-tri-state-count")
        ?.classList.contains("ui-tri-state-count--danger"),
    ).toBe(true);
  });

  it("ignores the tone when the value is not known — a colour would be a claim", () => {
    const { container } = render(TriStateCount, {
      props: { state: "pending", tone: "danger" },
    });
    const el = container.querySelector(".ui-tri-state-count");
    expect(el?.classList.contains("ui-tri-state-count--danger")).toBe(false);
    expect(el?.classList.contains("ui-tri-state-count--quiet")).toBe(true);
  });

  it("takes custom glyphs", () => {
    render(TriStateCount, {
      props: { state: "pending", pendingGlyph: "…" },
    });
    expect(screen.getByText("…")).toBeTruthy();
  });

  it("renders the pending glyph with no props at all, never a 0", () => {
    const { container } = render(TriStateCount);
    expect(screen.getByText("·")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("loading");
  });

  it("renders the pending glyph when value is null with no state given", () => {
    render(TriStateCount, { props: { value: null } });
    expect(screen.getByText("·")).toBeTruthy();
  });

  it("still renders a real zero as 0, not as pending", () => {
    render(TriStateCount, { props: { value: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("agrees with resolveTriState for the same input", () => {
    // The regression that would have caught this: the component and its own
    // sibling helper disagreeing about what { value: null } means.
    expect(resolveTriState({ value: null })).toBe("pending");
    render(TriStateCount, { props: { state: "known", value: null } });
    expect(screen.getByText("·")).toBeTruthy();
  });

  it.each(["known", "pending", "unrequested"] as const)(
    "has no axe violations (%s)",
    async (state) => {
      const { container } = render(TriStateCount, {
        props: { state, value: 4, label: "items" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});

describe("resolveTriState", () => {
  it("is unrequested when nobody asked, even with a value lying around", () => {
    expect(resolveTriState({ value: 7, requested: false })).toBe("unrequested");
  });

  it("is pending while loading", () => {
    expect(resolveTriState({ requested: true, loading: true })).toBe("pending");
  });

  it("is pending when requested and the value has not arrived", () => {
    expect(resolveTriState({ requested: true, value: null })).toBe("pending");
  });

  it("is known once a value is in, zero included", () => {
    expect(resolveTriState({ requested: true, value: 0 })).toBe("known");
  });

  it("assumes requested when the caller does not say", () => {
    expect(resolveTriState({ value: 2 })).toBe("known");
  });
});
