import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import Card from "./Card.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Card (Vue)", () => {
  it("projects default content", () => {
    render(Card, { slots: { default: "Body content" } });
    expect(screen.getByText("Body content")).toBeTruthy();
  });

  it("projects header and footer slots", () => {
    render(Card, {
      slots: { header: "Header", default: "Body", footer: "Footer" },
    });
    expect(screen.getByText("Header")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });

  it("does not render the header region when no header slot is provided", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(container.querySelector(".ui-card__header")).toBeNull();
  });

  it("does not render the footer region when no footer slot is provided", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(container.querySelector(".ui-card__footer")).toBeNull();
  });

  it("defaults to the elevated variant", () => {
    const { container } = render(Card, { slots: { default: "Body" } });
    expect(
      container.querySelector(".ui-card")?.classList.contains("ui-card--elevated"),
    ).toBe(true);
  });

  it("applies the variant class to the root", () => {
    const { container } = render(Card, {
      props: { variant: "outlined" },
      slots: { default: "Body" },
    });
    expect(
      container.querySelector(".ui-card")?.classList.contains("ui-card--outlined"),
    ).toBe(true);
  });

  it.each(["elevated", "outlined"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(Card, {
        props: { variant },
        slots: {
          header: "Title",
          default: "Content",
          footer: "Actions",
        },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  describe("interactive (0.6)", () => {
    const scss = readFileSync(join(process.cwd(), "src", "components", "card", "card.scss"), "utf8");
    const body = (selector: string) => {
      const at = scss.indexOf(`${selector} {`);
      if (at < 0) throw new Error(`no rule for ${selector}`);
      return scss.slice(at, scss.indexOf("}", at));
    };

    it("stays a plain div by default", () => {
      const { container } = render(Card, { slots: { default: "Body" } });
      const root = container.firstElementChild!;
      expect(root.tagName).toBe("DIV");
      expect(root.classList.contains("ui-card--interactive")).toBe(false);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it('as="button" is one native button named by its content, with span parts', async () => {
      const onClick = vi.fn();
      const { container } = render(Card, {
        props: { as: "button" },
        attrs: { onClick },
        slots: { header: "Writing", default: "Task 2 of 4" },
      });
      const button = screen.getByRole("button", { name: /Writing\s*Task 2 of 4/ });
      expect(button.getAttribute("type")).toBe("button");
      expect(button.classList.contains("ui-card--interactive")).toBe(true);
      // A <button> may only hold phrasing content.
      expect(container.querySelector(".ui-card div")).toBeNull();
      await fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('as="button" activates from the keyboard (Enter and Space)', async () => {
      const onClick = vi.fn();
      render(Card, { props: { as: "button" }, attrs: { onClick }, slots: { default: "Open" } });
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }));
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('as="button" disabled is a disabled button that does not fire', async () => {
      const onClick = vi.fn();
      render(Card, { props: { as: "button", disabled: true }, attrs: { onClick }, slots: { default: "Locked" } });
      const button = screen.getByRole("button", { name: "Locked" }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      await userEvent.setup().click(button).catch(() => undefined);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('as="a" is a link with its href', () => {
      render(Card, { props: { as: "a", href: "#speaking" }, slots: { default: "Speaking" } });
      const link = screen.getByRole("link", { name: "Speaking" });
      expect(link.getAttribute("href")).toBe("#speaking");
      expect(link.hasAttribute("type")).toBe(false);
    });

    it("has a 44px minimum, an outline focus ring and pressed/hover states", () => {
      expect(body(".ui-card--interactive")).toMatch(/min-height:\s*var\(--ui-card-interactive-min-height\)/);
      const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
      expect(tokens).toMatch(/--ui-card-interactive-min-height:\s*44px/);
      expect(body(".ui-card--interactive:focus-visible")).toMatch(
        /outline:\s*var\(--ui-focus-ring-width\)\s+solid\s+var\(--ui-focus-ring\)/,
      );
      expect(body(".ui-card--interactive:hover:not(:disabled)")).toMatch(/background-color/);
      expect(body(".ui-card--interactive:active:not(:disabled)")).toMatch(/transform/);
    });

    it.each(["button", "a"] as const)("has no axe violations (as=%s)", async (as) => {
      const { container } = render(Card, {
        props: { as, href: as === "a" ? "#x" : undefined },
        slots: { header: "Title", default: "Content", footer: "Meta" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });
  });
});
