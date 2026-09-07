import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import FilterChip from "./FilterChip.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("FilterChip (Vue)", () => {
  it("renders the label and the count", () => {
    render(FilterChip, { props: { label: "ci rojo", count: 4 } });
    expect(screen.getByText("ci rojo")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("reports whether the filter is applied through aria-pressed", async () => {
    const { rerender } = render(FilterChip, {
      props: { label: "draft", count: 2, pressed: false },
    });
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    await rerender({ label: "draft", count: 2, pressed: true });
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("emits the state it is moving to, not the one it is in", async () => {
    const { emitted } = render(FilterChip, {
      props: { label: "draft", count: 2, pressed: false },
    });
    await screen.getByRole("button").click();
    expect(emitted().toggled[0]).toEqual([true]);
  });

  it("does not emit while disabled", async () => {
    const { emitted } = render(FilterChip, {
      props: { label: "draft", count: 2, disabled: true },
    });
    await screen.getByRole("button").click();
    expect(emitted().toggled).toBeUndefined();
  });

  it("shows a dot instead of a zero while the count is in flight", () => {
    render(FilterChip, { props: { label: "hilos", state: "pending" } });
    expect(screen.getByText("·")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("shows a dash when nobody asked for the count", () => {
    render(FilterChip, { props: { label: "secrets", state: "unrequested" } });
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("dims a chip that matches nothing but keeps it clickable", async () => {
    const { container, emitted } = render(FilterChip, {
      props: { label: "conflicto", count: 0 },
    });
    const el = container.querySelector(".ui-filter-chip");
    expect(el?.classList.contains("ui-filter-chip--empty")).toBe(true);
    expect(el?.hasAttribute("disabled")).toBe(false);
    await screen.getByRole("button").click();
    expect(emitted().toggled[0]).toEqual([true]);
  });

  it("does not dim a pressed chip that matches nothing", () => {
    // Es el caso que explica la lista vacia: apagarlo visualmente esconde el
    // motivo por el que no hay filas.
    const { container } = render(FilterChip, {
      props: { label: "conflicto", count: 0, pressed: true },
    });
    expect(
      container
        .querySelector(".ui-filter-chip")
        ?.classList.contains("ui-filter-chip--empty"),
    ).toBe(false);
  });

  it("carries the tone on the root", () => {
    const { container } = render(FilterChip, {
      props: { label: "secrets", count: 1, tone: "danger" },
    });
    expect(
      container
        .querySelector(".ui-filter-chip")
        ?.classList.contains("ui-filter-chip--danger"),
    ).toBe(true);
  });

  it("keeps the count neutral until the filter is applied", () => {
    // Trece chips coloreando cada uno su numero convierten la barra de filtros
    // en un semaforo: el tono lo lleva la etiqueta, que es la que nombra.
    const { container } = render(FilterChip, {
      props: { label: "ci rojo", count: 3, tone: "danger" },
    });
    const count = container.querySelector(".ui-tri-state-count");
    expect(count?.classList.contains("ui-tri-state-count--danger")).toBe(false);
  });

  it("gives the count the tone once the filter is applied", () => {
    const { container } = render(FilterChip, {
      props: { label: "ci rojo", count: 3, tone: "danger", pressed: true },
    });
    expect(
      container
        .querySelector(".ui-tri-state-count")
        ?.classList.contains("ui-tri-state-count--danger"),
    ).toBe(true);
  });

  it("names the count for assistive tech with what it counts", () => {
    const { container } = render(FilterChip, {
      props: { label: "hilos", count: 5 },
    });
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("5 hilos");
  });

  it("has no axe violations", async () => {
    const { container } = render(FilterChip, {
      props: { label: "aprobado", count: 7, tone: "ok", pressed: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
