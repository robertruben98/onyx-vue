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
