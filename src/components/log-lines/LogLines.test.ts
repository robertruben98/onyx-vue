import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import LogLines from "./LogLines.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const lines = [
  { time: "19:22:04", action: "approve", result: "ok" as const, detail: "review enviada" },
  { time: "19:21:40", action: "rerun ci", result: "pending" as const },
  { time: "19:18:02", action: "sandbox", result: "error" as const, detail: "conflicto" },
];

describe("LogLines (Vue)", () => {
  it("renders one entry per line, in the order given", () => {
    const { container } = render(LogLines, { props: { lines } });
    const rendered = [...container.querySelectorAll(".ui-log-lines__action")].map(
      (el) => el.textContent,
    );
    expect(rendered).toEqual(["approve", "rerun ci", "sandbox"]);
  });

  it("shows the detail when there is one", () => {
    render(LogLines, { props: { lines } });
    expect(screen.getByText("review enviada")).toBeTruthy();
  });

  it("falls back to the result when there is no detail", () => {
    render(LogLines, { props: { lines } });
    expect(screen.getByText("pending")).toBeTruthy();
  });

  it("tones the result", () => {
    const { container } = render(LogLines, { props: { lines } });
    const results = container.querySelectorAll(".ui-log-lines__result");
    expect(results[0].classList.contains("ui-log-lines__result--ok")).toBe(true);
    expect(results[2].classList.contains("ui-log-lines__result--error")).toBe(true);
  });

  it("treats a missing result as pending rather than as success", () => {
    const { container } = render(LogLines, {
      props: { lines: [{ time: "10:00", action: "x" }] },
    });
    expect(
      container
        .querySelector(".ui-log-lines__result")
        ?.classList.contains("ui-log-lines__result--pending"),
    ).toBe(true);
  });

  it("says so in words when nothing has happened", () => {
    // Un log vacio que no pinta nada se lee como un fallo de la pagina.
    render(LogLines, { props: { lines: [], emptyText: "(sin actividad)" } });
    expect(screen.getByText("(sin actividad)")).toBeTruthy();
  });

  it("is an ordered list, because the order is the content", () => {
    const { container } = render(LogLines, { props: { lines } });
    expect(container.querySelector("ol.ui-log-lines")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(LogLines, {
      props: { lines, label: "workflow activity" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
