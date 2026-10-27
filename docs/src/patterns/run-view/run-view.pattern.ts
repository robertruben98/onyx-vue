import type { PatternDoc } from "../types";

export const runViewPattern: PatternDoc = {
  id: "run-view",
  title: "Run view",
  summary:
    "The run view of the OIDC bench: progress, readouts and a console that only lists what needs a look. Built from a real capture.",
  order: 20,
  frameHeight: 900,
  page: () => import("./RunViewPage.vue"),
  notes: {
    builtBy: "Claude Code, before the pattern registry existed",
    minutes: null,
    builtOn: "2026-09-11",
    gaps: [
      {
        summary:
          "The expandable console rows are a native <button>: UiButton puts aria-expanded on its wrapper <span>, not on the button (G1).",
        natives: 1,
      },
    ],
  },
};
