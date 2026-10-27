import { fireEvent, render } from "@testing-library/vue";
import { axe } from "jest-axe";
import MediaCard from "./MediaCard.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("MediaCard (Vue)", () => {
  it("shows the image lazily, named by the title", () => {
    const { getByRole } = render(MediaCard, { props: { title: "Red River", src: "poster.jpg" } });
    const img = getByRole("img", { name: "Red River" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("puts the image in a box of the given ratio", () => {
    const { container } = render(MediaCard, { props: { title: "x", ratio: "16 / 9" } });
    expect((container.querySelector(".ui-media-card__media") as HTMLElement).style.aspectRatio).toBe("16 / 9");
  });

  it("draws the title's initials when there is no image", () => {
    const { container, getByRole } = render(MediaCard, { props: { title: "Mission: Yozakura Family" } });
    expect(container.querySelector("img")).toBeNull();
    expect(getByRole("img", { name: "Mission: Yozakura Family" }).textContent).toBe("MY");
    expect(container.querySelector("[class*='ui-media-card__placeholder--gradient-']")).not.toBeNull();
  });

  it("falls back to the initials when the image fails, and retries a new one", async () => {
    const { container, rerender } = render(MediaCard, { props: { title: "One Piece", src: "broken.jpg" } });
    await fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".ui-media-card__placeholder")!.textContent).toBe("OP");
    await rerender({ title: "One Piece", src: "fixed.jpg" });
    expect(container.querySelector("img")!.getAttribute("src")).toBe("fixed.jpg");
  });

  it("an empty alt makes the image decorative", () => {
    const { container } = render(MediaCard, { props: { title: "x", alt: "" } });
    expect(container.querySelector(".ui-media-card__placeholder")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("makes the title a heading, and a link when given href", () => {
    const { getByRole } = render(MediaCard, {
      props: { title: "Red River", href: "https://anilist.co/anime/1", target: "_blank", titleTag: "h4" },
    });
    expect(getByRole("heading", { level: 4, name: "Red River" })).toBeTruthy();
    const link = getByRole("link", { name: "Red River" });
    expect(link.getAttribute("href")).toBe("https://anilist.co/anime/1");
    expect(link.getAttribute("rel")).toBe("noopener");
  });

  it("renders the subtitle, details, badges and actions only when given", () => {
    const bare = render(MediaCard, { props: { title: "x" } });
    for (const part of ["subtitle", "details", "badges", "actions"]) {
      expect(bare.container.querySelector(`.ui-media-card__${part}`)).toBeNull();
    }
    const full = render(MediaCard, {
      props: { title: "y", subtitle: "sub" },
      slots: { default: "E5 · Sat", badges: "<span>new</span>", actions: "<button>Get</button>" },
    });
    expect(full.container.querySelector(".ui-media-card__subtitle")!.textContent).toBe("sub");
    expect(full.container.querySelector(".ui-media-card__details")!.textContent).toBe("E5 · Sat");
    expect(full.container.querySelector(".ui-media-card__badges")!.textContent).toBe("new");
    expect(full.getByRole("button", { name: "Get" })).toBeTruthy();
  });

  it("zooms on hover by default, and not when zoom is off", () => {
    const on = render(MediaCard, { props: { title: "x" } });
    expect(on.container.querySelector(".ui-media-card")!.classList.contains("ui-media-card--zoom")).toBe(true);
    const off = render(MediaCard, { props: { title: "y", zoom: false } });
    expect(off.container.querySelector(".ui-media-card")!.classList.contains("ui-media-card--zoom")).toBe(false);
  });

  it("has no axe violations", async () => {
    const { container } = render(MediaCard, {
      props: { title: "Red River", subtitle: "Sora wa Akai Kawa no Hotori", src: "p.jpg", href: "#" },
      slots: { default: "E17 · Tue", actions: "<button>Follow</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
