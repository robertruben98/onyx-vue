import { afterEach, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { nextTick, reactive } from "vue";
import DataTable from "./DataTable.vue";
import type { DataTableColumn, RowKey } from "./DataTable.vue";

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
    // La cabecera y una fila con una celda que ocupa todo el ancho: un aviso
    // suelto dentro del rowgroup era ARIA invalido (axe, critico).
    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(2);
    const cell = rows[1].querySelector('[role="gridcell"]');
    expect(cell?.textContent).toContain("No data");
    expect(cell?.getAttribute("aria-colspan")).toBe(String(rows[0].querySelectorAll('[role="columnheader"]').length));
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

describe("DataTable · modo plain", () => {
  const columns = [
    { id: "name", header: "Name", field: "name" },
    { id: "port", header: "Port", field: "port" },
  ];
  const rows = Array.from({ length: 19 }, (_, i) => ({
    id: i,
    name: `svc-${i}`,
    port: 3000 + i,
  }));

  it("pinta TODAS las filas, sin recortar por pagina", () => {
    // En `paginated` un pageSize de 10 dejaria nueve fuera sin decirlo.
    const { container } = render(DataTable, {
      props: { columns, rows, mode: "plain", rowKey: "id" },
    });
    const filas = container.querySelectorAll(".ui-dt__tr");
    expect(filas.length).toBe(19);
  });

  it("no saca pie de paginacion", () => {
    // Es el motivo de que exista el modo: para veinte filas que se leen de un
    // vistazo, el pie solo estorba.
    const { container } = render(DataTable, {
      props: { columns, rows, mode: "plain", rowKey: "id" },
    });
    expect(container.querySelector(".ui-dt__footer")).toBeNull();
  });

  it("no monta la ventana virtual, asi que no depende de rowHeight", () => {
    // La trampa que hace falta esquivar: `viewportHeight` entra por parseFloat
    // y el alto real de la fila sale de la tipografia, que cambia con el tema.
    // Si no cuadran, o sobra scroll o faltan filas.
    const { container } = render(DataTable, {
      props: { columns, rows, mode: "plain", rowKey: "id" },
    });
    expect(container.querySelector(".ui-dt__viewport")).toBeNull();
  });

  it("sigue anunciando el total real a lectores de pantalla", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, mode: "plain", rowKey: "id", caption: "Servicios" },
    });
    const grid = container.querySelector('[role="grid"]');
    // cabecera + 19 filas
    expect(grid?.getAttribute("aria-rowcount")).toBe("20");
  });
});

describe("DataTable row detail (Vue)", () => {
  const columns = [
    { id: "name", header: "Name", field: "name" },
    { id: "port", header: "Port", field: "port" },
  ];
  const rows = [
    { id: "a", name: "payment", port: 8001 },
    { id: "b", name: "oidc", port: 8002 },
  ];

  function renderTable(props: Record<string, unknown> = {}) {
    return render(DataTable, {
      props: { columns, rows, mode: "plain", caption: "Services", ...props },
      slots: { "row-detail": ({ row }: { row: { name: string } }) => `drawer de ${row.name}` },
    });
  }

  it("renders no detail row until a key is expanded", () => {
    const { container } = renderTable();
    expect(container.querySelector(".ui-dt__detail")).toBeNull();
  });

  it("opens the detail directly under its own row", () => {
    // La adyacencia es el motivo de existir del cajon: un panel en otro sitio
    // obliga a volver a buscar la fila.
    const { container } = renderTable({ expanded: new Set(["a"]) });
    const body = container.querySelector(".ui-dt__body");
    const kids = [...(body?.children ?? [])];
    const rowIndex = kids.findIndex((el) => el.classList.contains("ui-dt__tr"));
    expect(kids[rowIndex + 1].classList.contains("ui-dt__detail")).toBe(true);
  });

  it("renders the slot content with its row", () => {
    const { getByText } = renderTable({ expanded: new Set(["b"]) });
    expect(getByText("drawer de oidc")).toBeTruthy();
  });

  it("opens only the rows that were asked for", () => {
    const { container } = renderTable({ expanded: new Set(["a"]) });
    expect(container.querySelectorAll(".ui-dt__detail").length).toBe(1);
  });

  it("spans the detail cell across every column", () => {
    // Sin esto el cajon hereda la rejilla de la tabla y sale troceado en celdas.
    const { container } = renderTable({ expanded: new Set(["a"]) });
    expect(container.querySelector(".ui-dt__detail-cell")).toBeTruthy();
    expect(
      container.querySelector(".ui-dt__detail")?.getAttribute("role"),
    ).toBe("row");
  });

  it("marks the open row so it can be styled with its drawer", () => {
    const { container } = renderTable({ expanded: new Set(["a"]) });
    const trs = container.querySelectorAll(".ui-dt__tr");
    expect(trs[0].classList.contains("ui-dt__tr--expanded")).toBe(true);
    expect(trs[1].classList.contains("ui-dt__tr--expanded")).toBe(false);
  });

  it("never puts aria-expanded on a grid row", () => {
    // Solo vale en una fila de `treegrid`; axe lo rechaza en una de `grid`. El
    // desplegado lo anuncia el control que el consumidor pone en la celda.
    const { container } = renderTable({ expanded: new Set(["a"]) });
    expect(
      container.querySelector(".ui-dt__tr")?.hasAttribute("aria-expanded"),
    ).toBe(false);
  });

  it("renders no detail row without the slot, whatever is expanded", () => {
    const { container } = render(DataTable, {
      props: {
        columns,
        rows,
        mode: "plain",
        caption: "Services",
        expanded: new Set(["a"]),
      },
    });
    expect(container.querySelector(".ui-dt__detail")).toBeNull();
  });

  it("ignores expansion in virtual mode, where a variable row height cannot work", () => {
    const { container } = renderTable({ mode: "virtual", expanded: new Set(["a"]) });
    expect(container.querySelector(".ui-dt__detail")).toBeNull();
  });

  it("has no axe violations with a row open", async () => {
    const { container } = renderTable({ expanded: new Set(["a"]) });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DataTable rowClass (Vue)", () => {
  const columns = [{ id: "name", header: "Name", field: "name" }];
  const rows = [
    { id: "a", name: "payment" },
    { id: "b", name: "oidc" },
  ];

  it("puts the consumer's classes on the row it names", () => {
    const { container } = render(DataTable, {
      props: {
        columns,
        rows,
        mode: "plain",
        caption: "Services",
        rowClass: (row: { id: string }) => (row.id === "a" ? "lista" : undefined),
      },
    });
    const trs = container.querySelectorAll(".ui-dt__tr");
    expect(trs[0].classList.contains("lista")).toBe(true);
    expect(trs[1].classList.contains("lista")).toBe(false);
  });

  it("keeps the selection class alongside the consumer's own", () => {
    const { container } = render(DataTable, {
      props: {
        columns,
        rows,
        mode: "plain",
        caption: "Services",
        selectable: "multiple",
        selected: new Set(["a"]),
        rowClass: () => "cursor",
      },
    });
    const tr = container.querySelector(".ui-dt__tr");
    expect(tr?.classList.contains("ui-dt__tr--selected")).toBe(true);
    expect(tr?.classList.contains("cursor")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Responsive columns
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — hideBelow", () => {
  const cols: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name" },
    { id: "role", header: "Role", field: "role", hideBelow: 1000 },
  ];

  function at(width: number) {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  }

  afterEach(() => at(1024));

  it("keeps the column on a wide viewport", () => {
    at(1200);
    render(DataTable, { props: { caption: "People", columns: cols, rows: ROWS, rowKey: "id" } });
    expect(screen.getByRole("columnheader", { name: "Role" })).toBeTruthy();
    expect(screen.getByText("Lead")).toBeTruthy();
  });

  it("drops header and cells together on a narrow one", () => {
    at(800);
    render(DataTable, { props: { caption: "People", columns: cols, rows: ROWS, rowKey: "id" } });
    expect(screen.queryByRole("columnheader", { name: "Role" })).toBeNull();
    expect(screen.queryByText("Lead")).toBeNull();
    expect(screen.getByRole("grid").getAttribute("aria-colcount")).toBe("1");
  });

  it("follows a resize", async () => {
    at(1200);
    render(DataTable, { props: { caption: "People", columns: cols, rows: ROWS, rowKey: "id" } });
    at(800);
    window.dispatchEvent(new Event("resize"));
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole("columnheader", { name: "Role" })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Activatable rows
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — activatable", () => {
  function renderIt(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return render(DataTable, {
      props: { caption: "People", columns: COLUMNS, rows: ROWS, rowKey: "id", mode: "plain", activatable: true, ...props },
      slots,
    });
  }

  it("emits rowActivated with the row on a click anywhere on it", async () => {
    const { container, emitted } = renderIt();
    const cell = container.querySelectorAll(".ui-dt__tr")[1].querySelector(".ui-dt__td") as HTMLElement;
    await fireEvent.click(cell);
    expect((emitted().rowActivated[0] as unknown[])[0]).toEqual(ROWS[1]);
  });

  it("leaves the clicks of controls inside the row alone", async () => {
    const { container, emitted } = renderIt({}, { "cell-role": "<button type='button'>act</button>" });
    await fireEvent.click(container.querySelector(".ui-dt__tr button") as HTMLElement);
    expect(emitted().rowActivated).toBeUndefined();
  });

  it("emits on Enter from a cell without its own control", async () => {
    const { container, emitted } = renderIt();
    const cell = container.querySelector('[data-row="1"][data-col="0"]') as HTMLElement;
    await fireEvent.click(cell);
    await fireEvent.keyDown(cell, { key: "Enter" });
    const calls = emitted().rowActivated as unknown[][];
    expect(calls[calls.length - 1][0]).toEqual(ROWS[0]);
  });

  it("does nothing unless asked", async () => {
    const { container, emitted } = renderIt({ activatable: false });
    await fireEvent.click(container.querySelector(".ui-dt__tr .ui-dt__td") as HTMLElement);
    expect(emitted().rowActivated).toBeUndefined();
    expect(container.querySelector(".ui-dt__tr--activatable")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Virtual scroll: the window follows the viewport
// ---------------------------------------------------------------------------
interface Line {
  id: number;
  label: string;
}

const LINES: Line[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  label: `Item ${i + 1}`,
}));

function renderWindow(props: Record<string, unknown> = {}) {
  return render(DataTable, {
    props: {
      caption: "Items",
      rowKey: "id",
      columns: [{ id: "label", header: "Label", field: "label" }],
      rows: LINES,
      mode: "virtual",
      rowHeight: 40,
      viewportHeight: "200px",
      ...props,
    },
  });
}

function viewportOf(container: Element): HTMLElement {
  return container.querySelector(".ui-dt__viewport") as HTMLElement;
}

function windowLabels(container: Element): string[] {
  return [...container.querySelectorAll(".ui-dt__viewport .ui-dt__tr")].map(
    (r) => r.textContent?.trim() ?? "",
  );
}

describe("DataTable (Vue) — virtual window", () => {
  // jsdom no mide: `clientHeight` es 0 salvo que se fije a mano.
  const ownHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
  let measured = 0;

  beforeEach(() => {
    measured = 0;
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains("ui-dt__viewport") ? measured : 0;
      },
    });
  });

  afterEach(() => {
    if (ownHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", ownHeight);
    else Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  });

  it("estimates the window from viewportHeight while the viewport is not measured", () => {
    const { container } = renderWindow();
    // 200px / 40px = 5 filas visibles, mas 4 de margen por cada lado.
    expect(windowLabels(container)).toHaveLength(13);
    expect(windowLabels(container)[0]).toBe("Item 1");
  });

  it("sizes the window from the measured viewport height", async () => {
    measured = 400;
    const { container } = renderWindow();
    await nextTick();
    expect(windowLabels(container)).toHaveLength(400 / 40 + 8);
  });

  it("renders only the overscan rows when the height can be neither measured nor parsed", () => {
    const { container } = renderWindow({ viewportHeight: "calc(100vh - 120px)" });
    expect(windowLabels(container)).toHaveLength(8);
  });

  it("moves the window when the viewport scrolls", async () => {
    const { container } = renderWindow();
    const vp = viewportOf(container);
    vp.scrollTop = 4000; // la fila 101 queda arriba del todo
    await fireEvent.scroll(vp);
    const labels = windowLabels(container);
    // Cuatro filas de margen por encima: la ventana empieza en la 97.
    expect(labels[0]).toBe("Item 97");
    expect(labels).toHaveLength(13);
    expect(labels).not.toContain("Item 1");
    const first = container.querySelector(".ui-dt__viewport .ui-dt__tr");
    expect(first?.getAttribute("aria-rowindex")).toBe("98");
    // El separador conserva el alto total y el trozo pintado baja a su sitio.
    const spacer = vp.firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe(`${1000 * 40}px`);
    expect((spacer.firstElementChild as HTMLElement).style.transform).toBe(`translateY(${96 * 40}px)`);
  });

  it("brings the window back after a reload", async () => {
    const { container, rerender } = renderWindow();
    await rerender({ loading: true });
    expect(viewportOf(container)).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Loading");
    await rerender({ loading: false });
    expect(viewportOf(container)).toBeTruthy();
    expect(windowLabels(container)[0]).toBe("Item 1");
  });

  it("names the rows region after the caption, or 'Rows' without one", async () => {
    const { container, rerender } = renderWindow();
    expect(viewportOf(container).getAttribute("aria-label")).toBe("Items, rows");
    await rerender({ caption: "" });
    expect(viewportOf(container).getAttribute("aria-label")).toBe("Rows");
  });

  it("activates a virtual row on click", async () => {
    const { container, emitted } = renderWindow({ activatable: true });
    const row = container.querySelectorAll(".ui-dt__viewport .ui-dt__tr")[2];
    expect(row.classList.contains("ui-dt__tr--activatable")).toBe(true);
    await fireEvent.click(row.querySelector(".ui-dt__td") as HTMLElement);
    expect((emitted().rowActivated as unknown[][])[0][0]).toEqual(LINES[2]);
  });

  it("selects a virtual row with its checkbox", async () => {
    const { container, emitted } = renderWindow({ selectable: "multiple" });
    const rows = container.querySelectorAll(".ui-dt__viewport .ui-dt__tr");
    await fireEvent.click(within(rows[1] as HTMLElement).getByRole("checkbox"));
    const calls = emitted()["update:selected"] as unknown[][];
    expect([...(calls[calls.length - 1][0] as Set<number>)]).toEqual([2]);
    expect(rows[1].getAttribute("aria-selected")).toBe("true");
    expect(rows[0].getAttribute("aria-selected")).toBe("false");
  });

  it("activates the keyboard row with Enter in virtual mode", async () => {
    const { container, emitted } = renderWindow({ activatable: true });
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(at()).toEqual({ row: "2", col: "0" });
    expect(cellAt(container, 2, 0).getAttribute("tabindex")).toBe("0");
    await fireEvent.keyDown(grid, { key: "Enter" });
    expect((emitted().rowActivated as unknown[][])[0][0]).toEqual(LINES[1]);
  });

  it("selects a virtual row from the keyboard", async () => {
    const { container } = renderWindow({ selectable: "multiple" });
    cellAt(container, 0, 0).focus(); // casilla de "seleccionar todo"
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(cellAt(container, 1, 0).getAttribute("tabindex")).toBe("0");
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("-1");
    await fireEvent.keyDown(grid, { key: " " });
    const firstRow = container.querySelector(".ui-dt__viewport .ui-dt__tr");
    expect(firstRow?.getAttribute("aria-selected")).toBe("true");
    expect(at()).toEqual({ row: "1", col: "0" });
  });

  it("keeps the focus on the header while a virtual table is loading", async () => {
    const { container } = renderWindow({ loading: true });
    cellAt(container, 0, 0).focus();
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("scrolls a far row into view and makes it the tab stop (Ctrl+End, PageUp)", async () => {
    measured = 200;
    const { container } = renderWindow();
    const vp = viewportOf(container);
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");

    await fireEvent.keyDown(grid, { key: "End", ctrlKey: true });
    // La fila 1000 no estaba pintada: el viewport baja hasta dejarla abajo del todo.
    expect(vp.scrollTop).toBe(1000 * 40 - 200);
    await fireEvent.scroll(vp); // el aviso de scroll que daria el navegador
    expect(cellAt(container, 1000, 0).textContent?.trim()).toBe("Item 1000");
    expect(cellAt(container, 1000, 0).getAttribute("tabindex")).toBe("0");

    // Fuera de `paginated` el salto es de 10 filas; la 990 queda arriba del todo.
    await fireEvent.keyDown(grid, { key: "PageUp" });
    expect(vp.scrollTop).toBe(989 * 40);
    await fireEvent.scroll(vp);
    expect(cellAt(container, 990, 0).getAttribute("tabindex")).toBe("0");
  });

  // BUG (ver informe agent-charts-datatable.md, DataTable #1): en modo virtual,
  // saltar a una fila que no esta pintada pierde el foco. `focusCell` mueve el
  // scroll y reintenta en `nextTick`, pero el navegador avisa del scroll en una
  // tarea posterior: en `nextTick` la fila aun no existe, y cuando la ventana se
  // mueve la celda que tenia el foco se desmonta y el foco cae a <body>.
  it.skip("keeps keyboard focus when jumping to a row outside the window", async () => {
    measured = 200;
    const { container } = renderWindow();
    const vp = viewportOf(container);
    let top = 0;
    // Como un navegador: el evento `scroll` llega en una tarea, no en el acto.
    Object.defineProperty(vp, "scrollTop", {
      configurable: true,
      get: () => top,
      set: (value: number) => {
        top = value;
        setTimeout(() => vp.dispatchEvent(new Event("scroll")));
      },
    });
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "PageDown" });
    expect(at()).toEqual({ row: "10", col: "0" });
    await fireEvent.keyDown(grid, { key: "PageDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();
    expect(at()).toEqual({ row: "20", col: "0" });
  });
});

// ---------------------------------------------------------------------------
// Keyboard: page jumps, Enter on rows, keys left alone
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — keyboard page jumps and activation", () => {
  const nineteen: Line[] = LINES.slice(0, 19);

  it("jumps ten rows with PageDown/PageUp outside paginated mode", async () => {
    const { container } = render(DataTable, {
      props: {
        caption: "Lines",
        rowKey: "id",
        columns: [{ id: "label", header: "Label", field: "label" }],
        rows: nineteen,
        mode: "plain",
      },
    });
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "PageDown" });
    expect(at()).toEqual({ row: "10", col: "0" });
    await fireEvent.keyDown(grid, { key: "PageDown" });
    expect(at()).toEqual({ row: "19", col: "0" }); // tope: la ultima fila
    await fireEvent.keyDown(grid, { key: "PageUp" });
    expect(at()).toEqual({ row: "9", col: "0" });
    await fireEvent.keyDown(grid, { key: "PageUp" });
    expect(at()).toEqual({ row: "0", col: "0" }); // tope: la cabecera
  });

  it("jumps a whole page with PageDown in paginated mode", async () => {
    const { container } = render(DataTable, {
      props: {
        caption: "Lines",
        rowKey: "id",
        columns: [{ id: "label", header: "Label", field: "label" }],
        rows: LINES.slice(0, 30),
        pageSize: 25,
        pageSizeOptions: [10, 25],
      },
    });
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "PageDown" });
    // 25 filas de un salto (no 10): la ultima de la pagina.
    expect(at()).toEqual({ row: "25", col: "0" });
    expect(document.activeElement?.textContent?.trim()).toBe("Item 25");
    await fireEvent.keyDown(grid, { key: "PageUp" });
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("activates the keyboard row of the current page with Enter or Space", async () => {
    const { container, emitted } = renderPaged({ activatable: true });
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    await fireEvent.keyDown(grid, { key: "Enter" });
    // Pagina 2 (Item 6–10), segunda fila: Item 7.
    const calls = emitted().rowActivated as unknown[][];
    expect(calls[0][0]).toEqual(ITEMS[6]);
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    await fireEvent.keyDown(grid, { key: " " });
    expect(calls[1][0]).toEqual(ITEMS[7]);
  });

  it("lets Enter work the control in a cell instead of activating the row", async () => {
    const { container, emitted } = render(DataTable, {
      props: {
        caption: "People",
        columns: COLUMNS,
        rows: ROWS,
        rowKey: "id",
        mode: "plain",
        activatable: true,
        selectable: "multiple",
      },
    });
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    await fireEvent.keyDown(grid, { key: "ArrowDown" }); // celda del checkbox de Ada
    await fireEvent.keyDown(grid, { key: "Enter" });
    const calls = emitted()["update:selected"] as unknown[][];
    expect([...(calls[calls.length - 1][0] as Set<number>)]).toEqual([1]);
    expect(emitted().rowActivated).toBeUndefined();
    expect(at()).toEqual({ row: "1", col: "0" }); // el foco sigue en la celda
  });

  it("does not activate a row from the header", async () => {
    const { container, emitted } = render(DataTable, {
      props: { caption: "People", columns: COLUMNS, rows: ROWS, rowKey: "id", mode: "plain", activatable: true },
    });
    cellAt(container, 0, 0).focus();
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "Enter" });
    expect(emitted().rowActivated).toBeUndefined();
  });

  it("leaves the keys it does not handle to the browser", async () => {
    const { container } = renderScores();
    cellAt(container, 0, 0).focus();
    const grid = screen.getByRole("grid");
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    grid.dispatchEvent(tab);
    await nextTick();
    expect(tab.defaultPrevented).toBe(false);
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("0");
    const down = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    grid.dispatchEvent(down);
    await nextTick();
    expect(down.defaultPrevented).toBe(true);
    expect(cellAt(container, 1, 0).getAttribute("tabindex")).toBe("0");
  });

  it("keeps the focus on the header while the rows are loading", async () => {
    const { container } = render(DataTable, {
      props: { caption: "People", columns: COLUMNS, rows: ROWS, rowKey: "id", loading: true },
    });
    cellAt(container, 0, 0).focus();
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  // BUG (ver informe agent-charts-datatable.md, DataTable #3): mientras carga,
  // una flecha mueve la celda activa a una fila que no esta pintada; la
  // cabecera pierde su tabindex=0 y la rejilla se queda sin parada de Tab.
  it.skip("keeps a tab stop in the grid while the rows are loading", async () => {
    const { container } = render(DataTable, {
      props: { caption: "People", columns: COLUMNS, rows: ROWS, rowKey: "id", loading: true },
    });
    cellAt(container, 0, 0).focus();
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(container.querySelectorAll('[role="grid"] [tabindex="0"]')).toHaveLength(1);
  });

  // BUG (ver informe agent-charts-datatable.md, DataTable #2): una celda tiene
  // tabindex=-1, asi que un clic le da el foco, pero la celda activa del roving
  // tabindex no lo sigue: el teclado actua sobre la celda activa anterior. Con
  // la primera columna ordenable, clic en una celda + Enter ordena la tabla.
  it.skip("acts on the clicked cell, not on a stale active cell, after a pointer focus", async () => {
    const { container } = renderScores();
    const cell = cellAt(container, 2, 1); // Alice · 10
    await fireEvent.click(cell);
    cell.focus(); // lo que hace el navegador con un clic en un elemento enfocable
    await fireEvent.keyDown(cell, { key: "Enter" });
    expect(screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort")).toBe("none");
    await fireEvent.keyDown(cell, { key: "ArrowUp" });
    expect(at()).toEqual({ row: "1", col: "1" });
  });

  it("moves the roving tab stop from the select-all header to a row's checkbox cell", async () => {
    const { container } = renderSelect();
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("0");
    cellAt(container, 0, 0).focus();
    await fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(cellAt(container, 0, 0).getAttribute("tabindex")).toBe("-1");
    expect(cellAt(container, 1, 0).getAttribute("tabindex")).toBe("0");
    expect(at()).toEqual({ row: "1", col: "0" });
  });
});

// ---------------------------------------------------------------------------
// Values, keys and sorting edge cases
// ---------------------------------------------------------------------------
describe("DataTable (Vue) — values and row keys", () => {
  function lastSelected(emitted: () => Record<string, unknown[]>): RowKey[] {
    const calls = emitted()["update:selected"] as unknown[][];
    return [...(calls[calls.length - 1][0] as Set<RowKey>)];
  }

  it("renders an empty cell for a column with neither field nor value", () => {
    render(DataTable, {
      props: {
        caption: "People",
        rowKey: "id",
        columns: [
          { id: "name", header: "Name", field: "name" },
          { id: "notes", header: "Notes" },
        ],
        rows: ROWS,
      },
    });
    const notes = screen.getAllByRole("row").slice(1).map((r) => r.querySelectorAll(".ui-dt__td")[1].textContent?.trim());
    expect(notes).toEqual(["", ""]);
  });

  it("keys rows with a rowKey function", async () => {
    const { emitted } = renderSelect({ rowKey: (r: Score) => `score-${r.id}` });
    await fireEvent.click(screen.getAllByRole("checkbox")[1]); // Charlie
    expect(lastSelected(emitted)).toEqual(["score-1"]);
  });

  it("keys a row without id by its JSON when no rowKey is given", async () => {
    const { emitted } = render(DataTable, {
      props: {
        caption: "People",
        columns: [{ id: "name", header: "Name", field: "name" }],
        rows: [{ name: "Ada" }, { name: "Grace" }],
        selectable: "multiple",
      },
    });
    await fireEvent.click(screen.getAllByRole("checkbox")[2]); // Grace
    expect(lastSelected(emitted)).toEqual(['{"name":"Grace"}']);
  });

  it("removes a row from the selection when it is unchecked", async () => {
    const { state } = renderSelect();
    const rowBox = screen.getAllByRole("checkbox")[2]; // Alice (id 2)
    await fireEvent.click(rowBox);
    expect(state.selected.has(2)).toBe(true);
    await fireEvent.click(rowBox);
    expect(state.selected.has(2)).toBe(false);
    expect(screen.getAllByRole("row")[2].getAttribute("aria-selected")).toBe("false");
  });

  it("clears the single selection when the selected row is unchecked", async () => {
    const { state } = renderSelect({ selectable: "single" });
    const rowBox = screen.getAllByRole("checkbox")[0];
    await fireEvent.click(rowBox);
    expect(state.selected.size).toBe(1);
    await fireEvent.click(rowBox);
    expect(state.selected.size).toBe(0);
  });
});

interface Entry {
  id: number;
  name: string;
  points: number | null;
}

interface Member {
  id: number;
  name: string;
  role: string;
}

describe("DataTable (Vue) — sorting edge cases", () => {
  function sortBy(header: RegExp, init: { shiftKey?: boolean } = {}) {
    return fireEvent.click(within(screen.getByRole("columnheader", { name: header })).getByRole("button"), init);
  }

  it("sorts by a column's sortAccessor instead of its displayed value", async () => {
    renderScores({
      columns: [{ id: "name", header: "Name", field: "name", sortable: true, sortAccessor: (r: Score) => -r.points }],
    });
    await sortBy(/Name/);
    // -30, -20, -10: ni orden alfabetico (Alice…) ni el de origen (Charlie, Alice…).
    expect(names()).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("puts empty values last ascending and first descending", async () => {
    const entries: Entry[] = [
      { id: 1, name: "A", points: 2 },
      { id: 2, name: "B", points: null },
      { id: 3, name: "C", points: 1 },
      { id: 4, name: "D", points: null },
    ];
    render(DataTable, {
      props: {
        caption: "Entries",
        rowKey: "id",
        columns: [
          { id: "name", header: "Name", field: "name" },
          { id: "points", header: "Points", field: "points", sortable: true },
        ],
        rows: entries,
      },
    });
    await sortBy(/Points/);
    expect(names()).toEqual(["C", "A", "B", "D"]); // dos vacios: empatan, orden de origen
    await sortBy(/Points/);
    expect(names()).toEqual(["B", "D", "A", "C"]);
  });

  it("ignores a sort level whose column no longer exists", () => {
    const { unmount } = renderScores({ sort: [{ columnId: "gone", direction: "asc" }] });
    expect(names()).toEqual(["Charlie", "Alice", "Bob"]); // orden de origen
    unmount();
    renderScores({
      sort: [
        { columnId: "gone", direction: "asc" },
        { columnId: "name", direction: "asc" },
      ],
    });
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("breaks ties with the next sort level and keeps source order on a full tie", async () => {
    const members: Member[] = [
      { id: 1, name: "Ada", role: "Lead" },
      { id: 2, name: "Grace", role: "Eng" },
      { id: 3, name: "Linus", role: "Eng" },
      { id: 4, name: "Alan", role: "Eng" },
    ];
    render(DataTable, {
      props: {
        caption: "Members",
        rowKey: "id",
        multiSort: true,
        columns: [
          { id: "name", header: "Name", field: "name", sortable: true },
          { id: "role", header: "Role", field: "role", sortable: true },
        ],
        rows: members,
      },
    });
    await sortBy(/Role/);
    expect(names()).toEqual(["Grace", "Linus", "Alan", "Ada"]);
    await sortBy(/Name/, { shiftKey: true });
    expect(names()).toEqual(["Alan", "Grace", "Linus", "Ada"]);
    await sortBy(/Name/, { shiftKey: true });
    expect(names()).toEqual(["Linus", "Grace", "Alan", "Ada"]);
  });

  it("drops only the cycled level when Shift+click takes it back to none", async () => {
    renderScores({ multiSort: true });
    await sortBy(/Name/);
    await sortBy(/Points/, { shiftKey: true }); // asc
    await sortBy(/Points/, { shiftKey: true }); // desc
    await sortBy(/Points/, { shiftKey: true }); // none
    expect(screen.getByRole("columnheader", { name: /Points/ }).getAttribute("aria-sort")).toBe("none");
    expect(screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort")).toBe("ascending");
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]);
  });
});
