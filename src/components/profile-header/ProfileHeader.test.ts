import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ProfileHeader from "./ProfileHeader.vue";
import { UiStatCard } from "../stat-card";

const css = readFileSync(join(process.cwd(), "src", "components", "profile-header", "profile-header.scss"), "utf8");

describe("ProfileHeader (Vue)", () => {
  it("renders the name as a heading at the given level", async () => {
    const { rerender } = render(ProfileHeader, { props: { name: "Robert Ruben" } });
    expect(screen.getByRole("heading", { level: 2, name: "Robert Ruben" })).toBeTruthy();
    await rerender({ name: "Robert Ruben", headingLevel: 1 });
    expect(screen.getByRole("heading", { level: 1, name: "Robert Ruben" })).toBeTruthy();
  });

  it("shows an xl gradient avatar that does not repeat the name", () => {
    const { container } = render(ProfileHeader, { props: { name: "Robert Ruben" } });
    const avatar = container.querySelector(".ui-avatar")!;
    expect(avatar.classList.contains("ui-avatar--xl")).toBe(true);
    expect(avatar.classList.contains("ui-avatar--gradient")).toBe(true);
    expect(avatar.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders the subtitle prop or the slot", () => {
    render(ProfileHeader, { props: { name: "A", subtitle: "English B1" } });
    expect(screen.getByText("English B1")).toBeTruthy();
    const { container } = render(ProfileHeader, {
      props: { name: "B", subtitle: "ignored" },
      slots: { subtitle: "<span class='flag'>GB</span> English B1 · LanguageCert" },
    });
    expect(container.querySelector(".ui-profile-header__subtitle .flag")).toBeTruthy();
    expect(container.textContent).not.toContain("ignored");
  });

  it("passes the ring through to the avatar", () => {
    render(ProfileHeader, { props: { name: "A", ringValue: 68, ringLabel: "Level 7: 68%", ringGradient: true } });
    const ring = screen.getByRole("progressbar", { name: "Level 7: 68%" });
    expect(ring.getAttribute("aria-valuenow")).toBe("68");
  });

  it("groups the stats under a name, and the actions slot renders", () => {
    render(ProfileHeader, {
      props: { name: "A", statsLabel: "Your numbers" },
      slots: {
        actions: "<button type='button'>Edit</button>",
        stats: {
          components: { UiStatCard },
          template: `<UiStatCard size="sm" value="7" label="Level" /><UiStatCard size="sm" value="12" label="Streak" />`,
        },
      },
    });
    const group = screen.getByRole("group", { name: "Your numbers" });
    expect(group.querySelectorAll(".ui-stat-card--sm")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
  });

  it("omits the stats group and the actions when not given", () => {
    const { container } = render(ProfileHeader, { props: { name: "A" } });
    expect(container.querySelector(".ui-profile-header__stats")).toBeNull();
    expect(container.querySelector(".ui-profile-header__actions")).toBeNull();
  });

  it("card variant is a class", () => {
    const { container } = render(ProfileHeader, { props: { name: "A", variant: "card" } });
    expect(container.querySelector(".ui-profile-header--card")).toBeTruthy();
  });

  it("stacks by its own width under 26rem, with two stat columns", () => {
    expect(css).toMatch(/container: ui-profile-header \/ inline-size/);
    const narrow = css.slice(css.indexOf("@container ui-profile-header (max-width: 26rem)"));
    expect(narrow).toMatch(/\.ui-profile-header__identity \{[^}]*flex-direction: column/);
    expect(narrow).toMatch(/\.ui-profile-header__stats \{[^}]*repeat\(2, minmax\(0, 1fr\)\)/);
  });

  it("has no axe violations", async () => {
    const { container } = render(ProfileHeader, {
      props: { name: "Robert Ruben", subtitle: "English B1", ringValue: 40, ringLabel: "Level progress" },
      slots: {
        stats: { components: { UiStatCard }, template: `<UiStatCard size="sm" value="7" label="Level" />` },
      },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
