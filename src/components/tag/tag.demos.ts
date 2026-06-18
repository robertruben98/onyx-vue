import type { Demo } from "../button/button.demos";

export const tagDemos: Demo[] = [
  { title: "Neutral", props: { variant: "neutral" }, slot: "Neutral" },
  { title: "Info", props: { variant: "info" }, slot: "Info" },
  { title: "Success", props: { variant: "success" }, slot: "Success" },
  { title: "Warning", props: { variant: "warning" }, slot: "Warning" },
  { title: "Danger", props: { variant: "danger" }, slot: "Danger" },
  {
    title: "Removable",
    props: { variant: "info", removable: true },
    slot: "Angular",
  },
];
