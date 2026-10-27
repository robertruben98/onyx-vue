import type { ComponentDoc } from "../../docs-model";

export const sequenceGridDoc: ComponentDoc = {
  id: "sequence-grid",
  title: "Sequence Grid",
  description:
    "A numbered run of things, each one there or not: the episodes of a season on disk, the chapters done, the days of a streak. Every number is printed, and a gap differs from a present cell in colour, text and a dashed outline, so it does not depend on telling red from green.",
  imports: ["UiSequenceGrid"],
  api: [
    { name: "max", type: "number", default: "—", description: "The last number of the run." },
    {
      name: "missing",
      type: "number[]",
      default: "[]",
      description: "The numbers that are not there; every other number from `start` to `max` is.",
    },
    { name: "start", type: "number", default: "1", description: "The first number of the run." },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "What the run is. The accessible name adds the count and the gaps as ranges: \"Season 1 episodes: 9 of 12 present, missing 4, 10-11\".",
    },
    { name: "itemLabel", type: "string", default: "'Item'", description: "What one number is, for its tooltip." },
    { name: "presentLabel", type: "string", default: "'present'", description: "Word for a number that is there." },
    { name: "missingLabel", type: "string", default: "'missing'", description: "Word for a number that is not." },
  ],
  demos: [
    {
      title: "A season with gaps",
      code: `<UiSequenceGrid :max="12" :missing="[4, 10, 11]" label="Season 1 episodes" item-label="Episode" />`,
    },
    {
      title: "Complete",
      code: `<UiSequenceGrid :max="6" label="Chapters" item-label="Chapter" present-label="done" missing-label="to do" />`,
    },
    {
      title: "Not starting at 1",
      description: "A season numbered on from the last one, or a run that only matters from some point.",
      code: `<UiSequenceGrid :start="25" :max="36" :missing="[30, 31, 32]" item-label="Episode" />`,
    },
  ],
};
