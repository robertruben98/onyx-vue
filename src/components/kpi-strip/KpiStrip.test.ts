import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import KpiStrip from "./KpiStrip.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const items = [
  { label: "runs", value: 42, sub: "14 dias" },
  { label: "actuado", value: 12, tone: "success" as const },
  { label: "fallos", value: 3, tone: "danger" as const, title: "runs con error" },
];

describe("KpiStrip (Vue)", () => {
  it("is a named list with one item per figure", () => {
    render(KpiStrip, { props: { items, label: "Flota" } });
    const list = screen.getByRole("list", { name: "Flota" });
    expect(list.querySelectorAll("li")).toHaveLength(3);
  });

  it("puts the label before the value in reading order", () => {
    const { container } = render(KpiStrip, { props: { items } });
    const first = container.querySelector("li") as HTMLElement;
    const parts = [...first.children].map((c) => c.textContent?.trim());
    expect(parts).toEqual(["runs", "42", "14 dias"]);
  });

  it("carries tone and tooltip", () => {
    const { container } = render(KpiStrip, { props: { items } });
    const cells = container.querySelectorAll("li");
    expect(cells[2].getAttribute("title")).toBe("runs con error");
    expect(cells[2].querySelector(".ui-kpi-strip__value--danger")).toBeTruthy();
  });

  it("uses one column per item unless told otherwise", async () => {
    const { container, rerender } = render(KpiStrip, { props: { items } });
    const ul = container.querySelector("ul") as HTMLElement;
    expect(ul.style.getPropertyValue("--ui-kpi-strip-columns")).toBe("3");
    await rerender({ items, columns: 5 });
    expect(ul.style.getPropertyValue("--ui-kpi-strip-columns")).toBe("5");
  });

  it("lets a slot render a value", () => {
    render(KpiStrip, { props: { items }, slots: { "item-0": "<a href='#'>42</a>" } });
    expect(screen.getByRole("link", { name: "42" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(KpiStrip, { props: { items } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("KpiStrip (Vue) — tone vocabulary", () => {
  it("paints neutral, default and no tone the same, and keeps the other tones", () => {
    const { container } = render(KpiStrip, {
      props: {
        items: [
          { label: "a", value: 1, tone: "neutral" },
          { label: "b", value: 2, tone: "default" },
          { label: "c", value: 3 },
          { label: "d", value: 4, tone: "danger" },
        ],
      },
    });
    const classes = [...container.querySelectorAll(".ui-kpi-strip__value")].map((v) => v.className);
    expect(classes[0]).toBe(classes[1]);
    expect(classes[1]).toBe(classes[2]);
    expect(classes[0]).toContain("ui-kpi-strip__value--default");
    expect(classes[3]).toContain("ui-kpi-strip__value--danger");
  });
});

describe("KpiStrip (Vue) — 0.8: size, variant, icon, hint", () => {
  it("keeps the bordered cells and normal size by default", () => {
    const { container } = render(KpiStrip, { props: { items } });
    const ul = container.querySelector("ul")!;
    expect(ul.className).toBe("ui-kpi-strip");
  });

  it("lg and plain are classes", () => {
    const { container } = render(KpiStrip, { props: { items, size: "lg", variant: "plain" } });
    const ul = container.querySelector("ul")!;
    expect(ul.classList.contains("ui-kpi-strip--lg")).toBe(true);
    expect(ul.classList.contains("ui-kpi-strip--plain")).toBe(true);
  });

  it("shows a hint under the label (hint wins over sub)", () => {
    const { container } = render(KpiStrip, {
      props: { items: [{ label: "Level", value: 7, hint: "2,340 XP" }, { label: "b", value: 1, sub: "old", hint: "new" }] },
    });
    const subs = [...container.querySelectorAll(".ui-kpi-strip__sub")].map((e) => e.textContent);
    expect(subs).toEqual(["2,340 XP", "new"]);
  });

  it("renders a decorative icon per item from its slot, only where given", () => {
    const { container } = render(KpiStrip, { props: { items }, slots: { "icon-1": "<svg class='fire'></svg>" } });
    const icons = container.querySelectorAll(".ui-kpi-strip__icon");
    expect(icons).toHaveLength(1);
    expect(icons[0].getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll("li")[1].querySelector(".fire")).toBeTruthy();
  });

  it("plain drops the shared rules and the tiny uppercase label", () => {
    const css = readFileSync(join(process.cwd(), "src", "components", "kpi-strip", "kpi-strip.scss"), "utf8");
    expect(css).toMatch(/\.ui-kpi-strip--plain \{[^}]*border: 0/);
    expect(css).toMatch(/\.ui-kpi-strip--plain \.ui-kpi-strip__label \{[^}]*text-transform: none/);
    expect(css).toMatch(/\.ui-kpi-strip--lg \.ui-kpi-strip__value \{[^}]*font-size: var\(--ui-kpi-strip-value-size-lg\)/);
  });

  it("has no axe violations (lg, plain, icon)", async () => {
    const { container } = render(KpiStrip, { props: { items, size: "lg", variant: "plain" }, slots: { "icon-0": "<svg></svg>" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
