import { render } from "@testing-library/vue";
import type { Component } from "vue";
import * as onyx from "../../src/index";
import { COMPONENT_DOCS } from "./registry";
import { demoComponent } from "./demo";

const components: Record<string, Component> = {};
for (const [name, value] of Object.entries(onyx)) {
  if (name.startsWith("Ui")) components[name] = value as Component;
}

const cases = COMPONENT_DOCS.flatMap((doc) =>
  doc.demos.map((demo) => [`${doc.id} / ${demo.title}`, demo] as const),
);

describe("every docs demo", () => {
  it.each(cases)("%s mounts without Vue warnings or errors", (_name, demo) => {
    const problems: string[] = [];
    const warn = vi.spyOn(console, "warn").mockImplementation((...a) => {
      problems.push(a.map(String).join(" "));
    });
    const error = vi.spyOn(console, "error").mockImplementation((...a) => {
      problems.push(a.map(String).join(" "));
    });
    try {
      const { unmount } = render(demoComponent(demo), {
        global: {
          components,
          config: {
            warnHandler: (msg) => problems.push(`[Vue warn] ${msg}`),
            errorHandler: (err) => problems.push(`error: ${String(err)}`),
          },
        },
      });
      unmount();
    } catch (err) {
      problems.push(`threw: ${String(err)}`);
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
    expect(problems).toEqual([]);
  });
});
