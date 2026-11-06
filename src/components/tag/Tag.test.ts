import { readFileSync } from "node:fs";
import { join } from "node:path";
import { nextTick } from "vue";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Tag from "./Tag.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Tag (Vue)", () => {
  it("projects its content", () => {
    render(Tag, { slots: { default: "Frontend" } });
    expect(screen.getByText("Frontend")).toBeTruthy();
  });

  it("draws an outline instead of a fill when asked", () => {
    const { container } = render(Tag, {
      props: { variant: "warning", appearance: "outline" },
      slots: { default: "draft" },
    });
    const el = container.querySelector(".ui-tag") as HTMLElement;
    expect(el.classList.contains("ui-tag--outline")).toBe(true);
    expect(el.classList.contains("ui-tag--warning")).toBe(true);
  });

  it("has no remove button unless removable", () => {
    render(Tag, { slots: { default: "Tag" } });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("emits removed when the remove button is clicked", async () => {
    const { emitted } = render(Tag, {
      props: { removable: true, removeLabel: "Quitar" },
      slots: { default: "Tag" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /quitar/i }));
    expect(emitted().removed).toBeTruthy();
    expect(emitted().removed!.length).toBe(1);
  });

  it("remove button is keyboard operable", async () => {
    const { emitted } = render(Tag, {
      props: { removable: true },
      slots: { default: "Tag" },
    });
    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
    await fireEvent.keyDown(button, { key: "Enter" });
    // Native button activates on Enter via click; simulate the resulting click.
    await fireEvent.click(button);
    expect(emitted().removed).toBeTruthy();
  });

  it.each(["neutral", "muted", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(Tag, {
        props: { variant, removable: true },
        slots: { default: "Tag" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("applies the muted variant class on the root", () => {
    const { container } = render(Tag, {
      props: { variant: "muted" },
      slots: { default: "draft" },
    });
    expect(
      container.querySelector(".ui-tag")?.classList.contains("ui-tag--muted"),
    ).toBe(true);
  });

  it("still defaults to neutral, which muted does not replace", () => {
    const { container } = render(Tag, { slots: { default: "label" } });
    expect(
      container.querySelector(".ui-tag")?.classList.contains("ui-tag--neutral"),
    ).toBe(true);
  });
});

describe("Tag: no-wrap, truncation and status icon (#144)", () => {
  const css = readFileSync(join(process.cwd(), "src", "components", "tag", "tag.scss"), "utf8");
  const rule = (selector: string) => {
    const at = css.indexOf(`${selector} {`);
    return at < 0 ? "" : css.slice(at, css.indexOf("}", at));
  };

  it("keeps the label on one line unless wrap is set", () => {
    expect(rule(".ui-tag")).toMatch(/white-space:\s*nowrap/);
    expect(rule(".ui-tag--wrap")).toMatch(/white-space:\s*normal/);
    const { container } = render(Tag, { props: { wrap: true }, slots: { default: "vieja" } });
    expect(container.querySelector(".ui-tag")!.classList.contains("ui-tag--wrap")).toBe(true);
  });

  it("caps the width, ellipsises the label and shows the full text as tooltip", async () => {
    const label = "capataz: sin juicio (treew-inc/supervision-api-payment)";
    const { container } = render(Tag, { props: { maxWidth: "12ch" }, slots: { default: label } });
    // El label se lee del DOM al montar; el title llega en el siguiente tick.
    await nextTick();
    const el = container.querySelector(".ui-tag") as HTMLElement;
    expect(el.style.maxWidth).toBe("12ch");
    expect(el.classList.contains("ui-tag--truncate")).toBe(true);
    expect(el.getAttribute("title")).toBe(label);
    // El texto completo sigue en el DOM: el nombre accesible no se corta.
    expect(el.textContent).toContain(label);
    expect(rule(".ui-tag--truncate .ui-tag__label")).toMatch(/text-overflow:\s*ellipsis/);
  });

  it("has no tooltip when it does not truncate, and an explicit title wins", () => {
    const plain = render(Tag, { slots: { default: "ok" } });
    expect(plain.container.querySelector(".ui-tag")!.hasAttribute("title")).toBe(false);
    const titled = render(Tag, { props: { maxWidth: "4ch", title: "Full" }, slots: { default: "long text" } });
    expect(titled.container.querySelector(".ui-tag")!.getAttribute("title")).toBe("Full");
  });

  it.each([
    ["danger", "✕"],
    ["warning", "⚠"],
    ["success", "✓"],
    ["info", "ℹ"],
  ] as const)("show-icon renders the %s glyph, hidden from assistive tech", (variant, glyph) => {
    const { container } = render(Tag, { props: { variant, showIcon: true }, slots: { default: "x" } });
    const icon = container.querySelector(".ui-tag__icon") as HTMLElement;
    expect(icon.textContent).toBe(glyph);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders no icon by default, nor for neutral and muted", () => {
    expect(render(Tag, { props: { variant: "danger" }, slots: { default: "x" } }).container.querySelector(".ui-tag__icon")).toBeNull();
    expect(render(Tag, { props: { variant: "muted", showIcon: true }, slots: { default: "x" } }).container.querySelector(".ui-tag__icon")).toBeNull();
  });

  it("the icon slot replaces the glyph", () => {
    const { container } = render(Tag, { slots: { default: "x", icon: "<b>★</b>" } });
    expect(container.querySelector(".ui-tag__icon b")!.textContent).toBe("★");
  });

  it.each(["neutral", "muted", "info", "success", "warning", "danger"] as const)(
    "has no axe violations with icon and truncation (%s)",
    async (variant) => {
      const { container } = render(Tag, {
        props: { variant, showIcon: true, maxWidth: "6ch", removable: true },
        slots: { default: "a rather long tag" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});

describe("Tag mono flag", () => {
  it("adds the mono modifier only when asked", () => {
    const a = render(Tag, { props: { mono: true }, slots: { default: "a1b2c3" } });
    expect(a.container.querySelector(".ui-tag")!.classList.contains("ui-tag--mono")).toBe(true);
    const b = render(Tag, { slots: { default: "plain" } });
    expect(b.container.querySelector(".ui-tag")!.classList.contains("ui-tag--mono")).toBe(false);
  });
});
