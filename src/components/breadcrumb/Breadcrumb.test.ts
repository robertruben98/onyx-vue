import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Breadcrumb from "./Breadcrumb.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const items = [
  { label: "servicios", href: "/" },
  { label: "SM23" },
  { label: "api-core", href: "/service/sm23/api-core" },
];

describe("Breadcrumb (Vue)", () => {
  it("is a named navigation landmark with an ordered trail", () => {
    render(Breadcrumb, { props: { items, label: "Ruta" } });
    const nav = screen.getByRole("navigation", { name: "Ruta" });
    expect(nav.querySelector("ol")?.children).toHaveLength(3);
  });

  it("links the levels that have somewhere to go", () => {
    render(Breadcrumb, { props: { items } });
    expect(screen.getByRole("link", { name: "servicios" }).getAttribute("href")).toBe("/");
    expect(screen.queryByRole("link", { name: "SM23" })).toBeNull();
  });

  it("never links the current page, and marks it", () => {
    render(Breadcrumb, { props: { items } });
    expect(screen.queryByRole("link", { name: "api-core" })).toBeNull();
    expect(screen.getByText("api-core").getAttribute("aria-current")).toBe("page");
  });

  it("emits navigated with the event so a client router can take over", async () => {
    const { emitted } = render(Breadcrumb, { props: { items } });
    await fireEvent.click(screen.getByRole("link", { name: "servicios" }));
    const [item, index, event] = emitted().navigated[0] as [unknown, number, Event];
    expect(item).toEqual(items[0]);
    expect(index).toBe(0);
    expect(event).toBeInstanceOf(Event);
  });

  it("hides the separators from assistive tech", () => {
    const { container } = render(Breadcrumb, { props: { items } });
    const seps = container.querySelectorAll(".ui-breadcrumb__sep");
    expect(seps).toHaveLength(2);
    seps.forEach((s) => expect(s.getAttribute("aria-hidden")).toBe("true"));
  });

  it("has no axe violations", async () => {
    const { container } = render(Breadcrumb, { props: { items } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
