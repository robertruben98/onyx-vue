import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Avatar, { avatarGradientIndex } from "./Avatar.vue";

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

describe("Avatar (Vue) — 0.8: xl, alt, gradient, ring", () => {
  it("has an xl size", () => {
    const { container } = render(Avatar, { props: { name: "Ada", size: "xl" } });
    expect(container.querySelector(".ui-avatar--xl")).toBeTruthy();
  });

  it("uses alt for the image and the initials, and is decorative with an empty name", () => {
    render(Avatar, { props: { src: "a.png", name: "Ada Lovelace", alt: "Ada, at her desk" } });
    expect(screen.getByRole("img", { name: "Ada, at her desk" })).toBeTruthy();
    const { container } = render(Avatar, { props: { name: "Ada Lovelace", alt: "" } });
    const el = container.querySelector(".ui-avatar")!;
    expect(el.getAttribute("role")).toBeNull();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("a new src gets its own chance after an error", async () => {
    const { container, rerender } = render(Avatar, { props: { src: "broken.png", name: "Ada Lovelace" } });
    await fireEvent(container.querySelector("img")!, new Event("error"));
    expect(container.querySelector("img")).toBeNull();
    await rerender({ src: "ok.png", name: "Ada Lovelace" });
    expect(container.querySelector("img")?.getAttribute("src")).toBe("ok.png");
  });

  it("gradient: the same name always gets the same of eight gradients", () => {
    expect(avatarGradientIndex("Ada Lovelace")).toBe(avatarGradientIndex("  ada lovelace "));
    const seen = new Set(["Ada", "Grace", "Alan", "Robert", "Kari", "Ola", "Nils", "Ingrid", "Mia", "Leo"].map(avatarGradientIndex));
    for (const i of seen) expect(i).toBeGreaterThanOrEqual(1), expect(i).toBeLessThanOrEqual(8);
    expect(seen.size).toBeGreaterThan(3);
    const { container } = render(Avatar, { props: { name: "Ada Lovelace", gradient: true } });
    const el = container.querySelector(".ui-avatar")!;
    expect(el.classList.contains("ui-avatar--gradient")).toBe(true);
    expect(el.classList.contains(`ui-avatar--gradient-${avatarGradientIndex("Ada Lovelace")}`)).toBe(true);
  });

  it("gradient does not paint behind a loaded image", () => {
    const { container } = render(Avatar, { props: { src: "a.png", name: "Ada", gradient: true } });
    expect(container.querySelector(".ui-avatar--gradient")).toBeNull();
  });

  it("draws no ring by default", () => {
    const { container } = render(Avatar, { props: { name: "Ada" } });
    expect(container.querySelector(".ui-avatar-ring")).toBeNull();
    expect(container.firstElementChild?.classList.contains("ui-avatar")).toBe(true);
  });

  it("a ring is decorative without a label", () => {
    const { container } = render(Avatar, { props: { name: "Ada Lovelace", ringValue: 30 } });
    expect(container.querySelector(".ui-avatar-ring__meter")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".ui-ring__arc")?.getAttribute("stroke-dashoffset")).toBe("70");
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeTruthy();
  });

  it("a labelled ring is a progressbar beside the avatar, with tone and max", () => {
    const { container } = render(Avatar, {
      props: { name: "Ada Lovelace", size: "xl", ringValue: 3, ringMax: 4, ringTone: "success", ringLabel: "3 of 4 lessons" },
    });
    const bar = screen.getByRole("progressbar", { name: "3 of 4 lessons" });
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect(container.querySelector(".ui-ring--success")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeTruthy();
  });

  it.each([
    [{ name: "Ada Lovelace", size: "xl", gradient: true }],
    [{ name: "Ada Lovelace", ringValue: 50, ringLabel: "Level" }],
    [{ name: "Ada Lovelace", ringValue: 50, ringGradient: true }],
  ] as const)("has no axe violations (%o)", async (props) => {
    const { container } = render(Avatar, { props });
    expect(await axe(container)).toHaveNoViolations();
  });
});
