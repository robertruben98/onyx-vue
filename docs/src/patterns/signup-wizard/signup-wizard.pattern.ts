import type { PatternDoc } from "../types";

export const signupWizardPattern: PatternDoc = {
  id: "signup-wizard",
  title: "Sign-up wizard",
  summary:
    "Create a workspace in four steps: account, workspace, plan and review. Each step checks its own fields, and focus follows the flow: to the step's heading, or to the first field to fix.",
  order: 18,
  frameHeight: 980,
  page: () => import("./SignupWizardPage.vue"),
  notes: {
    builtBy: "Claude Code (an AI agent: the time is its wall clock, not a person's)",
    minutes: 6,
    builtOn: "2026-10-04",
    gaps: [
      {
        summary:
          "UiSegmented has no visible label and no ariaLabelledby, and UiFormField cannot wrap it (a radio group is not labelled by <label for>), so the page writes its own label and repeats the words in aria-label.",
        natives: 0,
      },
      {
        summary:
          "UiRadioGroup options carry only a label: each plan's name, price and blurb are squeezed into one string instead of a name with a description.",
        natives: 0,
      },
      {
        summary:
          "UiStepper only lays out vertically: four rows above the form, where a wizard's progress usually fits on one line.",
        natives: 0,
      },
    ],
    takeaway:
      "Field wiring, validation messages and focus took no CSS and no ARIA by hand. Building it caught a library bug, fixed in the same branch: a disabled UiButton looked exactly like an enabled one, because every variant's colours beat the disabled rule.",
  },
};
