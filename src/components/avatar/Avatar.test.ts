import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Avatar from "./Avatar.vue";

describe("Avatar (Vue)", () => {
  it("renders an image with the name as alt text", () => {
    render(Avatar, {
      props: { src: "https://example.com/a.png", name: "Ada Lovelace" },
    });
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img.getAttribute("src")).toBe("https://example.com/a.png");
  });

  it("falls back to initials when there is no image", () => {
    render(Avatar, { props: { name: "Ada Lovelace" } });
    const el = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(el.textContent).toContain("AL");
  });

  it("derives a single initial from a one-word name", () => {
    render(Avatar, { props: { name: "Grace" } });
    expect(
      screen.getByRole("img", { name: "Grace" }).textContent,
    ).toContain("G");
  });

  it("shows initials after the image errors", async () => {
    const { container } = render(Avatar, {
      props: { src: "broken.png", name: "Ada Lovelace" },
    });
    const img = container.querySelector("img")!;
    await fireEvent(img, new Event("error"));
    expect(await screen.findByText("AL")).toBeTruthy();
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = render(Avatar, {
        props: { size, name: "Ada Lovelace" },
      });
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
