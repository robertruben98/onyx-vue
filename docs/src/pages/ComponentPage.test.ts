import { render, screen, fireEvent } from "@testing-library/vue";
import type { Component } from "vue";
import * as onyx from "../../../src/index";
import ComponentPage from "./ComponentPage.vue";

const components: Record<string, Component> = {};
for (const [n, v] of Object.entries(onyx)) if (n.startsWith("Ui")) components[n] = v as Component;

function renderPage(id: string) {
  return render(ComponentPage, { props: { id }, global: { components } });
}

describe("component page", () => {
  it("renders the State Bar page: legend demo and its API table, no error", () => {
    const { container } = renderPage("state-bar");
    expect(screen.getByRole("heading", { level: 1, name: "State Bar" })).toBeTruthy();
    expect(container.querySelectorAll(".api tbody tr").length).toBeGreaterThan(3);
    expect(screen.getByRole("heading", { name: "Legend as filter" })).toBeTruthy();
  });

  it("API tables contain no literal backticks; they become <code>", () => {
    const { container } = renderPage("button");
    const api = container.querySelector(".api")!;
    expect(api.textContent).not.toContain("`");
    expect(api.querySelectorAll("td code").length).toBeGreaterThan(4);
  });

  it("every code block has a Copy button that copies its text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { container } = renderPage("button");
    // open the first demo's code
    await fireEvent.click(screen.getAllByRole("button", { name: "Show code" })[0]);
    const blocks = container.querySelectorAll("pre.code");
    expect(blocks.length).toBeGreaterThan(1);
    const copies = screen.getAllByRole("button", { name: /^Copy/ });
    expect(copies.length).toBe(blocks.length);
    await fireEvent.click(copies[0]);
    expect(writeText).toHaveBeenCalledWith(blocks[0].textContent!.trim());
    expect((await screen.findAllByText("Copied")).length).toBe(1);
  });
});
