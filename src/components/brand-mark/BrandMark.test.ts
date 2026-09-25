import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import BrandMark from "./BrandMark.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("BrandMark (Vue)", () => {
  it("renders the name and the tile letters", () => {
    const { container } = render(BrandMark, { props: { mark: "AG", name: "Agents" } });
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(container.querySelector(".ui-brand-mark__tile")?.textContent).toBe("AG");
  });

  it("hides the tile from assistive tech, since the name says the same", () => {
    const { container } = render(BrandMark, { props: { mark: "AG", name: "Agents" } });
    expect(
      container.querySelector(".ui-brand-mark__tile")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("renders the secondary line only when given", () => {
    const { container, rerender } = render(BrandMark, {
      props: { mark: "S", name: "SM23" },
    });
    expect(container.querySelector(".ui-brand-mark__sub")).toBeNull();
    return rerender({ mark: "S", name: "SM23", sub: "control-panel :9100" }).then(() => {
      expect(screen.getByText("control-panel :9100")).toBeTruthy();
    });
  });

  it("is a link only when it has somewhere to go", async () => {
    const { rerender } = render(BrandMark, { props: { mark: "PR", name: "PR Dashboard" } });
    expect(screen.queryByRole("link")).toBeNull();
    await rerender({ mark: "PR", name: "PR Dashboard", href: "/" });
    expect(screen.getByRole("link").getAttribute("href")).toBe("/");
  });

  it("has no axe violations", async () => {
    const { container } = render(BrandMark, {
      props: { mark: "ID", name: "OIDC", sub: "full test", href: "/oidc/" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
