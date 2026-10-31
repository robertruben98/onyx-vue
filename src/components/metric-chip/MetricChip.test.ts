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

const PLAIN_CHIP_0113 = "<span class=\"ui-metric-chip ui-metric-chip--ok\"><span class=\"ui-metric-chip__label\">conf</span><span class=\"ui-tri-state-count ui-tri-state-count--ok ui-metric-chip__value\" aria-label=\"74 conf\" role=\"img\"><span aria-hidden=\"true\">74</span></span></span>";

describe("MetricChip previous / delta", () => {
  const delta = (c: Element) => c.querySelector(".ui-metric-chip__delta");

  it("without previous renders exactly what 0.11.3 rendered", () => {
    const { container } = render(MetricChip, { props: { label: "conf", value: 74, tone: "success" } });
    expect(container.innerHTML.replace(/<!--[\s\S]*?-->/g, "")).toBe(PLAIN_CHIP_0113);
  });

  it("shows a rise as (+16), toned good, read as 'up 16'", () => {
    const { container } = render(MetricChip, { props: { label: "conf", value: 74, previous: 58 } });
    const d = delta(container)!;
    expect(d.querySelector("[aria-hidden='true']")!.textContent).toBe("(+16)");
    expect(d.querySelector(".ui-metric-chip__sr")!.textContent).toBe("up 16");
    expect(d.classList.contains("ui-metric-chip__delta--up")).toBe(true);
    expect(d.classList.contains("ui-metric-chip__delta--good")).toBe(true);
  });

  it("shows a fall with a real minus sign, toned bad", () => {
    const { container } = render(MetricChip, { props: { label: "conf", value: 40, previous: 58 } });
    const d = delta(container)!;
    expect(d.textContent).toContain("(\u221218)");
    expect(d.querySelector(".ui-metric-chip__sr")!.textContent).toBe("down 18");
    expect(d.classList.contains("ui-metric-chip__delta--bad")).toBe(true);
  });

  it("shows no change as (±0), neither good nor bad", () => {
    const { container } = render(MetricChip, { props: { label: "conf", value: 58, previous: 58 } });
    const d = delta(container)!;
    expect(d.textContent).toContain("(±0)");
    expect(d.classList.contains("ui-metric-chip__delta--same")).toBe(true);
    expect(d.classList.contains("ui-metric-chip__delta--good")).toBe(false);
    expect(d.classList.contains("ui-metric-chip__delta--bad")).toBe(false);
    expect(d.querySelector(".ui-metric-chip__sr")!.textContent).toBe("unchanged");
  });

  it("flips the tone with lower-is-better, never the sign", () => {
    const { container } = render(MetricChip, {
      props: { label: "errores", value: 3, previous: 5, deltaPolarity: "lower-is-better" },
    });
    const d = delta(container)!;
    expect(d.textContent).toContain("(\u22122)");
    expect(d.classList.contains("ui-metric-chip__delta--good")).toBe(true);
  });

  it("speaks in the page's language with deltaLabels", () => {
    const { container } = render(MetricChip, {
      props: { label: "conf", value: 74, previous: 58, deltaLabels: { up: "sube {n}", down: "baja {n}", same: "igual" } },
    });
    expect(container.querySelector(".ui-metric-chip__sr")!.textContent).toBe("sube 16");
  });

  it("rounds away float noise", () => {
    const { container } = render(MetricChip, { props: { label: "x", value: 0.3, previous: 0.1 } });
    expect(delta(container)!.textContent).toContain("(+0.2)");
  });

  it("shows no delta unless both numbers are known", () => {
    for (const props of [
      { label: "x", value: 74, previous: null },
      { label: "x", value: null, previous: 58 },
      { label: "x", value: 74, previous: 58, state: "pending" as const },
      { label: "x", value: 74, previous: 58, state: "error" as const },
    ]) {
      const { container } = render(MetricChip, { props });
      expect(delta(container)).toBeNull();
    }
  });

  it("has no axe violations with a delta, plain and interactive", async () => {
    for (const interactive of [false, true]) {
      const { container } = render(MetricChip, { props: { label: "conf", value: 74, previous: 58, interactive } });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    }
  });
});
