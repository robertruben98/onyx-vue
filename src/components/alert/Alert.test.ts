import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Alert from "./Alert.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Alert (Vue)", () => {
  it("projects content and renders the title", () => {
    render(Alert, {
      props: { title: "Heads up" },
      slots: { default: "Something happened" },
    });
    expect(screen.getByText("Heads up")).toBeTruthy();
    expect(screen.getByText("Something happened")).toBeTruthy();
  });

  it("uses role=status for non-danger variants", () => {
    render(Alert, { props: { variant: "info" }, slots: { default: "Info" } });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("uses role=alert for the danger variant", () => {
    render(Alert, { props: { variant: "danger" }, slots: { default: "Error" } });
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("has no dismiss button unless dismissible", () => {
    render(Alert, { props: { variant: "info" }, slots: { default: "Info" } });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("emits dismissed and hides the host when dismissed", async () => {
    const { emitted, container } = render(Alert, {
      props: { variant: "info", dismissible: true, dismissLabel: "Cerrar" },
      slots: { default: "Info" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(emitted().dismissed).toBeTruthy();
    expect(emitted().dismissed).toHaveLength(1);
    expect(container.querySelector(".ui-alert")?.hasAttribute("hidden")).toBe(
      true,
    );
  });

  it("dismiss button is keyboard operable", async () => {
    const { emitted } = render(Alert, {
      props: { variant: "info", dismissible: true },
      slots: { default: "Info" },
    });
    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
    await fireEvent.keyDown(button, { key: "Enter" });
    // native <button> activates on Enter -> click
    await fireEvent.click(button);
    expect(emitted().dismissed).toBeTruthy();
  });

  it.each(
    (["neutral", "info", "success", "warning", "danger"] as const).flatMap(
      (variant) =>
        (["boxed", "band"] as const).map(
          (appearance) => [variant, appearance] as const,
        ),
    ),
  )("has no axe violations (%s, %s)", async (variant, appearance) => {
    const { container } = render(Alert, {
      props: { variant, appearance, title: "Title", dismissible: true },
      slots: { default: "Body" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("is boxed by default, so nothing that exists today moves", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(false);
    expect(root.classList.contains("ui-alert--boxed")).toBe(true);
  });

  it("applies the band appearance", () => {
    const { container } = render(Alert, {
      props: { appearance: "band" },
      slots: { default: "Mensaje" },
    });
    expect(container.querySelector(".ui-alert")?.classList.contains("ui-alert--band")).toBe(true);
  });

  it("keeps appearance independent of variant", () => {
    const { container } = render(Alert, {
      props: { appearance: "band", variant: "warning" },
      slots: { default: "Mensaje" },
    });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(true);
    expect(root.classList.contains("ui-alert--warning")).toBe(true);
  });

  it("projects an icon", () => {
    render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(screen.getByText("!")).toBeTruthy();
  });

  it("hides the icon from assistive tech — the variant already carries the role", () => {
    const { container } = render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(container.querySelector(".ui-alert__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("projects an action", () => {
    render(Alert, {
      slots: { default: "Mensaje", action: "<button>cargar ahora</button>" },
    });
    expect(screen.getByRole("button", { name: "cargar ahora" })).toBeTruthy();
  });

  it("renders no action element when no action was given", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    expect(container.querySelector(".ui-alert__action")).toBe(null);
  });

  it("keeps the dismiss button when an action is present", () => {
    render(Alert, {
      props: { dismissible: true, dismissLabel: "Cerrar" },
      slots: { default: "Mensaje", action: "<button>reintentar</button>" },
    });
    expect(screen.getByRole("button", { name: "reintentar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });

  it.each([
    [undefined, "info", "status"],
    [undefined, "danger", "alert"],
    ["polite", "danger", "status"],
    ["assertive", "info", "alert"],
    ["off", "info", "note"],
    ["off", "danger", "note"],
  ] as const)("live=%s on a %s alert gives role=%s", (live, variant, role) => {
    const { container } = render(Alert, { props: { live, variant }, slots: { default: "Hint" } });
    expect(container.querySelector(".ui-alert__el")?.getAttribute("role")).toBe(role);
  });

  it("with live=off is not a live region and has no axe violations", async () => {
    const { container } = render(Alert, { props: { live: "off" }, slots: { default: "Hint" } });
    expect(container.querySelector("[role=status], [role=alert]")).toBeNull();
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

const read = (...parts: string[]) =>
  readFileSync(join(process.cwd(), "src", ...parts), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const scss = () => read("components", "alert", "alert.scss");
const rule = (css: string, selector: string) =>
  new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
const token = (css: string, name: string) =>
  new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1].trim();

describe("Alert close button size", () => {
  it("is a real box of --ui-alert-close-hit, not a hit area bolted on", () => {
    const body = rule(scss(), ".ui-alert__close");
    expect(body).toContain("width: var(--ui-alert-close-hit)");
    expect(body).toContain("height: var(--ui-alert-close-hit)");
    expect(body).toContain("border-radius: var(--ui-radii-full)");
    expect(scss()).not.toContain(".ui-alert__close::after");
  });

  it("is at least 32px in the base theme", () => {
    expect(token(read("styles", "tokens.css"), "--ui-alert-close-hit")).toBe("32px");
  });

  it("is at least 44px in the pocket preset", () => {
    expect(token(read("styles", "pocket.css"), "--ui-alert-close-hit")).toBe("44px");
  });

  it("is at least 44px with a coarse pointer", () => {
    const css = scss();
    const start = css.indexOf("@media (pointer: coarse)");
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(start)).toContain("--ui-alert-close-hit: 44px");
  });

  it("uses a negative margin so the alert does not grow", () => {
    expect(rule(scss(), ".ui-alert__close")).toMatch(/margin:\s*calc\(\(var\(--ui-alert-close-glyph\) - var\(--ui-alert-close-hit\)\) \/ 2\)/);
  });

  it("draws the cross as an SVG, not a text glyph", () => {
    const { container } = render(Alert, { props: { dismissible: true }, slots: { default: "x" } });
    const btn = container.querySelector(".ui-alert__close")!;
    expect(btn.querySelector("svg")).not.toBeNull();
    expect(btn.textContent?.trim()).toBe("");
  });
});

describe("Alert border", () => {
  it("has no left stripe on the boxed alert", () => {
    expect(rule(scss(), ".ui-alert__el")).not.toContain("border-left");
    expect(scss()).not.toContain("--ui-alert-accent-width");
  });

  it("is a 1px tone border", () => {
    expect(rule(scss(), ".ui-alert__el")).toContain("border: var(--ui-border-width) solid transparent");
    for (const v of ["neutral", "info", "success", "warning", "danger"]) {
      expect(rule(scss(), `.ui-alert--${v} .ui-alert__el`)).toContain(`border-color: var(--ui-alert-${v}-border)`);
    }
  });

  it("keeps the band square, with only a bottom rule", () => {
    const body = rule(scss(), ".ui-alert--band .ui-alert__el");
    expect(body).toContain("border-width: 0");
    expect(body).toContain("border-bottom");
  });
});

describe("Alert default icon", () => {
  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "shows a decorative default icon for %s when no #icon is given",
    (variant) => {
      const { container } = render(Alert, { props: { variant }, slots: { default: "Msg" } });
      const icon = container.querySelector(".ui-alert__icon");
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute("aria-hidden")).toBe("true");
      expect(icon!.querySelector("svg")).not.toBeNull();
    },
  );

  it("uses a different glyph per tone family", () => {
    const html = (variant: "info" | "success" | "warning" | "danger") =>
      render(Alert, { props: { variant }, slots: { default: "Msg" } }).container.querySelector(".ui-alert__icon")!.innerHTML;
    expect(new Set([html("info"), html("success"), html("warning"), html("danger")]).size).toBe(4);
  });

  it("lets the #icon slot replace the default", () => {
    const { container } = render(Alert, { slots: { default: "Msg", icon: "<b>!</b>" } });
    expect(container.querySelectorAll(".ui-alert__icon")).toHaveLength(1);
    expect(container.querySelector(".ui-alert__icon svg")).toBeNull();
    expect(screen.getByText("!")).toBeTruthy();
  });
});
