import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import BulkBar from "./BulkBar.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("BulkBar (Vue)", () => {
  it("does not render when nothing is selected", () => {
    // Una barra que ofrece actuar sobre nada gasta una fila en decir que no
    // hay nada que hacer.
    const { container } = render(BulkBar, { props: { count: 0 } });
    expect(container.querySelector(".ui-bulk-bar")).toBeNull();
  });

  it("counts with the right word for one and for many", () => {
    const noun: [string, string] = ["marcada", "marcadas"];
    const one = render(BulkBar, { props: { count: 1, noun } });
    expect(one.getByText("1 marcada")).toBeTruthy();
    const many = render(BulkBar, { props: { count: 4, noun } });
    expect(many.getByText("4 marcadas")).toBeTruthy();
  });

  it("shows the actions while it is not asking", () => {
    render(BulkBar, {
      props: { count: 2 },
      slots: { actions: () => h("button", "approve") },
    });
    expect(screen.getByText("approve")).toBeTruthy();
  });

  it("hides the actions once it is asking", () => {
    // Ofrecer una segunda accion en mitad de una confirmacion es como se
    // dispara la que no se confirmo.
    render(BulkBar, {
      props: { count: 2, question: "¿approve en 2?" },
      slots: { actions: () => h("button", "approve") },
    });
    expect(screen.queryByText("approve")).toBeNull();
    expect(screen.getByText("¿approve en 2?")).toBeTruthy();
  });

  it("keeps the count on screen while asking", () => {
    render(BulkBar, {
      props: { count: 4, noun: ["marcada", "marcadas"], question: "¿approve en 3 de 4?" },
    });
    expect(screen.getByText("4 marcadas")).toBeTruthy();
  });

  it("emits confirmed and cancelled", async () => {
    const { emitted } = render(BulkBar, {
      props: {
        count: 2,
        question: "¿seguro?",
        confirmLabel: "confirmar",
        cancelLabel: "cancelar",
      },
    });
    await screen.getByText("confirmar").click();
    await screen.getByText("cancelar").click();
    expect(emitted().confirmed).toBeTruthy();
    expect(emitted().cancelled).toBeTruthy();
  });

  it("changes surface when it changes phase", () => {
    const { container } = render(BulkBar, {
      props: { count: 2, question: "¿seguro?" },
    });
    expect(
      container
        .querySelector(".ui-bulk-bar")
        ?.classList.contains("ui-bulk-bar--asking"),
    ).toBe(true);
  });

  it("has no axe violations in either phase", async () => {
    for (const question of ["", "¿approve en 2?"]) {
      const { container } = render(BulkBar, { props: { count: 2, question } });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    }
  });
});
