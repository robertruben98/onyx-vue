import { render, screen } from "@testing-library/vue";
import { computeAccessibleName } from "dom-accessibility-api";
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
    expect(screen.getByRole(role, { name: "Name", exact: true })).toBeTruthy();
  });

  it.each(["date", "time", "datetime-local"])("UiDateInput (%s) is named exactly by its field", (type) => {
    render({ components, template: `<FormField label="Name"><UiDateInput type="${type}" /></FormField>` });
    // Date/time inputs have no implicit ARIA role (also in browsers), so a
    // getByRole assertion would be invalid. jsdom can verify their name.
    expect(computeAccessibleName(screen.getByLabelText("Name", { exact: true }))).toBe("Name");
  });
});
