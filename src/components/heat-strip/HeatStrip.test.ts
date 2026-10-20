import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import HeatStrip from "./HeatStrip.vue";

const axeOptions = { rules: { region: { enabled: false } } };

function levels(container: Element): number[] {
  return [...container.querySelectorAll(".ui-heat-strip__cell")].map((c) => {
    const m = /ui-heat-strip__cell--l(\d)/.exec(c.className);
    return m ? Number(m[1]) : 0;
  });
}

describe("HeatStrip (Vue)", () => {
  it("renders one cell per bucket", () => {
    const { container } = render(HeatStrip, {
      props: { values: [0, 1, 2, 3] },
    });
    expect(container.querySelectorAll(".ui-heat-strip__cell").length).toBe(4);
  });

  it("scales intensity against the busiest bucket", () => {
    const { container } = render(HeatStrip, {
      props: { values: [0, 1, 2, 4], levels: 4 },
    });
    expect(levels(container)).toEqual([0, 1, 2, 4]);
  });

  it("never renders a bucket with work in it as empty", () => {
    // Un 1 junto a un pico de 100 sigue siendo un commit: pintarlo como vacio
    // diria que esa hora no paso nada.
    const { container } = render(HeatStrip, {
      props: { values: [1, 100], levels: 4 },
    });
    expect(levels(container)[0]).toBe(1);
  });

  it("keeps every cell empty when nothing happened", () => {
    const { container } = render(HeatStrip, { props: { values: [0, 0, 0] } });
    expect(levels(container)).toEqual([0, 0, 0]);
  });

  it("never exceeds the level count", () => {
    const { container } = render(HeatStrip, {
      props: { values: [5, 5, 5], levels: 3 },
    });
    expect(Math.max(...levels(container))).toBe(3);
  });

  it("reports the total and the peak in the accessible name", () => {
    const { container } = render(HeatStrip, {
      props: { values: [1, 2, 3], label: "commits by hour" },
    });
    expect(
      container.querySelector(".ui-heat-strip")?.getAttribute("aria-label"),
    ).toBe("commits by hour: 6 across 3 buckets, peak 3");
  });

  it("titles each bucket with the caller's own naming", () => {
    const { container } = render(HeatStrip, {
      props: {
        values: [0, 7],
        bucketLabel: (h: number, n: number) => `${h}h — ${n}`,
      },
    });
    const cells = container.querySelectorAll(".ui-heat-strip__cell");
    expect(cells[1].getAttribute("title")).toBe("1h — 7");
  });

  it("hides the cells from assistive tech, since the name already says it", () => {
    const { container } = render(HeatStrip, { props: { values: [1] } });
    expect(
      container.querySelector(".ui-heat-strip__cell")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(HeatStrip, {
      props: { values: [0, 3, 9], label: "commits by hour", legend: "00 · 23" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
