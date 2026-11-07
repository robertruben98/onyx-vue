import { searchDocs } from "./search";

describe("searchDocs", () => {
  it("finds Data Table by typing 'table'", () => {
    const labels = searchDocs("table").map((r) => r.label);
    expect(labels).toContain("Data Table");
    expect(labels).toContain("Simple Table");
  });

  it("ranks a title that starts with the query before one that only contains it", () => {
    const labels = searchDocs("tab").map((r) => r.label);
    expect(labels.indexOf("Tabs")).toBeLessThan(labels.indexOf("Data Table"));
  });

  it("ignores case and surrounding whitespace, and matches the id and category", () => {
    expect(searchDocs("  DATA-table ").map((r) => r.label)).toContain("Data Table");
    expect(searchDocs("overlays").map((r) => r.label)).toContain("Dialog");
  });

  it("returns every entry for an empty query and nothing for gibberish", () => {
    expect(searchDocs("").length).toBeGreaterThan(100);
    expect(searchDocs("zzzzqqq")).toEqual([]);
  });

  it("each result carries its router path", () => {
    const dt = searchDocs("data table").find((r) => r.label === "Data Table");
    expect(dt?.path).toBe("/components/data-table");
  });
});
