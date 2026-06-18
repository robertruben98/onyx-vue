import type { Demo } from "../button/button.demos";

export const alertDemos: Demo[] = [
  {
    title: "Info",
    props: { variant: "info", title: "Info" },
    slot: "An informational message.",
  },
  {
    title: "Success",
    props: { variant: "success", title: "Success" },
    slot: "It worked.",
  },
  {
    title: "Warning",
    props: { variant: "warning", title: "Warning" },
    slot: "Careful now.",
  },
  {
    title: "Danger",
    props: { variant: "danger", title: "Error" },
    slot: "Something broke.",
  },
  {
    title: "Dismissible",
    props: { variant: "info", dismissible: true },
    slot: "Dismiss me.",
  },
];
