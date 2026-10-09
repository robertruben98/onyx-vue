// G1: los atributos que el consumidor pone en un control tienen que llegar al
// elemento nativo que el usuario y el lector de pantalla manejan, no a la
// envoltura que lo pinta. Se renderiza cada control con unos atributos de
// sonda y se mira donde caen.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import * as onyx from "../src/index";

/** Control -> selector del elemento nativo que debe recibir los atributos. */
const CONTROLS: Record<string, { selector: string; props?: Record<string, unknown> }> = {
  UiButton: { selector: "button" },
  UiIconButton: { selector: "button", props: { label: "probe" } },
  UiConfirmButton: { selector: "button", props: { label: "probe" } },
  UiInput: { selector: "input" },
  UiTextarea: { selector: "textarea" },
  UiCheckbox: { selector: "input" },
  UiSwitch: { selector: "input, [role=switch]" },
  UiSelect: { selector: "[role=combobox]", props: { options: [{ value: "a", label: "A" }] } },
  UiSlider: { selector: "input[type=range]", props: { ariaLabel: "probe" } },
  UiDateInput: { selector: "input", props: { ariaLabel: "probe" } },
};

const PROBE = {
  "aria-describedby": "probe-desc",
  "data-probe": "yes",
  autocomplete: "off",
};

it("forwarding", () => {
  const results = Object.entries(CONTROLS).map(([name, spec]) => {
    const comp = (onyx as Record<string, unknown>)[name];
    const { container, unmount } = render(comp as never, {
      props: spec.props ?? {},
      attrs: PROBE,
      slots: { default: "probe" },
    });
    const target = container.querySelector(spec.selector);
    const missing = Object.keys(PROBE).filter(
      (k) => !(target && target.getAttribute(k) === (PROBE as Record<string, string>)[k]),
    );
    unmount();
    return { name, ok: missing.length === 0, missing };
  });
  const dir = join(process.cwd(), "scorecard", ".out");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "forwarding.json"), JSON.stringify(results, null, 2));
  expect(results.length).toBe(Object.keys(CONTROLS).length);
});
