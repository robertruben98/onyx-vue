import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  it("a link entry is never wider than the rail", () => {
    // Una entrada con `href` es un <a>, que mide su caja de contenido: con
    // width 100% y el padding se salia del rail y tapaba el contador.
    const css = readFileSync(join(process.cwd(), "src/components/nav-rail/nav-rail.scss"), "utf8");
    expect(css).toMatch(/\.ui-nav-rail__item\s*\{[^}]*box-sizing:\s*border-box/);
  });
});

// El HTML de 0.11.3, sin comentarios: con o sin `meta` en el codigo, una
// entrada que no lo usa tiene que salir identica.
const PLAIN_0113 = "<button class=\"ui-nav-rail__item ui-nav-rail__item--active\" type=\"button\" aria-current=\"page\"><span class=\"ui-nav-rail__name\">shannon</span><span class=\"ui-nav-rail__marks\"><!-- Los avisos van ANTES del contador: son lo que hace mirar la fila. --><span class=\"ui-tri-state-count ui-nav-rail__count\" aria-label=\"37 shannon\" role=\"img\"><span aria-hidden=\"true\">37</span></span></span></button>";
const LINK_0113 = "<a class=\"ui-nav-rail__item\" href=\"/x\"><span class=\"ui-nav-rail__name\">docs</span><span class=\"ui-nav-rail__marks\"><!-- Los avisos van ANTES del contador: son lo que hace mirar la fila. --><i>!</i><!--v-if--></span></a>";
const noComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "");

describe("NavRailItem meta", () => {
  it("without meta renders exactly what 0.11.3 rendered", () => {
    const a = render(NavRailItem, { props: { label: "shannon", count: 37, active: true } });
    expect(noComments(a.container.innerHTML)).toBe(noComments(PLAIN_0113));
    const b = render(NavRailItem, { props: { label: "docs", href: "/x" }, slots: { marks: "<i>!</i>" } });
    expect(noComments(b.container.innerHTML)).toBe(noComments(LINK_0113));
    for (const empty of ["", []]) {
      const c = render(NavRailItem, { props: { label: "shannon", count: 37, active: true, meta: empty } });
      expect(noComments(c.container.innerHTML)).toBe(noComments(PLAIN_0113));
    }
  });

  it("puts one line per meta entry under the label", () => {
    const { container } = render(NavRailItem, {
      props: { label: "shannon", count: 37, meta: ["37 pending commits", "last 31-10 · next 07-11"] },
    });
    const item = container.querySelector(".ui-nav-rail__item")!;
    expect(item.classList.contains("ui-nav-rail__item--meta")).toBe(true);
    const text = item.querySelector(".ui-nav-rail__text")!;
    expect(text.querySelector(".ui-nav-rail__name")!.textContent).toBe("shannon");
    expect([...text.querySelectorAll(".ui-nav-rail__meta-line")].map((l) => l.textContent)).toEqual([
      "37 pending commits",
      "last 31-10 · next 07-11",
    ]);
    // The count stays beside the name, outside the text block.
    expect(item.querySelector(".ui-nav-rail__marks .ui-nav-rail__count")).not.toBeNull();
  });

  it("takes a single string, and the #meta slot over the prop", () => {
    const one = render(NavRailItem, { props: { label: "gstack", meta: "4 pending" } });
    expect(one.container.querySelectorAll(".ui-nav-rail__meta-line")).toHaveLength(1);
    const slotted = render(NavRailItem, {
      props: { label: "gstack", meta: "ignored" },
      slots: { meta: "<span class='mine'>analysing… 12 min</span>" },
    });
    expect(slotted.container.querySelector(".ui-nav-rail__meta .mine")!.textContent).toBe("analysing… 12 min");
    expect(slotted.container.textContent).not.toContain("ignored");
  });

  it("truncates each meta line and never lets the text block widen the rail", () => {
    const css = readFileSync(join(process.cwd(), "src/components/nav-rail/nav-rail.scss"), "utf8");
    expect(css).toMatch(/\.ui-nav-rail__meta > \*\s*\{[^}]*text-overflow:\s*ellipsis[^}]*white-space:\s*nowrap/);
    expect(css).toMatch(/\.ui-nav-rail__text\s*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.ui-nav-rail__meta\s*\{[^}]*min-width:\s*0/);
  });

  it("has no axe violations with meta, as a button and as a link", async () => {
    for (const href of ["", "/repo"]) {
      const { container } = render(NavRailItem, { props: { label: "shannon", count: 3, meta: ["a", "b"], href } });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    }
  });
});
