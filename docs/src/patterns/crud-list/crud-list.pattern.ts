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
    gaps: [],
    takeaway:
      "The page needed no native control and almost no CSS: UiStack laid out the toolbar, the drawer footer and the form. Building it surfaced two gaps, both fixed right after: every UiFormField control repeated :id, :aria-describedby and :invalid (the field now wires its control itself, so the form here has no bindings), and DescriptionItem.tone still said default (it now says neutral).",
  },
};
