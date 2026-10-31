import { render, screen } from "@testing-library/vue";
import { computeAccessibleName } from "dom-accessibility-api";
import { axe } from "jest-axe";
import FormField from "./FormField.vue";
import { UiInput } from "../input";
import { UiTextarea } from "../textarea";
import { UiSelect } from "../select";
import { UiCheckbox } from "../checkbox";
import { UiRadioGroup } from "../radio-group";
import { UiSwitch } from "../switch";
import { UiDateInput } from "../date-input";
import { UiSlider } from "../slider";
import { UiSegmented } from "../segmented";

const components = { FormField, UiInput, UiTextarea, UiSelect, UiCheckbox, UiRadioGroup, UiSwitch, UiDateInput, UiSlider, UiSegmented };

// Cover every field-context consumer, including groups whose containers cannot
// be named by a native label's `for` attribute.
describe("Form control accessible-name contract", () => {
  it.each([
    ["UiInput", "textbox"],
    ["UiTextarea", "textbox"],
    ["UiSelect", "combobox"],
    ["UiCheckbox", "checkbox"],
    ["UiRadioGroup", "radiogroup"],
    ["UiSwitch", "switch"],
    ["UiSlider", "slider"],
    ["UiSegmented", "radiogroup"],
  ])("%s is named exactly by its field", (component, role) => {
    render({
      components,
      template: `<FormField label="Name"><${component} :options="[{ value: 'a', label: 'Option A' }]" /></FormField>`,
    });
    expect(screen.getByRole(role, { name: "Name" })).toBeTruthy();
  });

  it.each(["UiRadioGroup", "UiSegmented"])("%s inherits field metadata on the named group", async (component) => {
    const { container } = render({
      components,
      template: `<FormField label="Name" help="Hint" error="Error" required><${component} :options="[{ value: 'a', label: 'Option A' }]" /></FormField>`,
    });
    const group = screen.getByRole("radiogroup", { name: "Name" });
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-describedby")?.split(" ").map((id) => document.getElementById(id)?.textContent)).toEqual(["Hint", "Error"]);
    expect(screen.getByRole("radio", { name: "Option A" })).toBeTruthy();
    expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it.each(["UiRadioGroup", "UiSegmented"])("%s preserves an explicit group name", (component) => {
    render({
      components,
      template: `<FormField label="Name"><${component} aria-label="Custom" :options="[{ value: 'a', label: 'Option A' }]" /></FormField>`,
    });
    expect(screen.getByRole("radiogroup", { name: "Custom" })).toBeTruthy();
  });

  it.each(["date", "time", "datetime-local"])("UiDateInput (%s) is named exactly by its field", (type) => {
    render({ components, template: `<FormField label="Name"><UiDateInput type="${type}" /></FormField>` });
    // Date/time inputs have no implicit ARIA role (also in browsers), so a
    // getByRole assertion would be invalid. jsdom can verify their name.
    expect(computeAccessibleName(screen.getByLabelText("Name", { exact: true }))).toBe("Name");
  });
});
