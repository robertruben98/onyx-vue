import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import Stack from "./Stack.vue";

describe("Stack (Vue)", () => {
  it("renders a vertical stack with the default gap", () => {
    const { container } = render(Stack, { slots: { default: "<p>a</p><p>b</p>" } });
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root.classList.contains("ui-stack--vertical")).toBe(true);
    expect(root.style.getPropertyValue("--ui-stack-gap")).toBe("var(--ui-space-3)");
    expect(root.querySelectorAll("p").length).toBe(2);
  });

  it("maps direction, alignment, justification and wrap to classes", () => {
    const { container } = render(Stack, {
      props: { direction: "horizontal", align: "center", justify: "between", wrap: true },
    });
    const cls = (container.firstElementChild as HTMLElement).classList;
    expect(cls.contains("ui-stack--horizontal")).toBe(true);
    expect(cls.contains("ui-stack--align-center")).toBe(true);
    expect(cls.contains("ui-stack--justify-between")).toBe(true);
    expect(cls.contains("ui-stack--wrap")).toBe(true);
  });

  it("uses a step of the spacing scale, and 0 for no gap", () => {
    const a = render(Stack, { props: { gap: 6 } }).container.firstElementChild as HTMLElement;
    expect(a.style.getPropertyValue("--ui-stack-gap")).toBe("var(--ui-space-6)");
    const b = render(Stack, { props: { gap: 0 } }).container.firstElementChild as HTMLElement;
    expect(b.style.getPropertyValue("--ui-stack-gap")).toBe("0");
  });

  it("renders the element given in `as`", () => {
    const { container } = render(Stack, { props: { as: "ul" }, slots: { default: "<li>x</li>" } });
    expect(container.firstElementChild?.tagName).toBe("UL");
  });

  it("has no axe violations", async () => {
    const { container } = render(Stack, { slots: { default: "<button>Save</button>" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
