import { fireEvent, render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { h, nextTick, ref } from "vue";
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

  it("is a real link, and never cancels the navigation itself", async () => {
    // Un boton con handler rompe el clic central y el "abrir en pestana nueva".
    const { emitted } = render(NavRailItem, {
      props: { label: "Dashboard", href: "/" },
    });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    // It tells the app (so it may route), but leaves the default alone.
    expect(emitted().selected).toHaveLength(1);
    expect(ev.defaultPrevented).toBe(false);
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

const Glyph = { render: () => h("svg", { viewBox: "0 0 24 24" }) };

describe("NavRail icons variant (Vue)", () => {
  it("adds the icons class only for variant=icons", () => {
    const a = render(NavRail, { props: { variant: "icons" } });
    expect(a.container.querySelector("nav")?.classList.contains("ui-nav-rail--icons")).toBe(true);
    const b = render(NavRail);
    expect(b.container.querySelector("nav")?.classList.contains("ui-nav-rail--icons")).toBe(false);
  });

  it("renders a footer slot only when given", () => {
    const a = render(NavRail, { props: { variant: "icons" }, slots: { footer: () => h("button", "Me") } });
    expect(a.container.querySelector(".ui-nav-rail__footer")).toBeTruthy();
    const b = render(NavRail, { props: { variant: "icons" } });
    expect(b.container.querySelector(".ui-nav-rail__footer")).toBeNull();
  });

  it("an icon entry is a labelled button without visible text", () => {
    render(NavRailItem, { props: { label: "Chats", icon: Glyph } });
    const btn = screen.getByRole("button", { name: "Chats" });
    expect(btn.classList.contains("ui-nav-rail__item--icon")).toBe(true);
    expect(btn.getAttribute("title")).toBe("Chats");
    expect(btn.querySelector("svg")).toBeTruthy();
    expect(btn.querySelector(".ui-nav-rail__name")).toBeNull();
  });

  it("takes the glyph from the icon slot too", () => {
    const { container } = render(NavRailItem, {
      props: { label: "Calls" },
      slots: { icon: () => h("svg") },
    });
    expect(container.querySelector(".ui-nav-rail__glyph svg")).toBeTruthy();
  });

  it("shows a badge, speaks it in the name, and caps at 99+", () => {
    const { container, rerender } = render(NavRailItem, { props: { label: "Chats", icon: Glyph, badge: 5 } });
    expect(container.querySelector(".ui-nav-rail__badge")?.textContent).toBe("5");
    expect(container.querySelector("button")?.getAttribute("aria-label")).toBe("Chats, 5");
    return rerender({ badge: 120 }).then(() => {
      expect(container.querySelector(".ui-nav-rail__badge")?.textContent).toBe("99+");
    });
  });

  it("renders no badge for 0 and a dot when asked", () => {
    const { container } = render(NavRailItem, { props: { label: "Status", icon: Glyph, badge: 0, dot: true } });
    expect(container.querySelector(".ui-nav-rail__badge")).toBeNull();
    expect(container.querySelector(".ui-nav-rail__dot")).toBeTruthy();
  });

  it("marks the active icon entry and has no a11y violations", async () => {
    const { container } = render(NavRail, {
      props: { variant: "icons", label: "Apps" },
      slots: { default: () => [h(NavRailItem, { label: "Chats", icon: Glyph, active: true, badge: 3 }), h(NavRailItem, { label: "Calls", icon: Glyph })] },
    });
    const items = container.querySelectorAll(".ui-nav-rail__item--icon");
    expect(items[0].getAttribute("aria-current")).toBe("page");
    expect(items[1].hasAttribute("aria-current")).toBe(false);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("NavRailItem links (Vue)", () => {
  it("emits selected with the MouseEvent on a plain click of a link entry", async () => {
    const { getByRole, emitted } = render(NavRailItem, { props: { label: "Library", href: "/library" } });
    await fireEvent.click(getByRole("link", { name: "Library" }));
    const calls = emitted().selected as [MouseEvent][];
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBeInstanceOf(MouseEvent);
  });

  it("lets the app preventDefault the plain click to route it", async () => {
    const { getByRole } = render(NavRailItem, {
      props: { label: "Library", href: "/library", onSelected: (e?: MouseEvent) => e?.preventDefault() },
    });
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    getByRole("link").dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it.each([
    ["ctrl", { ctrlKey: true }],
    ["meta", { metaKey: true }],
    ["shift", { shiftKey: true }],
    ["alt", { altKey: true }],
    ["middle button", { button: 1 }],
  ])("does not emit selected on a %s click of a link entry", async (_name, init) => {
    const { getByRole, emitted } = render(NavRailItem, { props: { label: "Library", href: "/library" } });
    await fireEvent.click(getByRole("link"), init);
    expect(emitted().selected).toBeUndefined();
  });

  it("keeps the button entry emitting selected with no event", async () => {
    const { getByRole, emitted } = render(NavRailItem, { props: { label: "Library" } });
    await fireEvent.click(getByRole("button"));
    expect(emitted().selected).toEqual([[]]);
  });

  it("marks an active entry aria-current=page, link or button", () => {
    const a = render(NavRailItem, { props: { label: "A", href: "/a", active: true } });
    expect(a.getByRole("link").getAttribute("aria-current")).toBe("page");
    const b = render(NavRailItem, { props: { label: "B", active: true } });
    expect(b.getByRole("button").getAttribute("aria-current")).toBe("page");
  });
});

function groupWith(props: Record<string, unknown>, activeChild = false) {
  return render(NavRailGroup, {
    props: { label: "System", collapsible: true, ...props },
    slots: { default: () => [h(NavRailItem, { label: "Logs" }), h(NavRailItem, { label: "Jobs", active: activeChild })] },
  });
}
const bodyOf = (c: Element) => c.querySelector<HTMLElement>(".ui-nav-rail__group-body")!;

describe("NavRailGroup collapsible (Vue)", () => {
  beforeEach(() => window.localStorage.clear());

  it("folds on a click of the heading and sets aria-expanded", async () => {
    const { container, getByRole } = groupWith({});
    const head = getByRole("button", { name: /System/ });
    expect(head.getAttribute("aria-expanded")).toBe("true");
    expect(head.getAttribute("aria-controls")).toBe(bodyOf(container).id);
    await fireEvent.click(head);
    expect(head.getAttribute("aria-expanded")).toBe("false");
    expect(bodyOf(container).style.display).toBe("none");
    await fireEvent.click(head);
    expect(bodyOf(container).style.display).not.toBe("none");
  });

  it("stays a plain heading when not collapsible", () => {
    const { container } = render(NavRailGroup, { props: { label: "Repos" } });
    expect(container.querySelector(".ui-nav-rail__group-toggle")).toBeNull();
    expect(container.querySelector(".ui-nav-rail__group-body")).toBeNull();
  });

  it("supports v-model:open", async () => {
    const { getByRole, emitted } = groupWith({ open: false });
    expect(getByRole("button", { name: /System/ }).getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(getByRole("button", { name: /System/ }));
    expect(emitted()["update:open"]).toEqual([[true]]);
  });

  it("remembers a fold across remounts with a storageKey", async () => {
    const first = groupWith({ storageKey: "g1" });
    await fireEvent.click(first.getByRole("button", { name: /System/ }));
    first.unmount();
    const second = groupWith({ storageKey: "g1" });
    expect(second.getByRole("button", { name: /System/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("still renders and folds when localStorage throws", async () => {
    const boom = () => { throw new Error("blocked"); };
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(boom);
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(boom);
    try {
      const { getByRole } = groupWith({ storageKey: "g1" });
      const head = getByRole("button", { name: /System/ });
      await fireEvent.click(head);
      expect(head.getAttribute("aria-expanded")).toBe("false");
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });

  it("opens a folded group that contains the active entry", async () => {
    const { getByRole, container } = groupWith({ open: false }, true);
    await nextTick();
    expect(getByRole("button", { name: /System/ }).getAttribute("aria-expanded")).toBe("true");
    expect(bodyOf(container).style.display).not.toBe("none");
  });

  it("shows the count on the heading only while folded", async () => {
    const { container, getByRole } = groupWith({ count: 3 });
    expect(container.querySelector(".ui-nav-rail__group-count")).toBeNull();
    await fireEvent.click(getByRole("button", { name: /System/ }));
    expect(container.querySelector(".ui-nav-rail__group-count")?.textContent).toContain("3");
  });

  it("has no axe violations, open and folded", async () => {
    const { container, getByRole } = groupWith({ count: 2 });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await fireEvent.click(getByRole("button", { name: /System/ }));
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("NavRail active entry in view (Vue)", () => {
  const original = Element.prototype.scrollIntoView;
  afterEach(() => { Element.prototype.scrollIntoView = original; });

  it("scrolls the active entry into view, block nearest, on mount", () => {
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    render(NavRail, {
      slots: { default: () => [h(NavRailItem, { label: "A" }), h(NavRailItem, { label: "Z", active: true })] },
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ block: "nearest" });
    expect((spy.mock.contexts[0] as HTMLElement).textContent).toContain("Z");
  });

  it("does not scroll when no entry is active", () => {
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    render(NavRail, { slots: { default: () => h(NavRailItem, { label: "A" }) } });
    expect(spy).not.toHaveBeenCalled();
  });

  it("scrolls again when the active entry changes", async () => {
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    const active = ref("a");
    render({
      render: () =>
        h(NavRail, null, { default: () => ["a", "b"].map((id) => h(NavRailItem, { label: id, active: active.value === id })) }),
    });
    spy.mockClear();
    active.value = "b";
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r));
    expect(spy).toHaveBeenCalled();
    expect((spy.mock.contexts.at(-1) as HTMLElement).textContent).toContain("b");
  });

  it("never asks for a smooth scroll (prefers-reduced-motion)", () => {
    const css = readFileSync(join(process.cwd(), "src/components/nav-rail/nav-rail.scss"), "utf8");
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce\)\s*\{[^@]*scroll-behavior:\s*auto/);
  });
});
