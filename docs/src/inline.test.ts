import { splitInline } from "./inline";

describe("splitInline", () => {
  it("turns `code` spans into code segments without the backticks", () => {
    expect(splitInline("Turns the legend into `filter` buttons.")).toEqual([
      { code: false, text: "Turns the legend into " },
      { code: true, text: "filter" },
      { code: false, text: " buttons." },
    ]);
  });

  it("leaves text without backticks alone and keeps an unmatched backtick", () => {
    expect(splitInline("plain")).toEqual([{ code: false, text: "plain" }]);
    expect(splitInline("odd ` tick")).toEqual([{ code: false, text: "odd ` tick" }]);
  });

  it("handles several spans and an empty string", () => {
    expect(splitInline("`a` and `b`").filter((s) => s.code).map((s) => s.text)).toEqual(["a", "b"]);
    expect(splitInline("")).toEqual([]);
  });
});
