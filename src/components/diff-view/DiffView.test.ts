import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render } from "@testing-library/vue";
import { axe } from "jest-axe";
import DiffView from "./DiffView.vue";
import { diffFileStats, parseUnifiedDiff, type DiffFile } from "./parse-diff";

const axeOptions = { rules: { region: { enabled: false } } };

const GIT = `diff --git a/src/a.ts b/src/a.ts
index 1111111..2222222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,4 +1,4 @@ export
 one
--- two
+two
 three
@@ -10,2 +10,3 @@
 ten
+eleven
 twelve
\\ No newline at end of file
diff --git a/old.txt b/old.txt
deleted file mode 100644
--- a/old.txt
+++ /dev/null
@@ -1 +0,0 @@
-gone
diff --git a/logo.png b/logo.png
Binary files a/logo.png and b/logo.png differ
diff --git a/x.md b/y.md
similarity index 90%
rename from x.md
rename to y.md
`;

describe("parseUnifiedDiff", () => {
  const files = parseUnifiedDiff(GIT);

  it("splits files and keeps both line numbers", () => {
    expect(files.map((f) => f.file)).toEqual(["src/a.ts", "old.txt", "logo.png", "y.md"]);
    const [h1, h2] = files[0].hunks;
    expect(h1.header).toBe("@@ -1,4 +1,4 @@ export");
    expect(h1.lines).toEqual([
      { kind: "ctx", old: 1, new: 1, text: "one" },
      { kind: "del", old: 2, new: null, text: "-- two" },
      { kind: "add", old: null, new: 2, text: "two" },
      { kind: "ctx", old: 3, new: 3, text: "three" },
    ]);
    expect(h2.lines.map((l) => [l.kind, l.old, l.new])).toEqual([
      ["ctx", 10, 10],
      ["add", null, 11],
      ["ctx", 11, 12],
    ]);
  });

  it("reads a removed line that starts with --- as a line, not a file", () => {
    expect(files[0].hunks[0].lines[1].kind).toBe("del");
  });

  it("names a deleted file by its old path, marks binaries and renames", () => {
    expect(files[1].hunks[0].lines).toEqual([{ kind: "del", old: 1, new: null, text: "gone" }]);
    expect(files[2].binary).toBe(true);
    expect(files[3].subject).toBe("renamed from x.md");
  });

  it("parses a plain diff -u with no git header", () => {
    const plain = parseUnifiedDiff("--- a.txt\t2026-10-31\n+++ b.txt\t2026-10-31\n@@ -1 +1 @@\n-a\n+b\n--- c\n+++ c\n@@ -1 +1,2 @@\n c\n+d\n");
    expect(plain.map((f) => [f.file, diffFileStats(f)])).toEqual([
      ["b.txt", { added: 1, removed: 1 }],
      ["c", { added: 1, removed: 0 }],
    ]);
  });

  it("returns no files for empty or headerless text", () => {
    expect(parseUnifiedDiff("")).toEqual([]);
    expect(parseUnifiedDiff("From abc Mon Sep 17\nSubject: x\n")).toEqual([]);
  });
});

describe("DiffView (Vue)", () => {
  it("shows one block per file with its path and +N −M", () => {
    const { container, getByRole } = render(DiffView, { props: { diff: GIT } });
    const region = getByRole("region", { name: "src/a.ts" });
    expect(region.querySelector(".ui-diff-view__path")!.textContent).toBe("src/a.ts");
    const stats = region.querySelector(".ui-diff-view__stats")!;
    expect(stats.textContent!.replace(/\s+/g, " ").trim()).toBe("+2 −1");
    expect(stats.getAttribute("aria-label")).toBe("2 added, 1 removed");
    expect(container.querySelectorAll(".ui-diff-view__file")).toHaveLength(4);
  });

  it("colours lines by kind and writes their sign and both numbers", () => {
    const { container } = render(DiffView, { props: { diff: GIT } });
    const lines = [...container.querySelectorAll(".ui-diff-view__file")[0].querySelectorAll(".ui-diff-view__line")];
    const del = lines.find((l) => l.classList.contains("ui-diff-view__line--del"))!;
    expect(del.querySelector(".ui-diff-view__sign")!.textContent).toBe("-");
    expect([...del.querySelectorAll(".ui-diff-view__num")].map((n) => n.textContent)).toEqual(["2", ""]);
    expect(container.querySelectorAll(".ui-diff-view__line--add")).toHaveLength(2);
    expect(container.querySelectorAll(".ui-diff-view__line--hunk")).toHaveLength(3);
  });

  it("hides the numbers with lineNumbers false", () => {
    const { container } = render(DiffView, { props: { diff: GIT, lineNumbers: false } });
    expect(container.querySelector(".ui-diff-view__num")).toBeNull();
  });

  it("folds and unfolds a file from its header, and says so", async () => {
    const { getAllByRole, emitted, container } = render(DiffView, { props: { diff: GIT } });
    const toggle = getAllByRole("button", { name: "src/a.ts" })[0];
    const body = container.querySelector(`#${toggle.getAttribute("aria-controls")}`) as HTMLElement;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(body.style.display).toBe("none");
    await fireEvent.click(toggle);
    expect(body.style.display).toBe("");
    const ev = emitted<[DiffFile, boolean]>("toggled");
    expect(ev.map(([f, open]) => [f.file, open])).toEqual([["src/a.ts", false], ["src/a.ts", true]]);
  });

  it("starts folded with collapsed, and a new diff starts folded again", async () => {
    const { getAllByRole, rerender } = render(DiffView, { props: { diff: GIT, collapsed: true } });
    expect(getAllByRole("button").every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
    await fireEvent.click(getAllByRole("button")[0]);
    await rerender({ diff: GIT.replace(/src\/a\.ts/g, "src/b.ts"), collapsed: true });
    expect(getAllByRole("button").every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
  });

  it("takes parsed files and prefers them over text", () => {
    const files: DiffFile[] = [{ file: "f.py", subject: "fix: x", hunks: [{ header: "@@ -1 +1 @@", lines: [{ kind: "add", old: null, new: 1, text: "y" }] }] }];
    const { container } = render(DiffView, { props: { files, diff: GIT } });
    expect([...container.querySelectorAll(".ui-diff-view__path")].map((p) => p.textContent)).toEqual(["f.py"]);
    expect(container.querySelector(".ui-diff-view__subject")!.textContent).toBe("fix: x");
  });

  it("gives every line to #line-actions and #line-after", () => {
    const { container } = render(DiffView, {
      props: { diff: GIT },
      slots: {
        "line-actions": `<template #line-actions="{ file, line }"><button type="button" class="c">{{ file.file }}:{{ line.new }}</button></template>`,
        "line-after": `<template #line-after="{ line }"><div v-if="line.kind === 'add'" class="after">{{ line.text }}</div></template>`,
      },
    });
    const first = container.querySelector(".ui-diff-view__line--ctx .ui-diff-view__actions .c")!;
    expect(first.textContent).toBe("src/a.ts:1");
    expect([...container.querySelectorAll(".after")].map((a) => a.textContent)).toEqual(["two", "eleven"]);
    // The comment sits under its line, not inside it.
    expect(container.querySelector(".after")!.previousElementSibling!.classList.contains("ui-diff-view__line--add")).toBe(true);
  });

  it("puts #file-actions in the header outside the fold button", () => {
    const { container } = render(DiffView, {
      props: { diff: GIT },
      slots: { "file-actions": `<template #file-actions="{ file }"><a href="#">{{ file.file }}</a></template>` },
    });
    const a = container.querySelector(".ui-diff-view__file-actions a")!;
    expect(a.closest("button")).toBeNull();
    expect(a.closest(".ui-diff-view__header")).not.toBeNull();
  });

  it("shows the binary note, and the empty text with no files", () => {
    const { getByText } = render(DiffView, { props: { diff: GIT, binaryText: "fichero binario" } });
    expect(getByText("fichero binario")).toBeTruthy();
    const empty = render(DiffView, { props: { diff: "", emptyText: "sin parches" } });
    expect(empty.container.querySelector(".ui-diff-view")).toBeNull();
    expect(empty.getByText("sin parches")).toBeTruthy();
  });

  it("renders a 2500-line diff whole", () => {
    const n = 2500;
    const body = Array.from({ length: n }, (_, i) => (i % 3 === 0 ? `+add ${i}` : i % 3 === 1 ? `-del ${i}` : ` ctx ${i}`));
    const adds = body.filter((l) => l[0] === "+").length;
    const dels = body.filter((l) => l[0] === "-").length;
    const text = `--- a/big.txt\n+++ b/big.txt\n@@ -1,${n - adds} +1,${n - dels} @@\n${body.join("\n")}\n`;
    const t0 = performance.now();
    const { container } = render(DiffView, { props: { diff: text } });
    const ms = performance.now() - t0;
    expect(container.querySelectorAll(".ui-diff-view__line:not(.ui-diff-view__line--hunk)")).toHaveLength(n);
    expect(container.querySelector(".ui-diff-view__stats")!.getAttribute("aria-label")).toBe(`${adds} added, ${dels} removed`);
    // A generous budget for jsdom on a busy machine; the point is "not quadratic".
    expect(ms).toBeLessThan(5000);
  });

  it("has no axe violations", async () => {
    const { container } = render(DiffView, { props: { diff: GIT } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("styles with tokens only, so both themes apply", () => {
    const scss = readFileSync(join(__dirname, "diff-view.scss"), "utf8");
    expect(scss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    const tokens = readFileSync(join(__dirname, "..", "..", "styles", "tokens.css"), "utf8");
    for (const t of scss.matchAll(/var\((--ui-diff-view-[a-z-]+)\)/g)) expect(tokens).toContain(`${t[1]}:`);
  });
});
