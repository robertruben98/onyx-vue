import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick, ref } from "vue";
import CourseSwitcher from "./CourseSwitcher.vue";

const scss = readFileSync(join(process.cwd(), "src", "components", "course-switcher", "course-switcher.scss"), "utf8");
const body = (selector: string) => {
  const at = scss.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`no rule for ${selector}`);
  return scss.slice(at, scss.indexOf("}", at));
};

const OPTIONS = [
  { value: "en", label: "English" },
  { value: "no", label: "Norsk" },
  { value: "de", label: "German", disabled: true },
  { value: "fr", label: "French" },
];

const ICON = `<template #icon="{ option, selected, place }"><i :data-icon="option.value + ':' + place + ':' + selected" /></template>`;

/** A host with a working v-model, like an app would use it. */
function host(extra: Record<string, unknown> = {}, slots = ICON) {
  return defineComponent({
    components: { CourseSwitcher },
    setup() {
      const course = ref("en");
      const open = ref(false);
      return { course, open, extra };
    },
    template: `<header class="ui-app-bar"><CourseSwitcher v-model="course" v-model:open="open" :options="OPTIONS" label="Course: English, score 56" badge="56" panel-label="Choose a course" v-bind="extra">${slots}<template #detail><a href="#score">More about your score</a></template></CourseSwitcher></header><span data-testid="model">{{ course }}</span>`,
    data: () => ({ OPTIONS }),
  });
}

const trigger = () => screen.getByRole("button", { name: "Course: English, score 56" });
const tile = (name: string) => screen.getByRole("button", { name });

function mockSheet(matches: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((q: string) => ({
    matches,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe("CourseSwitcher (Vue)", () => {
  it("renders a closed trigger with the current course's icon, the badge and the a11y attributes", () => {
    const { container } = render(host());
    const btn = trigger();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
    expect(btn.getAttribute("aria-controls")).toMatch(/^ui-course-switcher-panel-/);
    expect(btn.textContent).toContain("56");
    expect(container.querySelector("[data-icon]")?.getAttribute("data-icon")).toBe("en:trigger:true");
    expect(btn.querySelector(".ui-course-switcher__trigger-icon")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a named dialog, focuses the selected tile and marks it pressed and current", async () => {
    const { emitted } = render(CourseSwitcher, {
      props: { options: OPTIONS, modelValue: "no", label: "Course: Norsk", panelLabel: "Choose a course" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Course: Norsk" }));
    await nextTick();
    const dialog = screen.getByRole("dialog", { name: "Choose a course" });
    expect(screen.getByRole("button", { name: "Course: Norsk" }).getAttribute("aria-expanded")).toBe("true");
    expect(dialog.id).toBe(screen.getByRole("button", { name: "Course: Norsk" }).getAttribute("aria-controls"));
    expect(screen.getByRole("group", { name: "Courses" })).toBeTruthy();
    expect(document.activeElement).toBe(tile("Norsk"));
    expect(tile("Norsk").getAttribute("aria-pressed")).toBe("true");
    expect(tile("Norsk").getAttribute("aria-current")).toBe("true");
    expect(tile("English").getAttribute("aria-pressed")).toBe("false");
    expect(tile("English").hasAttribute("aria-current")).toBe(false);
    expect((tile("German") as HTMLButtonElement).disabled).toBe(true);
    // Una sola parada de Tab en la fila: la ficha elegida.
    expect(tile("Norsk").getAttribute("tabindex")).toBe("0");
    expect(tile("English").getAttribute("tabindex")).toBe("-1");
    expect(emitted().opened).toHaveLength(1);
  });

  it("switches course, closes and hands focus back to the trigger", async () => {
    render(host());
    await fireEvent.click(trigger());
    await nextTick();
    await fireEvent.click(tile("Norsk"));
    await nextTick();
    await nextTick();
    expect(screen.getByTestId("model").textContent).toBe("no");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("emits update:modelValue and changed only for an enabled course other than the current", async () => {
    const { emitted } = render(CourseSwitcher, { props: { options: OPTIONS, modelValue: "en", label: "Course", open: true } });
    await nextTick();
    await fireEvent.click(tile("German"));
    await fireEvent.click(tile("English"));
    expect(emitted()["update:modelValue"]).toBeFalsy();
    expect(emitted().changed).toBeFalsy();
    // Tocar el curso actual cierra el panel.
    expect(emitted()["update:open"]?.[0]).toEqual([false]);
  });

  it("keeps the panel open with closeOnSelect false and blocks picks while busy", async () => {
    const { emitted, rerender } = render(CourseSwitcher, {
      props: { options: OPTIONS, modelValue: "en", label: "Course", open: true, closeOnSelect: false, busy: true },
    });
    await nextTick();
    expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe("true");
    expect(tile("Norsk").getAttribute("aria-disabled")).toBe("true");
    await fireEvent.click(tile("Norsk"));
    expect(emitted().changed).toBeFalsy();
    await rerender({ busy: false });
    await fireEvent.click(tile("Norsk"));
    expect(emitted().changed?.[0]).toEqual(["no"]);
    expect(emitted()["update:open"]).toBeFalsy();
  });

  it("follows the model when the parent refuses the change", async () => {
    const asked: string[] = [];
    const Refusing = defineComponent({
      setup() {
        // Un padre que pregunta y se queda donde estaba (guarda de salida).
        return () =>
          h(CourseSwitcher, {
            options: OPTIONS,
            modelValue: "en",
            open: true,
            label: "Course",
            "onUpdate:modelValue": (v: string) => asked.push(v),
          });
      },
    });
    render(Refusing);
    await nextTick();
    await fireEvent.click(tile("Norsk"));
    await nextTick();
    await nextTick();
    expect(asked).toEqual(["no"]);
    expect(tile("Norsk").getAttribute("aria-pressed")).toBe("false");
    expect(tile("English").getAttribute("aria-pressed")).toBe("true");
    expect(tile("English").getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("dialog")).toBeTruthy();
    // Volver a tocar la rechazada pregunta otra vez.
    await fireEvent.click(tile("Norsk"));
    expect(asked).toEqual(["no", "no"]);
  });

  it("moves between enabled tiles with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(host());
    await user.click(trigger());
    await nextTick();
    expect(document.activeElement).toBe(tile("English"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tile("Norsk"));
    await user.keyboard("{ArrowRight}");
    // German esta deshabilitado: se salta.
    expect(document.activeElement).toBe(tile("French"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tile("English"));
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tile("French"));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(tile("English"));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(tile("French"));
    expect(tile("French").getAttribute("tabindex")).toBe("0");
    await user.keyboard("{Enter}");
    await nextTick();
    expect(screen.getByTestId("model").textContent).toBe("fr");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const { emitted } = render(CourseSwitcher, { props: { options: OPTIONS, modelValue: "en", label: "Course" } });
    await user.click(screen.getByRole("button", { name: "Course" }));
    await nextTick();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.keyboard("{Escape}");
    await nextTick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Course" }));
    expect(emitted().closed).toHaveLength(1);
  });

  it("closes on a tap outside the panel (the backdrop)", async () => {
    render(host());
    await fireEvent.click(trigger());
    await nextTick();
    await fireEvent.click(document.querySelector(".ui-course-switcher__backdrop")!);
    await nextTick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("on a phone is a modal sheet that traps focus", async () => {
    const restore = mockSheet(true);
    try {
      const user = userEvent.setup();
      render(host());
      await user.click(trigger());
      await nextTick();
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(document.querySelector(".ui-course-switcher__layer--sheet")).toBeTruthy();
      // Fichas (una parada) y el enlace del detalle: Tab da la vuelta dentro.
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "More about your score" }));
      await user.tab();
      expect(document.activeElement).toBe(tile("English"));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "More about your score" }));
      // Tras moverse a otra ficha, la vuelta cae en esa ficha (la de la parada), no en la primera.
      await user.tab();
      await user.keyboard("{End}");
      await user.tab();
      await user.tab();
      expect(document.activeElement).toBe(tile("French"));
    } finally {
      restore();
    }
  });

  it("on a wide screen is a popover that closes when focus leaves it", async () => {
    const restore = mockSheet(false);
    try {
      const user = userEvent.setup();
      const Page = defineComponent({
        components: { Host: host() },
        template: `<div><Host /><button>After</button></div>`,
      });
      render(Page);
      await user.click(trigger());
      await nextTick();
      expect(screen.getByRole("dialog").hasAttribute("aria-modal")).toBe(false);
      // Tab despues del ultimo control: se cierra y el foco sigue tras el boton
      // (el panel vive al final de body; sin esto saldria de la pagina).
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "More about your score" }));
      await user.tab();
      await nextTick();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
      // Shift+Tab desde la ficha: se cierra y vuelve al boton.
      await user.click(trigger());
      await nextTick();
      await user.tab({ shift: true });
      await nextTick();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger());
      // Foco a otro sitio (un clic): se cierra sin robarlo.
      await user.click(trigger());
      await nextTick();
      screen.getByRole("button", { name: "After" }).focus();
      await nextTick();
      expect(screen.queryByRole("dialog")).toBeNull();
      // No le roba el foco a donde ha ido.
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    } finally {
      restore();
    }
  });

  it("uses two letters when there is no icon slot", async () => {
    render(CourseSwitcher, { props: { options: OPTIONS, modelValue: "fr", label: "Course" } });
    expect(screen.getByRole("button", { name: "Course" }).textContent).toContain("Fr");
  });

  it("has no axe violations, closed and open", async () => {
    const { container } = render(host());
    expect(await axe(container)).toHaveNoViolations();
    await fireEvent.click(trigger());
    await nextTick();
    // El panel va a body (Teleport); "region" es una regla de pagina, no del componente.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it("styles: outline focus rings, 44px targets, a selected ring and reduced motion", () => {
    expect(body(".ui-course-switcher__tile:focus-visible")).toMatch(/outline:\s*var\(--ui-focus-ring-width\) solid var\(--ui-focus-ring\)/);
    expect(body(".ui-course-switcher__trigger:focus-visible")).toMatch(/outline:\s*var\(--ui-focus-ring-width\) solid var\(--ui-focus-ring\)/);
    expect(body(".ui-course-switcher__trigger")).toMatch(/min-width:\s*44px/);
    expect(body(".ui-course-switcher__tile")).toMatch(/min-height:\s*max\(44px/);
    expect(scss).toMatch(/\.ui-course-switcher__tile--selected,[^{]*\{\s*border-color:\s*var\(--ui-course-switcher-tile-selected-border\)/);
    expect(scss).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.ui-course-switcher__panel \{\s*animation: none/);
    // La fila reutiliza el recorrido de UiChipRow (inset para el primer/ultimo y el anillo).
    render(CourseSwitcher, { props: { options: OPTIONS, modelValue: "en", label: "Course", open: true } });
    expect(document.querySelector(".ui-course-switcher__tiles")?.classList.contains("ui-chip-row--scroll")).toBe(true);
  });
});
