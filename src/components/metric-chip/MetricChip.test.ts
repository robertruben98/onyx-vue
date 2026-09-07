import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import MetricChip from "./MetricChip.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("MetricChip (Vue)", () => {
  it("renders the caption and the value", () => {
    render(MetricChip, { props: { label: "commits hoy", value: 23 } });
    expect(screen.getByText("commits hoy")).toBeTruthy();
    expect(screen.getByText("23")).toBeTruthy();
  });

  it("renders a real zero as zero", () => {
    render(MetricChip, { props: { label: "commits hoy", value: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("shows a dot, not a zero, while the value is in flight", () => {
    render(MetricChip, { props: { label: "commits hoy", state: "pending" } });
    expect(screen.getByText("·")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("shows the error glyph when the measurement failed", () => {
    // Un fallo y un cero son afirmaciones opuestas; el chip no puede
    // colapsarlas.
    render(MetricChip, { props: { label: "commits hoy", state: "error" } });
    expect(screen.getByText("!")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("names the failure for assistive tech instead of reading out the glyph", () => {
    const { container } = render(MetricChip, {
      props: { label: "commits hoy", state: "error" },
    });
    expect(
      container.querySelector(".ui-metric-chip__value")?.getAttribute("aria-label"),
    ).toBe("commits hoy: failed");
  });

  it("paints an error as danger whatever tone was asked for", () => {
    const { container } = render(MetricChip, {
      props: { label: "commits hoy", state: "error", tone: "ok" },
    });
    const el = container.querySelector(".ui-metric-chip");
    expect(el?.classList.contains("ui-metric-chip--danger")).toBe(true);
    expect(el?.classList.contains("ui-metric-chip--ok")).toBe(false);
  });

  it("is a span until it is interactive", () => {
    const { container } = render(MetricChip, {
      props: { label: "commits hoy", value: 1 },
    });
    expect(container.querySelector(".ui-metric-chip")?.tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("becomes a real button when interactive, and emits", async () => {
    const { emitted } = render(MetricChip, {
      props: { label: "commits hoy", value: 1, interactive: true },
    });
    await screen.getByRole("button").click();
    expect(emitted().activated).toBeTruthy();
  });

  it("marks a stale value without hiding it", () => {
    const { container } = render(MetricChip, {
      props: { label: "commits hoy", value: 23, stale: true },
    });
    expect(
      container
        .querySelector(".ui-metric-chip")
        ?.classList.contains("ui-metric-chip--stale"),
    ).toBe(true);
    expect(screen.getByText("23")).toBeTruthy();
  });

  it("has no axe violations in any state", async () => {
    for (const state of ["known", "pending", "unrequested", "error"] as const) {
      const { container } = render(MetricChip, {
        props: { label: "commits hoy", value: 4, state, interactive: true },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    }
  });
});
