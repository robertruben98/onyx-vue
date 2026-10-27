import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Stepper from "./Stepper.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const steps = [
  { label: "checkout", state: "done" as const, meta: "4s" },
  { label: "tests", state: "active" as const, note: "12 de 40" },
  { label: "push", state: "pending" as const },
];

describe("Stepper (Vue)", () => {
  it("is an ordered list named by its label", () => {
    render(Stepper, { props: { steps, label: "Fases del run" } });
    const list = screen.getByRole("list", { name: "Fases del run" });
    expect(list.tagName).toBe("OL");
    expect(list.querySelectorAll("li")).toHaveLength(3);
  });

  it("marks the active step as current", () => {
    const { container } = render(Stepper, { props: { steps } });
    const current = container.querySelector("[aria-current='step']");
    expect(current?.textContent).toContain("tests");
  });

  it("draws a glyph per state and speaks the state", () => {
    const { container } = render(Stepper, { props: { steps } });
    const first = container.querySelector("li") as HTMLElement;
    expect(first.querySelector(".ui-stepper__icon")?.textContent).toBe("✓");
    expect(first.textContent).toContain("(done)");
  });

  it("speaks the states in another language when told", () => {
    const { container } = render(Stepper, {
      props: { steps, stateLabels: { done: "hecho" } },
    });
    expect(container.querySelector("li")?.textContent).toContain("(hecho)");
  });

  it("treats an unknown state as pending", () => {
    const { container } = render(Stepper, {
      props: { steps: [{ label: "x", state: "weird" as never }] },
    });
    expect(container.querySelector(".ui-stepper__step--pending")).toBeTruthy();
  });

  it("renders meta and note", () => {
    render(Stepper, { props: { steps } });
    expect(screen.getByText("12 de 40")).toBeTruthy();
    expect(screen.getByText(/4s/)).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(Stepper, { props: { steps } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
