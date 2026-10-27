import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Readout from "./Readout.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Readout (Vue)", () => {
  it("renders the figure and its caption", () => {
    render(Readout, { props: { label: "Tiempo", value: "6.0" } });
    expect(screen.getByText("Tiempo")).toBeTruthy();
    expect(screen.getByText(/6\.0/)).toBeTruthy();
  });

  it("takes a string figure, not just a number", () => {
    // `BYPASS` y `—` son lecturas validas: no todo lo que se lee es un numero.
    render(Readout, { props: { label: "Cache", value: "BYPASS" } });
    expect(screen.getByText("BYPASS")).toBeTruthy();
  });

  it("renders the unit apart from the value", () => {
    const { container } = render(Readout, {
      props: { label: "Tiempo", value: 6, unit: "s" },
    });
    expect(container.querySelector(".ui-readout__unit")?.textContent).toBe("s");
  });

  it("omits the unit when there is none", () => {
    const { container } = render(Readout, { props: { label: "Eventos", value: 38 } });
    expect(container.querySelector(".ui-readout__unit")).toBeNull();
  });

  it.each(["default", "success", "warning", "danger", "muted"] as const)(
    "applies the %s tone on the root",
    (tone) => {
      const { container } = render(Readout, {
        props: { label: "L", value: 1, tone },
      });
      expect(
        container.querySelector(".ui-readout")?.classList.contains(`ui-readout--${tone}`),
      ).toBe(true);
    },
  );

  it("has no axe violations", async () => {
    const { container } = render(Readout, {
      props: { label: "Tiempo", value: "6.0", unit: "s" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
