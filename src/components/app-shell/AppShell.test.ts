import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import AppShell from "./AppShell.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const slots = {
  rail: "<nav aria-label='pages'><a href='#/'>home</a></nav>",
  default: "<main><h1>content</h1></main>",
};

describe("AppShell (Vue)", () => {
  it("renders the rail as a named complementary landmark", () => {
    render(AppShell, { props: { label: "Agents" }, slots });
    expect(screen.getByRole("complementary", { name: "Agents" })).toBeTruthy();
  });

  it("renders the content next to the rail", () => {
    render(AppShell, { slots });
    expect(screen.getByRole("heading", { name: "content" })).toBeTruthy();
  });

  it("drops the rail element when nothing is passed for it", () => {
    render(AppShell, { slots: { default: "<p>only content</p>" } });
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("never lets the rail scroll sideways", () => {
    // El nombre largo de una entrada se trunca dentro de ella; una barra de
    // scroll horizontal en el rail es lo que se veia en /prs/ antes.
    const css = readFileSync(join(process.cwd(), "src/components/app-shell/app-shell.scss"), "utf8");
    expect(css).toMatch(/\.ui-app-shell__rail\s*\{[^}]*overflow-x:\s*hidden/);
  });

  it("has no axe violations", async () => {
    const { container } = render(AppShell, { props: { label: "Agents" }, slots });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
