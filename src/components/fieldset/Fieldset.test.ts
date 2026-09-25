import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h } from "vue";
import Fieldset from "./Fieldset.vue";
import FieldRow from "./FieldRow.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Fieldset (Vue)", () => {
  it("is a group named by its legend", () => {
    render(Fieldset, {
      props: { legend: "columnas" },
      slots: { default: "<label><input type='checkbox' /> puerto</label>" },
    });
    expect(screen.getByRole("group", { name: "columnas" })).toBeTruthy();
  });

  it("renders the note only when given", () => {
    const { container, unmount } = render(Fieldset, { props: { legend: "datos" } });
    expect(container.querySelector(".ui-fieldset__note")).toBeNull();
    unmount();
    render(Fieldset, {
      props: { legend: "datos" },
      slots: { note: "Cada refresco cuesta una consulta." },
    });
    expect(screen.getByText("Cada refresco cuesta una consulta.")).toBeTruthy();
  });

  it("lays items out in the requested number of columns", () => {
    const { container } = render(Fieldset, { props: { legend: "x", columns: 3 } });
    expect(container.querySelector(".ui-fieldset__body--cols-3")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(Fieldset, {
      props: { legend: "columnas", columns: 2 },
      slots: {
        default: "<label><input type='checkbox' /> puerto</label><label><input type='checkbox' /> rama</label>",
        note: "Ocultar una columna solo deja de pintarla.",
      },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("FieldRow (Vue)", () => {
  // El control recibe el id de la etiqueta por el slot: es lo que permite
  // nombrar un control que no es un <input> nativo.
  const Wired = defineComponent({
    setup() {
      return () =>
        h(FieldRow, { label: "refresco automatico" }, {
          default: ({ labelId }: { labelId: string }) =>
            h("select", { "aria-labelledby": labelId }, [h("option", "10 s")]),
        });
    },
  });

  it("names its control through the slot's labelId", () => {
    render(Wired);
    expect(screen.getByRole("combobox", { name: "refresco automatico" })).toBeTruthy();
  });

  it("gives every row its own label id", () => {
    const Two = defineComponent({ setup: () => () => h("div", [h(Wired), h(Wired)]) });
    const { container } = render(Two);
    const ids = [...container.querySelectorAll(".ui-field-row__label")].map((e) => e.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("has no axe violations", async () => {
    const { container } = render(Wired);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
