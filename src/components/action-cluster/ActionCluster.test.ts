import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ActionCluster from "./ActionCluster.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const acciones = "<button>abrir</button><button>reiniciar</button>";

describe("ActionCluster (Vue)", () => {
  it("projects its actions", () => {
    render(ActionCluster, { props: { label: "acciones" }, slots: { default: acciones } });
    expect(screen.getByRole("button", { name: "abrir" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "reiniciar" })).toBeTruthy();
  });

  it("is a named group, so the buttons are not loose in the row", () => {
    render(ActionCluster, { props: { label: "acciones del servicio" }, slots: { default: acciones } });
    expect(screen.getByRole("group", { name: "acciones del servicio" })).toBeTruthy();
  });

  it("is quiet by default", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones" },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(true);
  });

  it("drops the quiet modifier when told it is revealed", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", revealed: true },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(false);
  });

  it("can be told never to dim", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", quiet: false },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(false);
  });

  it("keeps its actions reachable by keyboard", () => {
    render(ActionCluster, { props: { label: "acciones" }, slots: { default: acciones } });
    const abrir = screen.getByRole("button", { name: "abrir" });
    abrir.focus();
    expect(document.activeElement).toBe(abrir);
  });

  it.each([
    ["quiet", {}],
    ["revealed", { revealed: true }],
    ["never quiet", { quiet: false }],
  ] as const)("has no axe violations (%s)", async (_n, extra) => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", ...extra },
      slots: { default: acciones },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
