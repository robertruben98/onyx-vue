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
    expect(emitted().valueChange.at(-1)).toEqual(["abc"]);
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

});
