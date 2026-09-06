import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import EmptyState from "./EmptyState.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("EmptyState (Vue)", () => {
  it("projects the title and labels the region with it", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Sin issues asignadas" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    const titleId = root.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(container.querySelector(`#${titleId}`)?.textContent).toContain(
      "Sin issues asignadas",
    );
  });

  it("prefers an explicit ariaLabel over the title for the accessible name", () => {
    const { container } = render(EmptyState, {
      props: { ariaLabel: "Lista vacia" },
      slots: { title: "Sin issues" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("aria-label")).toBe("Lista vacia");
    expect(root.getAttribute("aria-labelledby")).toBe(null);
  });

  it("defaults to the region role", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    expect(container.querySelector(".ui-empty-state")?.getAttribute("role")).toBe("region");
  });

  it("takes the status role, for an empty state that appears dynamically", () => {
    const { container } = render(EmptyState, {
      props: { role: "status" },
      slots: { title: "Vacio" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("role")).toBe("status");
    expect(root.getAttribute("aria-atomic")).toBe("true");
  });

  it("describes itself only when a description was actually given", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("aria-describedby")).toBe(null);
    expect(container.querySelector(".ui-empty-state__description")).toBe(null);
  });

  it("wires aria-describedby when there is a description", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Vacio", description: "Nada que revisar hoy." },
    });
    const root = container.querySelector(".ui-empty-state")!;
    const id = root.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(container.querySelector(`#${id}`)?.textContent).toContain("Nada que revisar hoy.");
  });

  it("renders no actions when no action slot was filled", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    expect(container.querySelector(".ui-empty-state__actions")).toBe(null);
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  it("emits primaryAction when the primary button is activated", async () => {
    const { emitted } = render(EmptyState, {
      slots: { title: "Vacio", primaryAction: "Cargar ahora" },
    });
    (screen.getByRole("button", { name: "Cargar ahora" }) as HTMLButtonElement).click();
    expect(emitted().primaryAction).toBeTruthy();
  });

  it("emits secondaryAction when the secondary button is activated", async () => {
    const { emitted } = render(EmptyState, {
      slots: { title: "Vacio", secondaryAction: "Ver opciones" },
    });
    (screen.getByRole("button", { name: "Ver opciones" }) as HTMLButtonElement).click();
    expect(emitted().secondaryAction).toBeTruthy();
  });

  it("disables both actions and marks itself aria-disabled", () => {
    const { container } = render(EmptyState, {
      props: { disabled: true },
      slots: { title: "Vacio", primaryAction: "Cargar", secondaryAction: "Opciones" },
    });
    expect(container.querySelector(".ui-empty-state")?.getAttribute("aria-disabled")).toBe("true");
    const buttons = [...container.querySelectorAll("button")] as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it("emits nothing while disabled", () => {
    const { container, emitted } = render(EmptyState, {
      props: { disabled: true },
      slots: { title: "Vacio", primaryAction: "Cargar" },
    });
    (container.querySelector("button") as HTMLButtonElement).click();
    expect(emitted().primaryAction).toBeFalsy();
  });

  it("hides the visual from assistive tech", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Vacio", icon: "<svg />" },
    });
    expect(container.querySelector(".ui-empty-state__visual")?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    ["title only", { title: "Vacio" }],
    ["full", { title: "Vacio", description: "Nada aqui.", icon: "<svg />", primaryAction: "Cargar", secondaryAction: "Opciones" }],
  ] as const)("has no axe violations (%s)", async (_n, slots) => {
    const { container } = render(EmptyState, { slots });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
