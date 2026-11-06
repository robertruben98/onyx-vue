import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import SimpleTable from "./SimpleTable.vue";
import * as lib from "../../index";

const axeOptions = { rules: { region: { enabled: false } } };

const columns = [
  { key: "name", label: "Name" },
  { key: "port", label: "Port", align: "end" as const, mono: true },
  { key: "note", label: "Note", muted: true, hideBelow: 600 },
];
const rows = [
  { id: "a", name: "api", port: 8000, note: "main" },
  { id: "b", name: "web", port: 4200, note: "ui" },
];

function setViewport(width: number): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
}

afterEach(() => setViewport(1024));

describe("SimpleTable (Vue)", () => {
  it("renders a native table with scoped column headers in a labelled, focusable region", () => {
    const { container } = render(SimpleTable, { props: { columns, rows, ariaLabel: "Services" } });
    const region = screen.getByRole("region", { name: "Services" });
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.querySelector("table")).toBeTruthy();
    expect(container.querySelector("table")!.getAttribute("role")).toBeNull();
    const ths = container.querySelectorAll("thead th");
    expect(ths).toHaveLength(3);
    ths.forEach((th) => expect(th.getAttribute("scope")).toBe("col"));
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  it("scrolls inside its wrapper instead of the page (CSS contract)", () => {
    const css = readFileSync(join(process.cwd(), "src", "components", "simple-table", "simple-table.scss"), "utf8");
    const wrapper = css.match(/\.ui-simple-table\s*\{[^}]*\}/)![0];
    expect(wrapper).toMatch(/overflow-x:\s*auto/);
    expect(wrapper).toMatch(/max-width:\s*100%/);
  });

  it("renders the empty slot and omits the body when rows is empty", () => {
    const { container } = render(SimpleTable, {
      props: { columns, rows: [], ariaLabel: "Services" },
      slots: { empty: "<p>Nothing here</p>" },
    });
    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(container.querySelector("tbody")).toBeNull();
  });

  it("applies mono and muted classes to cells and headers", () => {
    const { container } = render(SimpleTable, { props: { columns, rows, ariaLabel: "S" } });
    const cells = container.querySelectorAll("tbody tr:first-child td");
    expect(cells[1].classList.contains("ui-simple-table__cell--mono")).toBe(true);
    expect(cells[1].classList.contains("ui-simple-table__cell--end")).toBe(true);
    expect(cells[2].classList.contains("ui-simple-table__cell--muted")).toBe(true);
    expect(cells[0].classList.contains("ui-simple-table__cell--mono")).toBe(false);
  });

  it("uses only tokens for mono/muted (no hard-coded colours)", () => {
    const css = readFileSync(join(process.cwd(), "src", "components", "simple-table", "simple-table.scss"), "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\(/);
    expect(css).toMatch(/--ui-color-text-muted/);
    expect(css).toMatch(/--ui-font-family-mono/);
  });

  it("drops a hideBelow column (header and cells) under its breakpoint", () => {
    setViewport(400);
    const { container } = render(SimpleTable, { props: { columns, rows, ariaLabel: "S" } });
    expect(container.querySelectorAll("thead th")).toHaveLength(2);
    expect(container.querySelectorAll("tbody tr:first-child td")).toHaveLength(2);
    expect(screen.queryByText("Note")).toBeNull();
  });

  it("keeps a hideBelow column on a wide viewport", () => {
    setViewport(1024);
    render(SimpleTable, { props: { columns, rows, ariaLabel: "S" } });
    expect(screen.getByText("Note")).toBeTruthy();
  });

  it("lets a cell-<key> slot override a cell", () => {
    render(SimpleTable, {
      props: { columns, rows, ariaLabel: "S" },
      slots: { "cell-name": `<template #cell-name="{ row }"><a href="#">{{ row.name }}!</a></template>` },
    });
    expect(screen.getByRole("link", { name: "api!" })).toBeTruthy();
  });

  it("paints a per-cell tone from the tone callback", () => {
    const { container } = render(SimpleTable, {
      props: {
        columns,
        rows,
        ariaLabel: "S",
        tone: (row: Record<string, any>, col: { key: string }) =>
          col.key === "port" && row.port === 8000 ? "danger" : undefined,
      },
    });
    const cells = container.querySelectorAll("tbody td");
    expect(cells[1].classList.contains("ui-simple-table__cell--danger")).toBe(true);
    expect(cells[4].classList.contains("ui-simple-table__cell--danger")).toBe(false);
  });

  it("supports a function rowKey and the dense modifier", () => {
    const { container } = render(SimpleTable, {
      props: { columns, rows, ariaLabel: "S", dense: true, rowKey: (r: Record<string, any>) => r.name },
    });
    expect(container.querySelector(".ui-simple-table__table")!.classList.contains("ui-simple-table__table--dense")).toBe(true);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  it("is exported from the library entry", () => {
    expect(lib.UiSimpleTable).toBeTruthy();
    expect(lib.simpleTableDoc.id).toBe("simple-table");
  });

  it("has no axe violations", async () => {
    const { container } = render(SimpleTable, { props: { columns, rows, ariaLabel: "Services" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
