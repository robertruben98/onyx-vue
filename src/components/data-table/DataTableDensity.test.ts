import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import DataTable from "./DataTable.vue";
import type { DataTableColumn } from "./DataTable.vue";

interface Row {
  id: number;
  name: string;
  note: string;
  amount: number;
}

const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "note", header: "Note", field: "note" },
  { id: "amount", header: "Amount", field: "amount" },
];

const ROWS: Row[] = [
  { id: 1, name: "Ada", note: "a very long secondary line", amount: 10 },
  { id: 2, name: "Grace", note: "short", amount: 2000 },
  { id: 3, name: "Alan", note: "another note", amount: 3 },
  { id: 4, name: "Linus", note: "last", amount: 44 },
];

const read = (...p: string[]) => readFileSync(join(process.cwd(), ...p), "utf8");
const scss = read("src/components/data-table/data-table.scss");

/** The body of the first rule whose selector is exactly `selector`. */
function rule(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return "";
  return css.slice(start, css.indexOf("}", start));
}

function renderTable(props: Record<string, unknown> = {}) {
  return render(DataTable, {
    props: { caption: "People", columns: COLUMNS, rows: ROWS, rowKey: "id", mode: "plain", ...props },
  });
}

describe("DataTable density", () => {
  it("compact marks the root and maps the padding to a space token", () => {
    const { container } = renderTable({ density: "compact" });
    expect(container.querySelector(".ui-data-table")!.classList.contains("ui-data-table--compact")).toBe(true);
    const compact = rule(scss, ".ui-data-table--compact");
    expect(compact).toContain("--ui-data-table-cell-padding-y-compact");
    expect(compact).not.toMatch(/\d+px/);
    expect(read("src/styles/tokens.css")).toMatch(
      /--ui-data-table-cell-padding-y-compact:\s*var\(--ui-space-\d+\)/,
    );
  });

  it("comfortable (default) does not add the compact class", () => {
    const { container } = renderTable();
    expect(container.querySelector(".ui-data-table--compact")).toBeNull();
    const c2 = renderTable({ density: "comfortable" });
    expect(c2.container.querySelector(".ui-data-table--compact")).toBeNull();
  });
});

describe("DataTable striped", () => {
  it("marks alternate body rows only when striped", () => {
    const { container } = renderTable({ striped: true });
    const rows = [...container.querySelectorAll(".ui-dt__body > [role=row]")];
    expect(rows.map((r) => r.classList.contains("ui-dt__tr--striped"))).toEqual([false, true, false, true]);
  });

  it("does not stripe by default", () => {
    const { container } = renderTable();
    expect(container.querySelector(".ui-dt__tr--striped")).toBeNull();
  });

  it("paints the stripe with --ui-data-table-stripe-bg", () => {
    expect(rule(scss, ".ui-dt__tr--striped")).toContain("var(--ui-data-table-stripe-bg)");
  });

  it.each(["console", "matrix", "pocket", "classroom", "acme"])(
    "the %s preset defines --ui-data-table-stripe-bg",
    (preset) => {
      expect(read("src/styles", `${preset}.css`)).toMatch(/--ui-data-table-stripe-bg\s*:/);
    },
  );
});

describe("DataTable clamp", () => {
  const cols: DataTableColumn<Row>[] = [
    COLUMNS[0],
    { ...COLUMNS[1], clamp: 2 },
    COLUMNS[2],
  ];

  it("wraps a clamped cell's content and carries the line count", () => {
    const { container } = renderTable({ columns: cols });
    const clamps = container.querySelectorAll<HTMLElement>(".ui-dt__clamp");
    expect(clamps).toHaveLength(ROWS.length);
    expect(clamps[0].style.getPropertyValue("--ui-dt-clamp")).toBe("2");
    expect(clamps[0].textContent!.trim()).toBe("a very long secondary line");
  });

  it("gives the full text on hover through title", () => {
    const { container } = renderTable({ columns: cols });
    expect(container.querySelector(".ui-dt__clamp")!.getAttribute("title")).toBe("a very long secondary line");
  });

  it("does not wrap columns without clamp", () => {
    const { container } = renderTable();
    expect(container.querySelector(".ui-dt__clamp")).toBeNull();
  });

  it("limits the lines in CSS and clips the overflow", () => {
    const css = rule(scss, ".ui-dt__clamp");
    expect(css).toContain("-webkit-line-clamp: var(--ui-dt-clamp)");
    expect(css).toContain("-webkit-box-orient: vertical");
    expect(css).toContain("overflow: hidden");
  });

  it("keeps a custom cell slot inside the clamp", () => {
    const { container } = render(DataTable, {
      props: { caption: "x", columns: cols, rows: ROWS, rowKey: "id", mode: "plain" },
      slots: { "cell-note": `<template #cell-note="{ value }"><em>{{ value }}</em></template>` },
    });
    expect(container.querySelector(".ui-dt__clamp em")).not.toBeNull();
  });
});

describe("DataTable numeric columns", () => {
  const cols: DataTableColumn<Row>[] = [
    COLUMNS[0],
    COLUMNS[1],
    { ...COLUMNS[2], numeric: true },
  ];

  it("end-aligns header and cells and marks them numeric", () => {
    const { container } = renderTable({ columns: cols });
    const header = screen.getByRole("columnheader", { name: "Amount" });
    expect(header.classList.contains("ui-dt__cell--end")).toBe(true);
    const cells = container.querySelectorAll(".ui-dt__td.ui-dt__cell--numeric");
    expect(cells).toHaveLength(ROWS.length);
    cells.forEach((c) => expect(c.classList.contains("ui-dt__cell--end")).toBe(true));
  });

  it("uses tabular figures but not the data font family (that is mono)", () => {
    const css = rule(scss, ".ui-dt__cell--numeric");
    expect(css).toContain("font-variant-numeric: tabular-nums");
    expect(css).not.toContain("font-family");
  });

  it("an explicit align wins over numeric's default", () => {
    const { container } = renderTable({
      columns: [{ ...COLUMNS[2], numeric: true, align: "center" }],
    });
    const cell = container.querySelector(".ui-dt__td")!;
    expect(cell.classList.contains("ui-dt__cell--center")).toBe(true);
    expect(cell.classList.contains("ui-dt__cell--end")).toBe(false);
  });
});

describe("DataTable columns menu", () => {
  async function openMenu() {
    await fireEvent.click(screen.getByRole("button", { name: "Columns" }));
  }

  it("is absent without columnsMenu", () => {
    renderTable();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
  });

  it("lists the columns as checked options", async () => {
    renderTable({ columnsMenu: true });
    await openMenu();
    const items = await screen.findAllByRole("menuitemcheckbox");
    const labels = items.map((i) => i.textContent!);
    for (const name of ["Name", "Note", "Amount"]) {
      expect(labels.some((l) => l.includes(name))).toBe(true);
    }
    items.forEach((i) => expect(i.getAttribute("aria-checked")).toBe("true"));
  });

  it("hiding a column removes header and cells and emits update:hiddenColumns", async () => {
    const { emitted, container } = renderTable({ columnsMenu: true });
    await openMenu();
    await fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Note" }));
    expect(screen.queryByRole("columnheader", { name: "Note" })).toBeNull();
    expect(screen.queryByText("short")).toBeNull();
    expect(container.querySelectorAll(".ui-dt__body [role=row]:first-child [role=gridcell]")).toHaveLength(2);
    expect(emitted()["update:hiddenColumns"]).toEqual([[["note"]]]);
  });

  it("starts from a bound hiddenColumns and can show a column again", async () => {
    const { emitted } = renderTable({ columnsMenu: true, hiddenColumns: ["note"] });
    expect(screen.queryByRole("columnheader", { name: "Note" })).toBeNull();
    await openMenu();
    await fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Note" }));
    expect(emitted()["update:hiddenColumns"]).toEqual([[[]]]);
  });

  it("hiddenColumns hides columns even without the menu", () => {
    renderTable({ hiddenColumns: ["amount"] });
    expect(screen.queryByRole("columnheader", { name: "Amount" })).toBeNull();
  });

  it("never lets the last visible column be hidden", async () => {
    const { emitted } = renderTable({ columnsMenu: true, hiddenColumns: ["note", "amount"] });
    await openMenu();
    const last = await screen.findByRole("menuitemcheckbox", { name: "Name" });
    await fireEvent.click(last);
    expect(emitted()["update:hiddenColumns"]).toBeUndefined();
  });
});
