import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { h } from "vue";
import NavRail from "./NavRail.vue";
import NavRailGroup from "./NavRailGroup.vue";
import NavRailItem from "./NavRailItem.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("NavRail (Vue)", () => {
  it("is a named navigation region", () => {
    const { container } = render(NavRail, { props: { label: "PR dashboard" } });
    const nav = container.querySelector("nav.ui-nav-rail");
    expect(nav?.getAttribute("aria-label")).toBe("PR dashboard");
  });

  it("renders a group with its heading and its control", () => {
    render(NavRailGroup, {
      props: { label: "Repos" },
      slots: { trailing: () => h("button", "orden") },
    });
    expect(screen.getByText("Repos")).toBeTruthy();
    expect(screen.getByText("orden")).toBeTruthy();
  });
});

describe("NavRailItem (Vue)", () => {
  it("renders the label and the count", () => {
    render(NavRailItem, { props: { label: "payment", count: 12 } });
    expect(screen.getByText("payment")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("shows a dash, not a zero, when nobody asked for the count", () => {
    // Un 0 en el rail dice "no hay alertas"; el hecho es que no se han pedido.
    render(NavRailItem, { props: { label: "Seguridad", countState: "unrequested" } });
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("marks the active entry for assistive tech as well as visually", () => {
    const { container } = render(NavRailItem, {
      props: { label: "Todos", count: 1, active: true },
    });
    const el = container.querySelector(".ui-nav-rail__item");
    expect(el?.classList.contains("ui-nav-rail__item--active")).toBe(true);
    expect(el?.getAttribute("aria-current")).toBe("page");
  });

  it("leaves aria-current off an inactive entry", () => {
    const { container } = render(NavRailItem, { props: { label: "Todos", count: 1 } });
    expect(
      container.querySelector(".ui-nav-rail__item")?.hasAttribute("aria-current"),
    ).toBe(false);
  });

  it("is a button while it stays in the app", async () => {
    const { emitted } = render(NavRailItem, { props: { label: "Todos", count: 1 } });
    await screen.getByRole("button").click();
    expect(emitted().selected).toBeTruthy();
  });

  it("is a real link when it leaves, and does not fake the navigation", async () => {
    // Un boton con handler rompe el clic central y el "abrir en pestana nueva".
    const { emitted } = render(NavRailItem, {
      props: { label: "Dashboard", href: "/" },
    });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/");
    await link.click();
    expect(emitted().selected).toBeUndefined();
  });

  it("puts the warnings before the count", () => {
    const { container } = render(NavRailItem, {
      props: { label: "payment", count: 3 },
      slots: { marks: () => h("span", { class: "aviso" }, "✗2") },
    });
    const marks = container.querySelector(".ui-nav-rail__marks");
    const children = [...(marks?.children ?? [])];
    expect(children[0].classList.contains("aviso")).toBe(true);
    expect(children[1].classList.contains("ui-tri-state-count")).toBe(true);
  });

  it("shows no counter at all for an entry that counts nothing", () => {
    // Un contador sin valor pinta "·" — cargando —, y en un enlace de vuelta
    // esa espera no termina nunca.
    const { container } = render(NavRailItem, {
      props: { label: "Dashboard", href: "/" },
    });
    expect(container.querySelector(".ui-tri-state-count")).toBeNull();
  });

  it("still shows a pending counter when one was asked for", () => {
    const { container } = render(NavRailItem, {
      props: { label: "Seguridad", countState: "pending" },
    });
    expect(container.querySelector(".ui-tri-state-count")?.textContent).toBe("·");
  });

  it("shows a real zero", () => {
    render(NavRailItem, { props: { label: "Review", count: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(NavRailItem, {
      props: { label: "payment", count: 3, active: true, title: "atajo 1" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
