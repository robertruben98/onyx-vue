import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Button from "./Button.vue";

describe("Button (Vue)", () => {
  it("renders the default slot label", () => {
    render(Button, { slots: { default: "Save" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("emits clicked when interactive", async () => {
    const { emitted } = render(Button, { slots: { default: "Go" } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeTruthy();
  });

  it("does not emit clicked when disabled", async () => {
    const { emitted } = render(Button, {
      props: { disabled: true },
      slots: { default: "Go" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it("does not emit clicked when loading", async () => {
    const { emitted } = render(Button, {
      props: { loading: true },
      slots: { default: "Go" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it.each([
    ["primary", "ui-button--primary"],
    ["secondary", "ui-button--secondary"],
    ["danger", "ui-button--danger"],
    ["text", "ui-button--text"],
  ])("puts the %s variant class on the root", (variant, clase) => {
    const { container } = render(Button, {
      props: { variant: variant as "primary" },
      slots: { default: "Go" },
    });
    expect(container.querySelector(`.${clase}`)).toBeTruthy();
  });

  // Una variante destructiva que sigue emitiendo `clicked` cuando esta
  // deshabilitada es peor que no tenerla: el boton rojo es justo el que no
  // debe dispararse por accidente.
  it("does not emit clicked when the danger variant is disabled", async () => {
    const { emitted } = render(Button, {
      props: { variant: "danger", disabled: true },
      slots: { default: "Parar" },
    });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().clicked).toBeFalsy();
  });

  it("marks the button aria-busy when loading", () => {
    render(Button, { props: { loading: true }, slots: { default: "Go" } });
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  });

  describe("block, wrap and icons (0.6)", () => {
    const scss = readFileSync(join(process.cwd(), "src", "components", "button", "button.scss"), "utf8");
    const body = (selector: string) => {
      const at = scss.indexOf(`${selector} {`);
      if (at < 0) throw new Error(`no rule for ${selector}`);
      return scss.slice(at, scss.indexOf("}", at));
    };

    it("keeps the old shape by default: no block, no wrap, no icon boxes", () => {
      const { container } = render(Button, { slots: { default: "Go" } });
      const root = container.querySelector(".ui-button")!;
      expect(root.classList.contains("ui-button--block")).toBe(false);
      expect(root.classList.contains("ui-button--wrap")).toBe(false);
      expect(container.querySelector(".ui-button__icon")).toBeNull();
    });

    it("block puts the full-width class on the root", () => {
      const { container } = render(Button, { props: { block: true }, slots: { default: "Go" } });
      expect(container.querySelector(".ui-button.ui-button--block")).toBeTruthy();
    });

    it("block fills the container in the stylesheet", () => {
      expect(body(".ui-button--block")).toMatch(/width:\s*100%/);
      expect(body(".ui-button--block .ui-button__el")).toMatch(/width:\s*100%/);
    });

    it("wrap turns the fixed height into a minimum, per size", () => {
      const { container } = render(Button, { props: { wrap: true }, slots: { default: "A long label" } });
      expect(container.querySelector(".ui-button--wrap")).toBeTruthy();
      const el = body(".ui-button--wrap .ui-button__el");
      expect(el).toMatch(/height:\s*auto/);
      expect(el).toMatch(/min-height:\s*var\(--ui-button-height\)/);
      expect(el).toMatch(/white-space:\s*normal/);
      expect(body(".ui-button--wrap.ui-button--sm .ui-button__el")).toMatch(/min-height:\s*var\(--ui-button-height-sm\)/);
      expect(body(".ui-button--wrap.ui-button--lg .ui-button__el")).toMatch(/min-height:\s*var\(--ui-button-height-lg\)/);
    });

    it("renders leading and trailing icons around the label, hidden from the accessible name", () => {
      const { container } = render(Button, {
        slots: { default: "Start", leading: "<svg data-test='lead'></svg>", trailing: "<svg data-test='trail'></svg>" },
      });
      const parts = [...container.querySelector(".ui-button__el")!.children].map((c) => c.className);
      expect(parts).toEqual([
        "ui-button__icon ui-button__icon--leading",
        "ui-button__label",
        "ui-button__icon ui-button__icon--trailing",
      ]);
      for (const icon of container.querySelectorAll(".ui-button__icon")) expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    });

    it("shows the spinner instead of the leading icon while loading", () => {
      const { container } = render(Button, {
        props: { loading: true },
        slots: { default: "Start", leading: "<svg></svg>" },
      });
      expect(container.querySelector(".ui-button__spinner")).toBeTruthy();
      expect(container.querySelector(".ui-button__icon--leading")).toBeNull();
    });

    it("has no axe violations with icons, block and wrap", async () => {
      const { container } = render(Button, {
        props: { block: true, wrap: true },
        slots: { default: "Create my exercise", leading: "<svg></svg>" },
      });
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(Button, { slots: { default: "Save" } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
