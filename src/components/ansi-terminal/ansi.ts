/**
 * A tiny SGR ("Select Graphic Rendition") parser: the subset of ANSI escape
 * codes that programs use to colour their output — reset, bold, dim, the eight
 * foreground colours and their bright variants.
 *
 * It is stateful on purpose. Output arrives in chunks, and a colour opened in
 * one chunk is still open in the next: parsing each chunk from a clean state
 * paints the second half of a red error in the default colour. `feed()` keeps
 * the open attributes between calls; `reset()` forgets them.
 *
 * Everything that is not an SGR sequence is text. Other escapes (cursor moves,
 * erase line) are dropped rather than printed as garbage.
 */

/** A run of text with the attributes that were open over it. */
export interface AnsiSegment {
  text: string;
  /** Foreground colour code: 30–37 or 90–97, or null for the default. */
  fg: number | null;
  bold: boolean;
  dim: boolean;
}

export interface AnsiParser {
  /** Parses the next chunk, continuing from the state the last one left. */
  feed(chunk: string): AnsiSegment[];
  /** Forgets any open attribute. */
  reset(): void;
}

// SGR with its parameters, or any other CSI sequence (dropped).
const ESCAPE = /\u001b\[([0-9;?]*)([A-Za-z])/g;

export function createAnsiParser(): AnsiParser {
  let fg: number | null = null;
  let bold = false;
  let dim = false;

  function apply(params: string): void {
    for (const raw of params.split(";")) {
      const n = raw === "" ? 0 : Number.parseInt(raw, 10);
      if (Number.isNaN(n)) continue;
      if (n === 0) {
        fg = null;
        bold = false;
        dim = false;
      } else if (n === 1) bold = true;
      else if (n === 2) dim = true;
      else if (n === 22) {
        bold = false;
        dim = false;
      } else if (n === 39) fg = null;
      else if ((n >= 30 && n <= 37) || (n >= 90 && n <= 97)) fg = n;
    }
  }

  return {
    feed(chunk: string): AnsiSegment[] {
      const out: AnsiSegment[] = [];
      let last = 0;
      const push = (text: string) => {
        if (!text) return;
        const prev = out[out.length - 1];
        if (prev && prev.fg === fg && prev.bold === bold && prev.dim === dim) prev.text += text;
        else out.push({ text, fg, bold, dim });
      };
      ESCAPE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = ESCAPE.exec(chunk))) {
        push(chunk.slice(last, m.index));
        last = ESCAPE.lastIndex;
        if (m[2] === "m") apply(m[1]);
      }
      push(chunk.slice(last));
      return out;
    },
    reset(): void {
      fg = null;
      bold = false;
      dim = false;
    },
  };
}

/** Class names of a segment, shared by the component and any static renderer. */
export function ansiClasses(seg: AnsiSegment): string[] {
  const cls: string[] = [];
  if (seg.fg !== null) cls.push(`ui-ansi-fg-${seg.fg}`);
  if (seg.bold) cls.push("ui-ansi-bold");
  if (seg.dim) cls.push("ui-ansi-dim");
  return cls;
}

/** Text without any escape sequence, for copying and downloads. */
export function stripAnsi(text: string): string {
  return text.replace(ESCAPE, "");
}
