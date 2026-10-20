import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import CheckRow from "./CheckRow.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("CheckRow (Vue)", () => {
  it("renders the name and the evidence", () => {
    render(CheckRow, {
      props: { name: "CI pasando", detail: "todos los checks en SUCCESS" },
    });
    expect(screen.getByText("CI pasando")).toBeTruthy();
    expect(screen.getByText("todos los checks en SUCCESS")).toBeTruthy();
  });

  it("shows a spinner while running, never a dot", () => {
    // Un punto estatico afirma un estado asentado, que es justo lo que
    // `running` no es.
    const { container } = render(CheckRow, {
      props: { name: "Sandbox", state: "running" },
    });
    expect(container.querySelector(".ui-spinner")).toBeTruthy();
    expect(container.querySelector(".ui-status-dot")).toBeNull();
  });

  it.each([
    ["done", "ui-status-dot--live"],
    ["failed", "ui-status-dot--dead"],
    ["pending", "ui-status-dot--off"],
  ] as const)("maps %s onto the right dot", (state, dotClass) => {
    const { container } = render(CheckRow, { props: { name: "x", state } });
    expect(
      container.querySelector(".ui-status-dot")?.classList.contains(dotClass),
    ).toBe(true);
  });

  it("names the state for assistive tech instead of leaving a bare circle", () => {
    const { container } = render(CheckRow, {
      props: { name: "CI pasando", state: "done" },
    });
    expect(
      container.querySelector(".ui-status-dot")?.getAttribute("aria-label"),
    ).toBe("CI pasando: done");
  });

  it("carries the state on the root so the name can take its colour", () => {
    const { container } = render(CheckRow, {
      props: { name: "x", state: "failed" },
    });
    expect(
      container
        .querySelector(".ui-check-row")
        ?.classList.contains("ui-check-row--failed"),
    ).toBe(true);
  });

  it("renders the actions slot", () => {
    render(CheckRow, {
      props: { name: "x" },
      slots: { actions: () => h("button", "verificar") },
    });
    expect(screen.getByText("verificar")).toBeTruthy();
  });

  it("keeps the detail titled, since it truncates", () => {
    const { container } = render(CheckRow, {
      props: { name: "x", detail: "una razon larguisima que no cabe en la celda" },
    });
    expect(
      container.querySelector(".ui-check-row__detail")?.getAttribute("title"),
    ).toBe("una razon larguisima que no cabe en la celda");
  });

  it("drops to the step layout when dense", () => {
    const { container } = render(CheckRow, {
      props: { name: "push", state: "running", dense: true },
    });
    expect(
      container
        .querySelector(".ui-check-row")
        ?.classList.contains("ui-check-row--dense"),
    ).toBe(true);
  });

  it("has no axe violations in any state", async () => {
    for (const state of ["pending", "running", "done", "failed"] as const) {
      const { container } = render(CheckRow, {
        props: { name: "CI pasando", detail: "checks", state },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    }
  });
});
