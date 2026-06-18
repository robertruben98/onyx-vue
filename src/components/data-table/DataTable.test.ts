import { render, screen, within, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { reactive } from "vue";
import DataTable from "./DataTable.vue";
import type { DataTableColumn } from "./DataTable.vue";

interface Person {
  id: number;
  name: string;
  role: string;
}

const COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "role", header: "Role", field: "role", align: "end" },
];

const ROWS: Person[] = [
  { id: 1, name: "Ada", role: "Lead" },
  { id: 2, name: "Grace", role: "Eng" },
];

// ---------------------------------------------------------------------------
// Foundation
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — foundation", () => {
  function renderBasic(props: Record<string, unknown> = {}) {
    return render(DataTable, {
      props: {
        caption: "People",
        columns: COLUMNS,
        rows: ROWS,
        rowKey: "id",
        ...props,
      },
    });
  }

  it("exposes a labelled grid with row/column counts", () => {
    renderBasic();
    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid.getAttribute("aria-colcount")).toBe("2");
    expect(grid.getAttribute("aria-rowcount")).toBe("3"); // 2 rows + header
  });

  it("renders column headers", () => {
    renderBasic();
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent?.trim())).toEqual(["Name", "Role"]);
  });

  it("renders a gridcell per field value", () => {
    renderBasic();
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Ada")).toBeTruthy();
    expect(within(rows[1]).getByText("Lead")).toBeTruthy();
    expect(screen.getAllByRole("gridcell")).toHaveLength(4);
  });

  it("sets aria-rowindex (header=1, data rows offset by 2)", () => {
    renderBasic();
    const rows = screen.getAllByRole("row");
    expect(rows[0].getAttribute("aria-rowindex")).toBe("1");
    expect(rows[1].getAttribute("aria-rowindex")).toBe("2");
    expect(rows[2].getAttribute("aria-rowindex")).toBe("3");
  });

  it("supports a computed value accessor", () => {
    const cols: DataTableColumn<Person>[] = [
      { id: "u", header: "User", value: (r) => r.name.toUpperCase() },
    ];
    render(DataTable, { props: { caption: "t", columns: cols, rows: ROWS } });
    expect(screen.getByText("ADA")).toBeTruthy();
  });

  it("renders a custom cell via a scoped slot", () => {
    render(DataTable, {
      props: { caption: "t", columns: COLUMNS, rows: ROWS, rowKey: "id" },
      slots: {
        "cell-name": (slotProps: { value: unknown }) =>
          `${slotProps.value}!`,
      },
    });
    expect(screen.getByText("Ada!")).toBeTruthy();
  });

  it("shows the empty state when there are no rows", () => {
    renderBasic({ rows: [] });
    expect(screen.getByText("No data")).toBeTruthy();
    expect(screen.queryAllByRole("row")).toHaveLength(1); // header only
  });

  it("shows a custom empty text", () => {
    renderBasic({ rows: [], emptyText: "Nothing here" });
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("shows a loading status and marks the grid busy", () => {
    renderBasic({ loading: true });
    expect(screen.getByRole("status").textContent).toContain("Loading");
    expect(screen.getByRole("grid").getAttribute("aria-busy")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = renderBasic();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------
interface Score {
  id: number;
  name: string;
  points: number;
}

const SCORE_COLUMNS: DataTableColumn<Score>[] = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "points", header: "Points", field: "points", sortable: true },
];

const SCORES: Score[] = [
  { id: 1, name: "Charlie", points: 30 },
  { id: 2, name: "Alice", points: 10 },
  { id: 3, name: "Bob", points: 20 },
];

function renderScores(props: Record<string, unknown> = {}) {
  return render(DataTable, {
    props: {
      caption: "Scores",
      rowKey: "id",
      columns: SCORE_COLUMNS,
      rows: SCORES,
      ...props,
    },
  });
}

function names(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelector(".ui-dt__td")?.textContent?.trim() ?? "");
}

describe("DataTable (Vue) — sorting", () => {
  it("renders sortable headers as buttons with aria-sort=none", () => {
    renderScores();
    const header = screen.getByRole("columnheader", { name: /Name/ });
    expect(header.getAttribute("aria-sort")).toBe("none");
    expect(within(header).getByRole("button")).toBeTruthy();
  });

  it("cycles ascending → descending → none on click", async () => {
    renderScores();
    const nameBtn = within(
      screen.getByRole("columnheader", { name: /Name/ }),
    ).getByRole("button");

    await fireEvent.click(nameBtn);
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]);
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("ascending");

    await fireEvent.click(nameBtn);
    expect(names()).toEqual(["Charlie", "Bob", "Alice"]);
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("descending");

    await fireEvent.click(nameBtn);
    expect(names()).toEqual(["Charlie", "Alice", "Bob"]); // source order
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("none");
  });

  it("sorts numerically by a numeric field", async () => {
    renderScores();
    const pointsBtn = within(
      screen.getByRole("columnheader", { name: /Points/ }),
    ).getByRole("button");
    await fireEvent.click(pointsBtn);
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]); // 10,20,30
  });

  it("replaces sort when not in multi mode", async () => {
    renderScores();
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Points/ })).getByRole(
        "button",
      ),
    );
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("none");
    expect(
      screen
        .getByRole("columnheader", { name: /Points/ })
        .getAttribute("aria-sort"),
    ).toBe("ascending");
  });

  it("adds a sort level with Shift+click in multi mode", async () => {
    renderScores({ multiSort: true });
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Points/ })).getByRole(
        "button",
      ),
      { shiftKey: true },
    );
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("ascending");
    expect(
      screen
        .getByRole("columnheader", { name: /Points/ })
        .getAttribute("aria-sort"),
    ).toBe("ascending");
  });

  it("emits the two-way sort model", async () => {
    const { emitted } = renderScores();
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    expect(emitted()["update:sort"]).toBeTruthy();
  });

  it("does not make a non-sortable header a button", () => {
    render(DataTable, {
      props: {
        caption: "t",
        columns: COLUMNS, // not sortable
        rows: ROWS,
        rowKey: "id",
      },
    });
    const header = screen.getByRole("columnheader", { name: "Name" });
    expect(within(header).queryByRole("button")).toBeNull();
    expect(header.getAttribute("aria-sort")).toBeNull();
  });

  it("has no axe violations when sorted", async () => {
    const { container } = renderScores();
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
interface Item {
  id: number;
  label: string;
}
const ITEMS: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  label: `Item ${i + 1}`,
}));

function renderPaged(props: Record<string, unknown> = {}) {
  return render(DataTable, {
    props: {
      caption: "Items",
      rowKey: "id",
      columns: [{ id: "label", header: "Label", field: "label" }],
      rows: ITEMS,
      pageSize: 5,
      pageSizeOptions: [5, 10],
      ...props,
    },
  });
}

function dataRowCount(): number {
  return screen.getAllByRole("row").length - 1; // minus header
}

describe("DataTable (Vue) — pagination", () => {
  it("shows only the first page and a range readout", () => {
    renderPaged();
    expect(dataRowCount()).toBe(5);
    expect(screen.getByText(/1–5 of 12/)).toBeTruthy();
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();
  });

  it("navigates with next / previous", async () => {
    renderPaged();
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/6–10 of 12/)).toBeTruthy();
    expect(screen.getByText("Item 6")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByText(/1–5 of 12/)).toBeTruthy();
  });

  it("disables prev on the first page and next on the last", async () => {
    renderPaged();
    expect(
      (screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 3 of 3")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(dataRowCount()).toBe(2); // 12 - 10
  });

  it("changes page size and resets to the first page", async () => {
    renderPaged();
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await fireEvent.update(screen.getByRole("combobox"), "10");
    expect(dataRowCount()).toBe(10);
    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
  });

  it("hides the footer while loading", () => {
    renderPaged({ loading: true });
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).toBeNull();
  });

  it("has no axe violations with pagination", async () => {
    const { container } = renderPaged();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------
function renderSelect(props: Record<string, unknown> = {}) {
  const state = reactive({ selected: new Set<number | string>() });
  const utils = render(DataTable, {
    props: {
      caption: "Scores",
      rowKey: "id",
      columns: [{ id: "name", header: "Name", field: "name" }],
      rows: SCORES, // Charlie(1), Alice(2), Bob(3)
      selectable: "multiple",
      "onUpdate:selected": (v: Set<number | string>) => (state.selected = v),
      ...props,
    },
  });
  return { ...utils, state };
}

describe("DataTable (Vue) — selection", () => {
  it("renders no checkboxes when selectable is none", () => {
    render(DataTable, {
      props: {
        caption: "t",
        rowKey: "id",
        columns: [{ id: "name", header: "Name", field: "name" }],
        rows: SCORES,
        selectable: "none",
      },
    });
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("renders a select-all header checkbox plus one per row in multiple mode", () => {
    renderSelect();
    expect(screen.getAllByRole("checkbox")).toHaveLength(4); // header + 3 rows
  });

  it("selects a row, updating the model and aria-selected", async () => {
    const { state } = renderSelect();
    const rowCheckboxes = screen.getAllByRole("checkbox").slice(1);
    await fireEvent.click(rowCheckboxes[0]); // Charlie (id 1)
    expect(state.selected.has(1)).toBe(true);
    const rows = screen.getAllByRole("row");
    expect(rows[1].getAttribute("aria-selected")).toBe("true");
  });

  it("select-all selects every row; clearing deselects", async () => {
    const { state } = renderSelect();
    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    await fireEvent.click(headerCheckbox);
    expect(state.selected.size).toBe(3);
    await fireEvent.click(headerCheckbox);
    expect(state.selected.size).toBe(0);
  });

  it("header checkbox is indeterminate on partial selection", async () => {
    renderSelect();
    const checkboxes = screen.getAllByRole("checkbox");
    await fireEvent.click(checkboxes[1]); // one row
    expect((checkboxes[0] as HTMLInputElement).indeterminate).toBe(true);
  });

  it("single mode keeps at most one selected", async () => {
    const { state } = renderSelect({ selectable: "single" });
    const rowCheckboxes = screen.getAllByRole("checkbox"); // no header in single
    await fireEvent.click(rowCheckboxes[0]);
    await fireEvent.click(rowCheckboxes[1]);
    expect(state.selected.size).toBe(1);
    expect(state.selected.has(2)).toBe(true);
  });

  it("has no axe violations with selection", async () => {
    const { container } = renderSelect();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Virtual scroll
// ---------------------------------------------------------------------------
function renderVirtual() {
  return render(DataTable, {
    props: {
      caption: "Items",
      rowKey: "id",
      columns: [{ id: "label", header: "Label", field: "label" }],
      rows: Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        label: `Item ${i + 1}`,
      })),
      mode: "virtual",
      rowHeight: 40,
      viewportHeight: "200px",
    },
  });
}

// NOTE (declared limit): jsdom has no layout, so windowing falls back to the
// configured viewportHeight estimate. These tests assert the viewport wiring,
// the absent pagination footer, grid semantics and axe — not exact row counts.
describe("DataTable (Vue) — virtual scroll", () => {
  it("renders a scrolling viewport rowgroup in virtual mode", () => {
    const { container } = renderVirtual();
    expect(container.querySelector(".ui-dt__viewport")).toBeTruthy();
  });

  it("does not render the pagination footer in virtual mode", () => {
    renderVirtual();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
  });

  it("renders a windowed subset, not all 1000 rows", () => {
    renderVirtual();
    // 200px / 40px + overscan ≈ a couple dozen, never 1000.
    expect(dataRowCount()).toBeLessThan(1000);
  });

  it("keeps the grid and header semantics", () => {
    renderVirtual();
    expect(
      screen.getByRole("grid", { name: "Items" }).getAttribute("aria-rowcount"),
    ).toBe("1001");
    expect(screen.getByRole("columnheader", { name: "Label" })).toBeTruthy();
  });

  it("has no axe violations in virtual mode", async () => {
    const { container } = renderVirtual();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------
function at() {
  return {
    row: document.activeElement?.getAttribute("data-row"),
    col: document.activeElement?.getAttribute("data-col"),
  };
}

function cellAt(container: Element, row: number, col: number): HTMLElement {
  return container.querySelector<HTMLElement>(
    `[data-row="${row}"][data-col="${col}"]`,
  )!;
}

describe("DataTable (Vue) — keyboard navigation", () => {
  it("makes only the active cell tabbable (roving tabindex)", () => {
    const { container } = renderScores();
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("0");
    expect(cellAt(container, 0, 1).getAttribute("tabindex")).toBe("-1");
  });

  it("moves the focus with arrow keys (2D)", async () => {
    const { container } = renderScores();
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(at()).toEqual({ row: "0", col: "1" });
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(at()).toEqual({ row: "1", col: "1" });
    await fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(at()).toEqual({ row: "1", col: "0" });
    await fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("supports Home/End and Ctrl+Home/Ctrl+End", async () => {
    const { container } = renderScores();
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "End" });
    expect(at()).toEqual({ row: "0", col: "1" });
    await fireEvent.keyDown(grid, { key: "Home" });
    expect(at()).toEqual({ row: "0", col: "0" });
    await fireEvent.keyDown(grid, { key: "End", ctrlKey: true });
    expect(at()).toEqual({ row: "3", col: "1" }); // last row (3 rows), last col
    await fireEvent.keyDown(grid, { key: "Home", ctrlKey: true });
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("activates a sortable header cell with Enter", async () => {
    const { container } = renderScores();
    cellAt(container, 0, 0).focus(); // Name header
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "Enter" });
    expect(
      screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
    ).toBe("ascending");
  });

  it("resets the active cell to the header after sorting", async () => {
    const { container } = renderScores();
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    await fireEvent.keyDown(grid, { key: "ArrowRight" }); // active cell now (1,1)
    expect(cellAt(container, 1, 1).getAttribute("tabindex")).toBe("0");
    await fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("0");
    expect(cellAt(container, 1, 1).getAttribute("tabindex")).toBe("-1");
  });

  it("has no axe violations with keyboard wiring", async () => {
    const { container } = renderScores();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Sticky header / maxHeight
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — sticky header", () => {
  it("applies max-height and internal scroll when maxHeight is set", () => {
    render(DataTable, {
      props: {
        caption: "t",
        columns: [{ id: "label", header: "Label", field: "label" }],
        rows: ITEMS,
        rowKey: "id",
        maxHeight: "200px",
      },
    });
    const grid = screen.getByRole("grid") as HTMLElement;
    expect(grid.style.maxHeight).toBe("200px");
    expect(grid.style.overflowY).toBe("auto");
  });
});
