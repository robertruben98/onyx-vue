import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import DescriptionList from "./DescriptionList.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const items = [
  { term: "puerto", value: 8000 },
  { term: "directorio", value: "/home/x/api", title: "/home/x/api" },
  { term: "rama", value: "", tone: "warning" as const },
];

describe("DescriptionList (Vue)", () => {
  it("renders a real definition list", () => {
    const { container } = render(DescriptionList, { props: { items } });
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(container.querySelectorAll("dd")).toHaveLength(3);
    expect(screen.getByText("8000")).toBeTruthy();
  });

  it("shows an em dash for an empty value", () => {
    const { container } = render(DescriptionList, { props: { items } });
    expect(container.querySelectorAll("dd")[2].textContent?.trim()).toBe("—");
  });

  it("carries the tone and the tooltip on the value", () => {
    const { container } = render(DescriptionList, { props: { items } });
    const dds = container.querySelectorAll("dd");
    expect(dds[2].classList.contains("ui-description-list__value--warning")).toBe(true);
    expect(dds[1].getAttribute("title")).toBe("/home/x/api");
  });

  it("lets a slot override one value", () => {
    render(DescriptionList, {
      props: { items },
      slots: { "value-rama": "<a href='#'>main</a>" },
    });
    expect(screen.getByRole("link", { name: "main" })).toBeTruthy();
  });

  it("fixes the column count when asked", () => {
    const { container } = render(DescriptionList, { props: { items, columns: 4 } });
    const dl = container.querySelector("dl") as HTMLElement;
    expect(dl.classList.contains("ui-description-list--fixed")).toBe(true);
    expect(dl.style.getPropertyValue("--ui-description-list-columns")).toBe("4");
  });

  it("has no axe violations", async () => {
    const { container } = render(DescriptionList, { props: { items } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("DescriptionList (Vue) — tone vocabulary", () => {
  it("paints neutral, default and no tone the same, and keeps the other tones", () => {
    const { container } = render(DescriptionList, {
      props: {
        items: [
          { term: "a", value: 1, tone: "neutral" },
          { term: "b", value: 2, tone: "default" },
          { term: "c", value: 3 },
          { term: "d", value: 4, tone: "warning" },
        ],
      },
    });
    const classes = [...container.querySelectorAll(".ui-description-list__value")].map((v) => v.className);
    expect(classes[0]).toBe(classes[1]);
    expect(classes[1]).toBe(classes[2]);
    expect(classes[3]).toContain("ui-description-list__value--warning");
  });
});

describe("DescriptionList (Vue) — 0.8: emphasis and inline", () => {
  const css = readFileSync(join(process.cwd(), "src", "components", "description-list", "description-list.scss"), "utf8");

  it("adds no class by default", () => {
    const { container } = render(DescriptionList, { props: { items } });
    const dl = container.querySelector("dl")!;
    expect(dl.classList.contains("ui-description-list--emphasis")).toBe(false);
    expect(dl.classList.contains("ui-description-list--inline")).toBe(false);
  });

  it("emphasis and inline are classes, and the dl keeps its pairs", () => {
    const { container } = render(DescriptionList, { props: { items, variant: "emphasis", layout: "inline" } });
    const dl = container.querySelector("dl")!;
    expect(dl.classList.contains("ui-description-list--emphasis")).toBe(true);
    expect(dl.classList.contains("ui-description-list--inline")).toBe(true);
    expect(dl.querySelectorAll("dt")).toHaveLength(3);
    expect(dl.querySelectorAll("dd")).toHaveLength(3);
  });

  it("emphasis: the term in normal case, the value larger in the text colour", () => {
    expect(css).toMatch(/\.ui-description-list--emphasis \.ui-description-list__term \{[^}]*text-transform: none/);
    expect(css).toMatch(/\.ui-description-list--emphasis \.ui-description-list__value \{[^}]*font-size: var\(--ui-description-list-emphasis-value-size\)/);
    expect(css).toMatch(/\.ui-description-list--emphasis \.ui-description-list__value--default \{[^}]*color: var\(--ui-color-text\)/);
  });

  it("inline: one wrapping line with a colon after the term", () => {
    expect(css).toMatch(/\.ui-description-list--inline \.ui-description-list__pair \{[^}]*display: flex;[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.ui-description-list--inline \.ui-description-list__term::after \{[^}]*content: ":"/);
  });

  it("has no axe violations (emphasis, inline)", async () => {
    const { container } = render(DescriptionList, { props: { items, variant: "emphasis", layout: "inline" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
