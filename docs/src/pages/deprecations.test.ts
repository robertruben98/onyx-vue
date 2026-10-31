import { render, screen, within } from "@testing-library/vue";
import { DEPRECATED_EVENTS } from "../../../src/deprecations";
import { LEGACY_TONES } from "../../../src/internal/tone";
import InstallationPage from "./InstallationPage.vue";

it("generates the migration tables from the event and tone maps", () => {
  render(InstallationPage, { global: { stubs: { RouterLink: true } } });
  expect(screen.getByRole("heading", { name: "Deprecations and 1.0" })).toBeTruthy();
  for (const [label, map] of [["Deprecated events", DEPRECATED_EVENTS], ["Deprecated tones", LEGACY_TONES]] as const) {
    const table = within(screen.getByRole("table", { name: label }));
    expect(table.getAllByRole("row")).toHaveLength(Object.keys(map).length + 1);
    for (const [oldName, newName] of Object.entries(map)) {
      expect(table.getByRole("cell", { name: oldName, exact: true })).toBeTruthy();
      expect(table.getByRole("cell", { name: newName, exact: true })).toBeTruthy();
    }
  }
});
