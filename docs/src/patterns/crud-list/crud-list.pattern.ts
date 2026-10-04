import type { PatternDoc } from "../types";

export const crudListPattern: PatternDoc = {
  id: "crud-list",
  title: "Customers (list and edit)",
  summary:
    "Find a customer, open it, edit it, or act on many at once: search and filters, a selectable table, bulk actions, a drawer with the record and its form, confirmations and toasts.",
  order: 15,
  frameHeight: 1240,
  page: () => import("./CrudListPage.vue"),
  notes: {
    builtBy: "Claude Code (an AI agent: the time is its wall clock, not a person's)",
    minutes: 7,
    builtOn: "2026-10-04",
    gaps: [
      {
        summary:
          "UiFormField hands its control an id, the ids for aria-describedby and the invalid flag through the slot, so every field repeats three bindings. It could provide them to the control it wraps instead.",
        natives: 0,
      },
      {
        summary:
          "DescriptionItem.tone still says default where the rest of the library now says neutral: the tone vocabulary was unified for props, not for data fields.",
        natives: 0,
      },
    ],
    takeaway:
      "The page needed no native control and almost no CSS: UiStack laid out the toolbar, the drawer footer and the form, so the only hand-written styles are the name cell's two lines and its ellipsis.",
  },
};
