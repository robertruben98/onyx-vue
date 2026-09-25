import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick, ref } from "vue";
import Tabs from "./Tabs.vue";
import Tab from "./Tab.vue";

/**
 * Renders Tabs with three tabs (the third disabled), mirroring the Angular spec.
 *
 * Child `Tab`s register with the parent during their own mount, so the trigger
 * list becomes available on the following tick — the Vue equivalent of the
 * Angular spec's `await renderTabs()`. We await a `nextTick` here so callers can
 * query synchronously, exactly as the Angular tests do.
 */
async function renderTabs(index = 0) {
  const Harness = defineComponent({
    components: { Tabs, Tab },
    data() {
      return { index };
    },
    render() {
      return h(
        Tabs,
        {
          ariaLabel: "Sections",
          selectedIndex: this.index,
          "onUpdate:selectedIndex": (v: number) => {
            this.index = v;
          },
        },
        () => [
          h(Tab, { label: "One" }, () => "First panel"),
          h(Tab, { label: "Two" }, () => "Second panel"),
          h(Tab, { label: "Three", disabled: true }, () => "Third panel"),
        ],
      );
    },
  });
  const utils = render(Harness);
  await nextTick();
  return utils;
}

describe("Tabs (Vue)", () => {
  it("renders a tablist with one tab per child", async () => {
    await renderTabs();
    const list = screen.getByRole("tablist", { name: "Sections" });
    expect(list).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("selects the first tab by default and wires ARIA", async () => {
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    expect(first.getAttribute("aria-selected")).toBe("true");
    const panel = screen.getByRole("tabpanel", { name: "One" });
    expect(panel.hasAttribute("hidden")).toBe(false);
  });

  it("switches panel on click", async () => {
    await renderTabs();
    await fireEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.getByRole("tabpanel", { name: "Two" }).hasAttribute("hidden"),
    ).toBe(false);
  });

  it("moves selection with arrow keys and skips disabled tabs", async () => {
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    await fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
    // Next ArrowRight skips disabled "Three" and wraps to "One".
    await fireEvent.keyDown(screen.getByRole("tab", { name: "Two" }), {
      key: "ArrowRight",
    });
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("supports Home and End keys", async () => {
    await renderTabs(1);
    const second = screen.getByRole("tab", { name: "Two" });
    second.focus();
    await fireEvent.keyDown(second, { key: "Home" });
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
    // End lands on the last enabled tab (skips disabled "Three" -> "Two").
    await fireEvent.keyDown(screen.getByRole("tab", { name: "One" }), {
      key: "End",
    });
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("does not select a disabled tab on click", async () => {
    await renderTabs();
    await fireEvent.click(screen.getByRole("tab", { name: "Three" }));
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("applies roving tabindex to the selected tab only", async () => {
    await renderTabs();
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("tabindex"),
    ).toBe("0");
    expect(
      screen.getByRole("tab", { name: "Two" }).getAttribute("tabindex"),
    ).toBe("-1");
  });

  it("has no axe violations", async () => {
    const { container } = await renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });
});

/**
 * La hoja, leida como fuente.
 *
 * jsdom no calcula layout: no hay forma de preguntarle "¿se sale la tira?" a un
 * render de prueba, porque ahi todo mide cero. Lo que si se puede fijar es la
 * decision que evita el desbordamiento, y es la que se perdio una vez.
 */
/**
 * Una lista de pestanas que CRECE mientras se mira.
 *
 * `ORDEN` es fijo -- las pestanas no se mueven de sitio entre ejecuciones-, y
 * cada una aparece cuando hay algo que ensenar en ella. Es la vista de consola
 * de un banco de pruebas: «Completadas» no existe hasta que el run completa
 * algo, y para entonces «Info» puede llevar rato en pantalla.
 */
const ORDEN = ["Fallos", "Completadas", "Info"];

/** Las pestanas que hay ahora mismo. Fuera del componente para moverla desde el test. */
const presentes = ref<string[]>([]);

/** Llega una pestana nueva, en el sitio que le toca de ORDEN. */
async function aparece(nombre: string) {
  presentes.value = [...presentes.value, nombre];
  await nextTick();
}

function renderCreciente() {
  presentes.value = ["Fallos"];
  const Harness = defineComponent({
    components: { Tabs, Tab },
    data() {
      return { index: 0 };
    },
    render() {
      return h(
        Tabs,
        {
          ariaLabel: "Resultados",
          selectedIndex: this.index,
          "onUpdate:selectedIndex": (v: number) => {
            this.index = v;
          },
        },
        () =>
          ORDEN.filter((n) => presentes.value.includes(n)).map((n) =>
            h(Tab, { label: n, key: n }, () => `panel ${n}`),
          ),
      );
    },
  });
  return render(Harness);
}

describe("Tabs (Vue) with a list that grows", () => {
  it("opens the panel of the tab that was clicked, not the one that mounted in its place", async () => {
    // El orden de APARICION es el reves del de la lista: "Info" llega antes que
    // "Completadas", que va delante de ella. Con el indice contado al montar,
    // "Completadas" se quedaba con el numero de "Info" y abria el panel de
    // "Info" -- con su propia etiqueta encima, que es lo que lo hacia dificil
    // de ver: el rotulo lo pinta quien lo sabe, el panel lo elegia otro.
    renderCreciente();
    await aparece("Info");
    await aparece("Completadas");

    expect(screen.getAllByRole("tab").map((t) => t.textContent?.trim())).toEqual(
      ORDEN,
    );

    await fireEvent.click(screen.getByRole("tab", { name: "Completadas" }));
    await nextTick();

    // Un unico panel visible, y es el suyo.
    expect(screen.getByRole("tabpanel").textContent).toBe("panel Completadas");
  });

  it("keeps aria-controls pointing at the panel that is shown", async () => {
    // La otra mitad del mismo fallo, y la que ningun ojo ve: un lector de
    // pantalla sigue `aria-controls` y llegaba a un panel escondido.
    renderCreciente();
    await aparece("Info");
    await aparece("Completadas");

    await fireEvent.click(screen.getByRole("tab", { name: "Info" }));
    await nextTick();

    const trigger = screen.getByRole("tab", { name: "Info" });
    const panel = screen.getByRole("tabpanel");
    expect(panel.id).toBe(trigger.getAttribute("aria-controls"));
    expect(panel.textContent).toBe("panel Info");
  });

  it("survives a tab leaving and another arriving", async () => {
    // Con un contador que solo sube, una pestana que se va y otra que llega
    // dejaban el numero fuera del rango de la lista: ningun panel activo y el
    // tablist entero en blanco por debajo.
    renderCreciente();
    await aparece("Info");
    presentes.value = ["Fallos", "Completadas"];
    await nextTick();

    await fireEvent.click(screen.getByRole("tab", { name: "Completadas" }));
    await nextTick();

    expect(screen.getByRole("tabpanel").textContent).toBe("panel Completadas");
  });
});

describe("tabs stylesheet", () => {
  // Desde la raiz del proyecto y no desde `import.meta.url`: bajo jsdom vitest
  // lo reescribe a una URL de navegador y el `.pathname` no existe en disco.
  const hoja = readFileSync(
    join(process.cwd(), "src", "components", "tabs", "tabs.scss"),
    "utf8",
  );

  // Los comentarios fuera ANTES de mirar: la cabecera de cada regla explica el
  // fallo que evita, y escanear la prosa acusaria a la hoja de cometerlo.
  const css = hoja.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  /** El cuerpo de una regla, ya sin comentarios. */
  function regla(selector: string): string {
    const m = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`).exec(css);
    // A throw rather than `expect(m, msg)`: the globals typing in this repo
    // takes a single argument, and the two-argument call broke the typecheck.
    if (!m) throw new Error(`no rule for ${selector}`);
    return m[1];
  }

  it("wraps the strip instead of letting tabs spill out of it", () => {
    // Un flex en fila sin esto NO recorta lo que no cabe: lo pinta fuera del
    // contenedor, encima de lo que tenga al lado. Con siete pestanas en un
    // panel estrecho, las dos ultimas acababan fuera de la ventana.
    expect(regla(".ui-tabs__list")).toMatch(/flex-wrap:\s*wrap/);
  });

  it("keeps each label on one line rather than shrinking it", () => {
    // Encoger es lo que hace un item de flex por defecto, y aqui es la peor de
    // las dos salidas: parte la etiqueta en dos lineas y ni asi cabe la tira.
    const tab = regla(".ui-tabs__tab");
    expect(tab).toMatch(/flex:\s*0\s+0\s+auto/);
    expect(tab).toMatch(/white-space:\s*nowrap/);
  });
});
