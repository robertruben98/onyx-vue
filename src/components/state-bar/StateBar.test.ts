import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import StateBar from "./StateBar.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const counts = {
  ok: 19,
  arreglado: 2,
  aviso: 3,
  defecto: 5,
  fallo: 1,
  omitido: 5,
  info: 1,
} as const;

/** The segment classes in the order they are painted, left to right. */
function order(container: Element): string[] {
  return [...container.querySelectorAll(".ui-state-bar__seg")].map(
    (el) =>
      [...el.classList].find((c) => c.startsWith("ui-state-bar__seg--")) ?? "",
  );
}

describe("StateBar (Vue)", () => {
  it("paints the worst state first, so a red sliver sits at the left edge", () => {
    // El orden sale de runStateRank y no esta escrito a mano: si alguien
    // reordena la escala, la barra le sigue sin tocar este componente.
    const { container } = render(StateBar, { props: { counts } });
    expect(order(container)).toEqual([
      "ui-state-bar__seg--fallo",
      "ui-state-bar__seg--defecto",
      "ui-state-bar__seg--aviso",
      "ui-state-bar__seg--omitido",
      "ui-state-bar__seg--arreglado",
      "ui-state-bar__seg--ok",
      "ui-state-bar__seg--info",
    ]);
  });

  it("drops the states nobody reached", () => {
    // Un segmento de ancho cero sigue ocupando su `gap` y deja una raya.
    const { container } = render(StateBar, {
      props: { counts: { ok: 3, defecto: 0, aviso: 0 } },
    });
    expect(order(container)).toEqual(["ui-state-bar__seg--ok"]);
  });

  it("draws the gap for what has not run yet", () => {
    const { container } = render(StateBar, {
      props: { counts: { ok: 10 }, total: 40 },
    });
    const pending = container.querySelector(".ui-state-bar__seg--pending");
    expect((pending as HTMLElement)?.style.width).toBe("75%");
  });

  it("has no gap once the run is over", () => {
    const { container } = render(StateBar, { props: { counts: { ok: 10 } } });
    expect(container.querySelector(".ui-state-bar__seg--pending")).toBeNull();
  });

  it("never lets a total smaller than reality shrink the bar", () => {
    // Un `total` que se queda corto (el runner encontro mas pasos de los que
    // anuncio) no puede producir anchos por encima del 100%.
    const { container } = render(StateBar, {
      props: { counts: { ok: 10 }, total: 4 },
    });
    const ok = container.querySelector(".ui-state-bar__seg--ok") as HTMLElement;
    expect(ok.style.width).toBe("100%");
    expect(container.querySelector(".ui-state-bar__seg--pending")).toBeNull();
  });

  it("reads out the same figures it draws", () => {
    // La barra es `role="img"`: quien no la ve tiene que recibir la lectura
    // entera, no un "grafico".
    const { container } = render(StateBar, {
      props: { counts: { ok: 2, defecto: 1 }, total: 5, label: "Ejecucion" },
    });
    const label = container
      .querySelector(".ui-state-bar__track")
      ?.getAttribute("aria-label");
    expect(label).toContain("3 de 5");
    expect(label).toContain("1 defecto");
    expect(label).toContain("2 pendientes");
  });

  it("shows the legend as plain text when it is not a filter", () => {
    const { container } = render(StateBar, { props: { counts: { ok: 4 } } });
    expect(container.querySelector("button.ui-state-bar__entry")).toBeNull();
  });

  it("emits the state when a legend entry is used as a filter", async () => {
    const { emitted } = render(StateBar, {
      props: { counts: { ok: 4, defecto: 2 }, interactive: true },
    });
    await userEvent.click(screen.getByRole("button", { name: /defecto/ }));
    expect(emitted().selected?.[0]).toEqual(["defecto"]);
  });

  it("emits null when the active entry is clicked again", async () => {
    // El mismo manejador limpia el filtro; si no, cada consumidor escribe su
    // propio "si ya estaba seleccionado, deselecciona".
    const { emitted } = render(StateBar, {
      props: { counts: { ok: 4, defecto: 2 }, interactive: true, selected: "defecto" },
    });
    await userEvent.click(screen.getByRole("button", { name: /defecto/ }));
    expect(emitted().selected?.[0]).toEqual([null]);
  });

  it("marks the active entry as pressed", () => {
    render(StateBar, {
      props: { counts: { ok: 4, defecto: 2 }, interactive: true, selected: "defecto" },
    });
    expect(
      screen.getByRole("button", { name: /defecto/ }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(StateBar, {
      props: { counts, total: 40, interactive: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
