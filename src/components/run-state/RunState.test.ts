import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import RunState, {
  runStateMark,
  runStateNeedsAttention,
  runStateRank,
} from "./RunState.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const states = [
  "ok",
  "arreglado",
  "aviso",
  "defecto",
  "fallo",
  "omitido",
  "info",
] as const;

describe("RunState (Vue)", () => {
  it("renders the state as its own label", () => {
    render(RunState, { props: { state: "defecto" } });
    expect(screen.getByText("defecto")).toBeTruthy();
  });

  it("lets a slot override the visible text", () => {
    render(RunState, {
      props: { state: "defecto" },
      slots: { default: "defecto · 5" },
    });
    expect(screen.getByText("defecto · 5")).toBeTruthy();
  });

  it.each(states)("applies the state class on the root (%s)", (state) => {
    const { container } = render(RunState, { props: { state } });
    expect(
      container
        .querySelector(".ui-run-state")
        ?.classList.contains(`ui-run-state--${state}`),
    ).toBe(true);
  });

  it("gives each of the seven states a class of its own", () => {
    // Si dos estados compartieran clase, la vista los pintaria igual y se
    // perderia la distincion que justifica la escala. Paso de verdad en el
    // banco: `defecto` y `aviso` compartieron la clase `warn`, o sea que algo
    // roto y algo sin concluir se veian igual en una columna de 35 filas.
    const clases = states.map((state) => {
      const { container } = render(RunState, { props: { state } });
      return [...(container.querySelector(".ui-run-state")?.classList ?? [])]
        .filter((c) => c !== "ui-run-state")
        .join(" ");
    });
    expect(new Set(clases).size).toBe(states.length);
  });

  it("hides the text-export mark from the accessibility tree", () => {
    // `[!]` es ruido para un lector de pantalla: el estado ya se lee en el texto.
    const { container } = render(RunState, {
      props: { state: "fallo", showMark: true },
    });
    const mark = container.querySelector(".ui-run-state__mark");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect(mark?.textContent).toBe("[!]");
  });

  it("omits the mark unless asked", () => {
    const { container } = render(RunState, { props: { state: "fallo" } });
    expect(container.querySelector(".ui-run-state__mark")).toBeNull();
  });

  it.each(states)("has no axe violations (%s)", async (state) => {
    const { container } = render(RunState, { props: { state } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("runStateRank", () => {
  it("orders worst first", () => {
    const shuffled = ["ok", "omitido", "fallo", "info", "aviso", "arreglado", "defecto"];
    expect([...shuffled].sort((a, b) => runStateRank(a) - runStateRank(b))).toEqual([
      "fallo",
      "defecto",
      "aviso",
      "omitido",
      "arreglado",
      "ok",
      "info",
    ]);
  });

  it("puts an unanswered question ahead of a settled one", () => {
    // `omitido` no es buena noticia: es que nadie lo sabe. Va por delante de
    // `arreglado` y de `ok` a proposito.
    expect(runStateRank("omitido")).toBeLessThan(runStateRank("arreglado"));
    expect(runStateRank("omitido")).toBeLessThan(runStateRank("ok"));
  });

  it("separates what broke now from what was already known", () => {
    expect(runStateRank("fallo")).toBeLessThan(runStateRank("defecto"));
  });

  it("is case-insensitive", () => {
    expect(runStateRank("DEFECTO")).toBe(runStateRank("defecto"));
  });

  it("sends anything it does not recognise to the back", () => {
    expect(runStateRank("platano")).toBe(9);
  });
});

describe("runStateMark", () => {
  it("uses three marks and not two", () => {
    // Con dos habria que mentir en uno: un paso que no concluyo no es un
    // aprobado y tampoco es un fallo.
    expect(new Set(states.map(runStateMark))).toEqual(
      new Set(["[X]", "[!]", "[ ]"]),
    );
  });

  it("marks ok and arreglado as passed", () => {
    expect(runStateMark("ok")).toBe("[X]");
    expect(runStateMark("arreglado")).toBe("[X]");
  });

  it("marks the three that need attention", () => {
    for (const s of ["defecto", "fallo", "aviso"]) {
      expect(runStateMark(s)).toBe("[!]");
    }
  });

  it("never claims an unconcluded step passed", () => {
    expect(runStateMark("omitido")).toBe("[ ]");
    expect(runStateMark("info")).toBe("[ ]");
  });

  it("falls back to the neutral mark, never to a pass", () => {
    // Un estado que esta libreria no conoce no se da por bueno.
    expect(runStateMark("platano")).toBe("[ ]");
  });
});

describe("runStateNeedsAttention", () => {
  it("is true exactly for the three marked [!]", () => {
    const atencion = states.filter(runStateNeedsAttention);
    expect(atencion).toEqual(["aviso", "defecto", "fallo"]);
  });
});
