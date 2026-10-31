// El modelo del diff y su parser. Es la misma forma que sirve control-panel
// (`web/src/agents/packageDiff.ts`), asi que su respuesta entra tal cual en
// `files` sin pasar por aqui.

/** What a line does: added, removed, or unchanged context. */
export type DiffLineKind = "add" | "del" | "ctx";

export interface DiffLine {
  kind: DiffLineKind;
  /** Line number on the old side; `null` for an added line. */
  old: number | null;
  /** Line number on the new side; `null` for a removed line. */
  new: number | null;
  /** The line's text, without its `+` / `-` / ` ` prefix. */
  text: string;
}

export interface DiffHunk {
  /** The `@@ -a,b +c,d @@ …` line. */
  header: string;
  lines: DiffLine[];
}

export interface DiffFile {
  /** Path of the file (the new one, or the old one when it was deleted). */
  file: string;
  /** A second line for the header: the commit subject, "renamed from …". */
  subject?: string;
  /** A binary file has no lines to show. */
  binary?: boolean;
  hunks: DiffHunk[];
}

export interface DiffStats {
  added: number;
  removed: number;
}

/** Lines added and removed in one file. */
export function diffFileStats(file: DiffFile): DiffStats {
  let added = 0;
  let removed = 0;
  for (const h of file.hunks) {
    for (const l of h.lines) {
      if (l.kind === "add") added++;
      else if (l.kind === "del") removed++;
    }
  }
  return { added, removed };
}

const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/** `a/src/x.ts` → `src/x.ts`; `/dev/null` → `null`. */
function stripPath(raw: string): string | null {
  const path = raw.split("\t")[0].trim();
  if (path === "/dev/null") return null;
  return path.replace(/^[ab]\//, "");
}

/**
 * Parses a unified diff (`git diff`, `git format-patch`, `diff -u`) into files.
 *
 * Inside a hunk the parser counts the lines the header promised, so a removed
 * line that reads `--- foo` is a removed line and not the start of the next
 * file. Anything outside a file (a patch's mail headers, its commit message) is
 * skipped. A `Binary files … differ` line marks the file binary.
 */
export function parseUnifiedDiff(text: string): DiffFile[] {
  const files: DiffFile[] = [];
  let file: DiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let oldNo = 0;
  let newNo = 0;
  let oldLeft = 0;
  let newLeft = 0;
  let oldPath: string | null = null;

  const startFile = (path: string): DiffFile => {
    const f: DiffFile = { file: path, hunks: [] };
    files.push(f);
    hunk = null;
    oldLeft = newLeft = 0;
    return f;
  };

  const lines = text.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();

  for (const raw of lines) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;

    // Inside a hunk, the header's counts decide what a line is.
    if (hunk && (oldLeft > 0 || newLeft > 0)) {
      const sign = line[0];
      const body = line.slice(1);
      if (sign === "+" && newLeft > 0) {
        hunk.lines.push({ kind: "add", old: null, new: newNo++, text: body });
        newLeft--;
        continue;
      }
      if (sign === "-" && oldLeft > 0) {
        hunk.lines.push({ kind: "del", old: oldNo++, new: null, text: body });
        oldLeft--;
        continue;
      }
      if ((sign === " " || line === "") && oldLeft > 0 && newLeft > 0) {
        hunk.lines.push({ kind: "ctx", old: oldNo++, new: newNo++, text: body });
        oldLeft--;
        newLeft--;
        continue;
      }
      if (sign === "\\") continue; // "\ No newline at end of file"
      // The hunk ended early (a truncated diff): fall through and read the line fresh.
      oldLeft = newLeft = 0;
    }
    if (line.startsWith("\\")) continue;

    if (line.startsWith("diff --git ")) {
      const m = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      file = startFile(m ? m[2] : line.slice(11));
      oldPath = m ? m[1] : null;
      continue;
    }
    if (line.startsWith("--- ")) {
      oldPath = stripPath(line.slice(4));
      continue;
    }
    if (line.startsWith("+++ ")) {
      const path = stripPath(line.slice(4)) ?? oldPath ?? "";
      // A plain `diff -u` has no `diff --git` line: the `+++` opens the file.
      if (!file || file.hunks.length) file = startFile(path);
      else file.file = path;
      continue;
    }
    if (file && line.startsWith("rename from ")) {
      file.subject = `renamed from ${line.slice(12)}`;
      continue;
    }
    if (file && /^Binary files .* differ$/.test(line)) {
      file.binary = true;
      continue;
    }
    const m = HUNK.exec(line);
    if (m && file) {
      oldNo = Number(m[1]);
      newNo = Number(m[3]);
      oldLeft = m[2] === undefined ? 1 : Number(m[2]);
      newLeft = m[4] === undefined ? 1 : Number(m[4]);
      hunk = { header: line, lines: [] };
      file.hunks.push(hunk);
    }
  }
  return files;
}
