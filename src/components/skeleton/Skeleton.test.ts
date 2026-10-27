import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Skeleton from "./Skeleton.vue";

const bones = (c: Element) => [...c.querySelectorAll<HTMLElement>(".ui-skeleton__bone")];

describe("Skeleton (Vue)", () => {
  it("announces what is loading once, as a status", () => {
    render(Skeleton, { props: { label: "Loading the profile" } });
    expect(screen.getByRole("status").textContent).toContain("Loading the profile");
  });

  it("is decorative with an empty label", () => {
    const { container } = render(Skeleton, { props: { label: "" } });
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws one bone per text line, the last one shorter", () => {
    const { container } = render(Skeleton, { props: { lines: 3 } });
    const b = bones(container);
    expect(b.length).toBe(3);
    expect(b[2].style.width).toBe("60%");
    expect(b[0].style.width).toBe("");
  });

  it("never draws fewer than one line", () => {
    const { container } = render(Skeleton, { props: { lines: 0 } });
    expect(bones(container).length).toBe(1);
  });

  it("draws a single block or circle whatever `lines` says", () => {
    const block = render(Skeleton, { props: { variant: "block", lines: 4, height: "6rem" } });
    expect(bones(block.container).length).toBe(1);
    expect(bones(block.container)[0].style.height).toBe("6rem");
    const circle = render(Skeleton, { props: { variant: "circle", lines: 4 } });
    const c = bones(circle.container)[0];
    expect(c.style.width).toBe("2.5rem");
    expect(c.style.height).toBe("2.5rem");
  });

  it("honours an explicit width", () => {
    const { container } = render(Skeleton, { props: { lines: 2, width: "12rem" } });
    expect(bones(container).every((b) => b.style.width === "12rem")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(Skeleton, { props: { lines: 2 } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
