import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import StatCard from "./StatCard.vue";

const css = readFileSync(join(process.cwd(), "src", "components", "stat-card", "stat-card.scss"), "utf8");

describe("StatCard (Vue)", () => {
  it("reads the label before the value, and shows the value on top", () => {
    const { container } = render(StatCard, { props: { value: "12 days", label: "Streak", hint: "best 20" } });
    const parts = [...container.querySelector(".ui-stat-card__text")!.children].map((c) => c.className);
    expect(parts).toEqual(["ui-stat-card__label", "ui-stat-card__value", "ui-stat-card__hint"]);
    expect(container.textContent).toBe("Streak12 daysbest 20");
    // On screen the value goes first and is the largest text.
    expect(css).toMatch(/\.ui-stat-card__value \{[^}]*order: 1;[^}]*font-size: var\(--ui-stat-card-value-size\)/);
    expect(css).toMatch(/\.ui-stat-card__label \{[^}]*order: 2;[^}]*font-size: var\(--ui-stat-card-label-size\)/);
  });

  it("the value token sizes dominate the label size", () => {
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    const rem = (name: string) => Number(new RegExp(`${name}:\\s*([\\d.]+)rem`).exec(tokens)?.[1]);
    for (const size of ["sm", "md", "lg"]) {
      // The label is --ui-font-size-sm (0.875rem): every value is at least 1.5× it.
      expect(rem(`--ui-stat-card-value-size-${size}`)).toBeGreaterThanOrEqual(0.875 * 1.5);
    }
  });

  it("shows the empty value as a dash", () => {
    const { container } = render(StatCard, { props: { label: "Level" } });
    expect(container.querySelector(".ui-stat-card__value")?.textContent).toBe("—");
  });

  it.each([
    ["up", "", "Up"],
    ["down", "", "Down"],
    ["flat", "", "No change"],
  ] as const)("trend %s says its direction in words", (trend, trendLabel, word) => {
    const { container } = render(StatCard, { props: { value: 3, label: "x", trend, trendLabel } });
    const t = container.querySelector(".ui-stat-card__trend")!;
    expect(t.querySelector("[aria-hidden='true']")?.textContent).toMatch(/[↑↓→]/);
    expect(t.textContent).toContain(word);
    expect(t.classList.contains(`ui-stat-card__trend--${trend}`)).toBe(true);
  });

  it("with a trend label, the direction word stays for screen readers only", () => {
    const { container } = render(StatCard, { props: { value: 3, label: "Practice", trend: "up", trendLabel: "+35 min" } });
    const sr = container.querySelector(".ui-stat-card__trend .ui-stat-card__sr");
    expect(sr?.textContent).toBe("Up, ");
    expect(container.querySelector(".ui-stat-card__trend")?.textContent).toContain("+35 min");
    const custom = render(StatCard, { props: { value: 3, label: "x", trend: "down", trendLabel: "−2", trendText: "Better" } });
    expect(custom.container.querySelector(".ui-stat-card__sr")?.textContent).toBe("Better, ");
  });

  it("paints the tone and size as classes", () => {
    const { container } = render(StatCard, { props: { value: 1, label: "x", tone: "success", size: "lg" } });
    const root = container.firstElementChild!;
    expect(root.classList.contains("ui-stat-card--success")).toBe(true);
    expect(root.classList.contains("ui-stat-card--lg")).toBe(true);
    expect(root.classList.contains("ui-stat-card--card")).toBe(true);
  });

  it("the icon is decorative", () => {
    const { container } = render(StatCard, { props: { value: 1, label: "x" }, slots: { icon: "<svg></svg>" } });
    expect(container.querySelector(".ui-stat-card__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("as a button: native, named by its content, activates with Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(StatCard, {
      props: { as: "button", value: 128, label: "Answer bank" },
      attrs: { onClick },
    });
    const button = screen.getByRole("button", { name: /Answer bank\s*128/ });
    expect(button.getAttribute("type")).toBe("button");
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("as a link carries the href; a disabled button cannot be pressed", async () => {
    render(StatCard, { props: { as: "a", href: "#history", value: 5, label: "History" } });
    expect(screen.getByRole("link", { name: /History/ }).getAttribute("href")).toBe("#history");
    render(StatCard, { props: { as: "button", disabled: true, value: 1, label: "Off" } });
    expect((screen.getByRole("button", { name: /Off/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("loading: a skeleton instead of the value, and aria-busy", () => {
    const { container } = render(StatCard, { props: { value: 9, label: "Marked", loading: true } });
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".ui-stat-card__skeleton")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".ui-stat-card__value")?.textContent).toBe("");
  });

  it("interactive: 44px minimum and the reduced-motion guard", () => {
    expect(css).toMatch(/\.ui-stat-card--interactive \{[^}]*min-height: var\(--ui-stat-card-interactive-min-height\)/);
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/transition: none/);
    expect(reduced).toMatch(/transform: none/);
    expect(reduced).toMatch(/animation: none/);
  });

  it.each([
    [{ value: "12 days", label: "Streak", trend: "up", trendLabel: "+2" }],
    [{ as: "button", value: 128, label: "Answer bank", hint: "Open" }],
    [{ as: "a", href: "#x", value: 3, label: "History", variant: "plain" }],
    [{ label: "Loading", loading: true }],
  ] as const)("has no axe violations (%o)", async (props) => {
    const { container } = render(StatCard, { props });
    expect(await axe(container)).toHaveNoViolations();
  });
});
