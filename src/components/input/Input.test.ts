import { defineComponent, h, ref } from "vue";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Input from "./Input.vue";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("Input (Vue)", () => {
  it("associates a visible label with the input", () => {
    render(Input, { props: { label: "Email" } });
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(Input, { props: { ariaLabel: "Search" } });
    expect(screen.getByLabelText("Search")).toBeTruthy();
  });

  it("emits valueChange as the user types", async () => {
    const { emitted } = render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    await fireEvent.update(el, "abc");
    expect(emitted().valueChange).toBeTruthy();
    expect(emitted().valueChanged).toBeTruthy();
    expect(emitted().valueChange.at(-1)).toEqual(["abc"]);
    expect(emitted().valueChanged.at(-1)).toEqual(["abc"]);
  });

  it("supports v-model via update:modelValue", async () => {
    const { emitted } = render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    await fireEvent.update(el, "hello");
    expect(emitted()["update:modelValue"].at(-1)).toEqual(["hello"]);
  });

  it("writes the modelValue into the input", () => {
    render(Input, { props: { label: "Name", modelValue: "initial" } });
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "initial",
    );
  });

  it("is reachable by keyboard (focusable)", () => {
    render(Input, { props: { label: "Name" } });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    el.focus();
    expect(document.activeElement).toBe(el);
  });

  it("reflects invalid state via aria-invalid", () => {
    render(Input, { props: { label: "Name", invalid: true } });
    expect(
      screen.getByLabelText("Name").getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("does NOT emit when disabled", async () => {
    const { emitted } = render(Input, {
      props: { label: "Name", disabled: true },
    });
    const el = screen.getByLabelText("Name") as HTMLInputElement;
    expect(el.disabled).toBe(true);
    await fireEvent.input(el, { target: { value: "abc" } });
    expect(emitted().valueChange).toBeFalsy();
    expect(emitted().valueChanged).toBeFalsy();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(Input, { props: { label: "Email" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = render(Input, {
      props: { label: "Email", invalid: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(Input, {
      props: { label: "Email", disabled: true },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  // Un `ref` sobre <UiInput> apunta a la INSTANCIA del componente, no a un
  // elemento: el intento natural de enfocar (`ref.querySelector("input")`)
  // lanza "querySelector is not a function" y el foco se queda en el body.
  it("focuses the native input through the exposed focus()", async () => {
    let enfocar: (() => void) | null = null;
    const Host = defineComponent({
      components: { Input },
      setup() {
        const caja = ref<{ focus: () => void } | null>(null);
        enfocar = () => caja.value?.focus();
        return { caja };
      },
      template: '<Input ref="caja" aria-label="Filtrar" />',
    });
    render(Host);
    const nativo = screen.getByRole("textbox");
    expect(document.activeElement).not.toBe(nativo);
    enfocar!();
    expect(document.activeElement).toBe(nativo);
  });

  it("selects the current value through the exposed select()", async () => {
    let seleccionar: (() => void) | null = null;
    const Host = defineComponent({
      components: { Input },
      setup() {
        const caja = ref<{ select: () => void } | null>(null);
        seleccionar = () => caja.value?.select();
        return { caja };
      },
      template: '<Input ref="caja" aria-label="Filtrar" model-value="hola" />',
    });
    render(Host);
    const nativo = screen.getByRole("textbox") as HTMLInputElement;
    seleccionar!();
    expect(nativo.selectionStart).toBe(0);
    expect(nativo.selectionEnd).toBe("hola".length);
  });

  it("gives independent ids to two instances so each label targets its own input", () => {
    const { container } = render({
      render() {
        return h("div", [h(Input, { label: "First" }), h(Input, { label: "Second" })]);
      },
    });
    const inputs = [...container.querySelectorAll("input")];
    const labels = [...container.querySelectorAll("label")];
    expect(inputs.length).toBe(2);
    const ids = inputs.map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
    labels.forEach((label, i) => {
      expect(label.getAttribute("for")).toBe(inputs[i].id);
    });
  });


  it("is inline by default and fills its column with fluid", () => {
    const { container, unmount } = render(Input, { props: { ariaLabel: "Notes" } });
    expect(container.querySelector(".ui-input--fluid")).toBeNull();
    unmount();
    const fluid = render(Input, { props: { ariaLabel: "Notes", fluid: true } });
    expect(fluid.container.querySelector(".ui-input--fluid")).toBeTruthy();
  });

  it("readonly keeps the value readable: not disabled, not editable", () => {
    render(Input, { props: { ariaLabel: "Your answer", readonly: true, modelValue: "I have gone" } });
    const el = screen.getByRole("textbox", { name: "Your answer" }) as HTMLInputElement;
    expect(el.readOnly).toBe(true);
    expect(el.disabled).toBe(false);
    expect(el.value).toBe("I have gone");
  });

  it("is not readonly by default", () => {
    render(Input, { props: { ariaLabel: "Notes" } });
    expect(screen.getByRole("textbox").hasAttribute("readonly")).toBe(false);
  });

  it("variant pill adds the class and a decorative search glyph", () => {
    const { container } = render(Input, { props: { variant: "pill", type: "search", ariaLabel: "Search" } });
    expect(container.querySelector(".ui-input--pill")).not.toBeNull();
    const glyph = container.querySelector(".ui-input__glyph");
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("input")?.getAttribute("aria-label")).toBe("Search");
  });

  it("the default variant has no glyph and no pill class", () => {
    const { container } = render(Input, { props: { ariaLabel: "Name" } });
    expect(container.querySelector(".ui-input--pill")).toBeNull();
    expect(container.querySelector(".ui-input__glyph")).toBeNull();
  });

  it("pill: clicking the field wrapper outside the input focuses it", async () => {
    const { container } = render(Input, { props: { variant: "pill", ariaLabel: "Search" } });
    await fireEvent.click(container.querySelector(".ui-input__field")!);
    expect(document.activeElement).toBe(container.querySelector("input"));
  });
  describe("leading / trailing / clearable", () => {
    it('icon="search" renders a decorative leading icon inside the field', () => {
      const { container } = render(Input, { props: { ariaLabel: "Q", icon: "search" } });
      const glyph = container.querySelector(".ui-input__field .ui-input__glyph");
      expect(glyph).toBeTruthy();
      expect(glyph!.getAttribute("aria-hidden")).toBe("true");
    });

    it("has no icon by default", () => {
      const { container } = render(Input, { props: { ariaLabel: "Q" } });
      expect(container.querySelector(".ui-input__glyph")).toBeNull();
    });

    it("pill + icon=search renders a single glyph", () => {
      const { container } = render(Input, {
        props: { ariaLabel: "Q", variant: "pill", icon: "search" },
      });
      expect(container.querySelectorAll(".ui-input__glyph").length).toBe(1);
    });

    it("renders the leading and trailing slots; leading replaces the icon", () => {
      const { container } = render(Input, {
        props: { ariaLabel: "Q", icon: "search" },
        slots: {
          leading: '<b data-testid="lead">L</b>',
          trailing: '<i data-testid="trail">T</i>',
        },
      });
      expect(screen.getByTestId("lead")).toBeTruthy();
      expect(screen.getByTestId("trail")).toBeTruthy();
      expect(container.querySelector(".ui-input__glyph")).toBeNull();
    });

    it("clearable shows a button named by the locale text when the value is not empty", () => {
      render(Input, { props: { ariaLabel: "Q", clearable: true, modelValue: "abc" } });
      expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    });

    it("does not render the clear button when the value is empty", () => {
      render(Input, { props: { ariaLabel: "Q", clearable: true, modelValue: "" } });
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("does not render the clear button without clearable", () => {
      render(Input, { props: { ariaLabel: "Q", modelValue: "abc" } });
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("does not render the clear button when disabled or readonly", () => {
      const a = render(Input, { props: { ariaLabel: "A", clearable: true, modelValue: "x", disabled: true } });
      expect(a.queryByRole("button")).toBeNull();
      a.unmount();
      const b = render(Input, { props: { ariaLabel: "B", clearable: true, modelValue: "x", readonly: true } });
      expect(b.queryByRole("button")).toBeNull();
    });

    it("clicking clear empties the value, emits cleared and focuses the input", async () => {
      const { emitted } = render(Input, {
        props: { ariaLabel: "Q", clearable: true, modelValue: "abc" },
      });
      await fireEvent.click(screen.getByRole("button", { name: "Clear" }));
      expect(emitted()["update:modelValue"].at(-1)).toEqual([""]);
      expect(emitted().valueChanged.at(-1)).toEqual([""]);
      expect(emitted().cleared).toHaveLength(1);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("Escape clears when clearable and the value is not empty", async () => {
      const { emitted } = render(Input, {
        props: { ariaLabel: "Q", clearable: true, modelValue: "abc" },
      });
      await fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
      expect(emitted()["update:modelValue"].at(-1)).toEqual([""]);
      expect(emitted().cleared).toHaveLength(1);
    });

    it("Escape does nothing without clearable", async () => {
      const { emitted } = render(Input, { props: { ariaLabel: "Q", modelValue: "abc" } });
      await fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
      expect(emitted().cleared).toBeUndefined();
    });

    it("keeps type=search semantics", () => {
      render(Input, { props: { ariaLabel: "Q", type: "search", clearable: true, modelValue: "a" } });
      expect(screen.getByRole("searchbox")).toBeTruthy();
    });

    it("has no axe violations with icon + clearable", async () => {
      const { container } = render(Input, {
        props: { ariaLabel: "Q", icon: "search", clearable: true, modelValue: "abc" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });
  });
});
