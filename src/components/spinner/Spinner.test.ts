import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Spinner from "./Spinner.vue";

describe("Spinner (Vue)", () => {
  it("exposes role=status with a default label", () => {
    render(Spinner);
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Loading",
    );
  });

  it("uses a custom label", () => {
    render(Spinner, { props: { label: "Cargando" } });
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Cargando",
    );
  });

  it("applies the size class", () => {
    const { container } = render(Spinner, { props: { size: "lg" } });
    expect(
      container.querySelector(".ui-spinner")?.classList.contains(
        "ui-spinner--lg",
      ),
    ).toBe(true);
  });

  it("marks the ring decorative (aria-hidden)", () => {
    const { container } = render(Spinner);
    expect(
      container.querySelector(".ui-spinner__ring")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = render(Spinner, { props: { size } });
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
