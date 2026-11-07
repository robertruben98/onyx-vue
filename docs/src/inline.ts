/** A run of text from {@link splitInline}: plain, or `code`. */
export interface InlineSegment {
  code: boolean;
  text: string;
}

/**
 * Splits text on `backtick` spans. The metadata files (`*.docs.ts`) write
 * inline code with Markdown backticks; the API table renders them as <code>
 * instead of showing the backticks. An unmatched backtick stays literal.
 */
export function splitInline(text: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let rest = text;
  while (rest) {
    const open = rest.indexOf("`");
    const close = open === -1 ? -1 : rest.indexOf("`", open + 1);
    if (open === -1 || close === -1) {
      out.push({ code: false, text: rest });
      break;
    }
    if (open > 0) out.push({ code: false, text: rest.slice(0, open) });
    out.push({ code: true, text: rest.slice(open + 1, close) });
    rest = rest.slice(close + 1);
  }
  return out;
}
