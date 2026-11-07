import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { createRouter, createMemoryHistory } from "vue-router";
import * as onyx from "../../src/index";
import DocSearch from "./DocSearch.vue";

function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:p(.*)*", component: { template: "<div />" } }],
  });
  const view = render(DocSearch, {
    global: { plugins: [router], components: { UiDialog: onyx.UiDialog, UiInput: onyx.UiInput } },
  });
  return { router, ...view };
}

describe("docs search", () => {
  it("opens with '/' and finds Data Table by typing 'table'", async () => {
    setup();
    expect(screen.queryByRole("dialog")).toBeNull();
    await fireEvent.keyDown(document.body, { key: "/" });
    const input = await screen.findByRole("combobox");
    await fireEvent.update(input, "table");
    expect(await screen.findByRole("option", { name: /Data Table/ })).toBeTruthy();
  });

  it("opens with Ctrl+K and with Cmd+K, and closes on Escape", async () => {
    setup();
    await fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    expect(await screen.findByRole("dialog")).toBeTruthy();
    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await fireEvent.keyDown(document.body, { key: "k", metaKey: true });
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("does not hijack '/' typed into a text field", async () => {
    setup();
    const field = document.createElement("input");
    document.body.appendChild(field);
    await fireEvent.keyDown(field, { key: "/" });
    expect(screen.queryByRole("dialog")).toBeNull();
    field.remove();
  });

  it("Enter on the active result navigates to it and closes", async () => {
    const { router } = setup();
    await fireEvent.keyDown(document.body, { key: "/" });
    const input = await screen.findByRole("combobox");
    await fireEvent.update(input, "data table");
    await fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/components/data-table"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
