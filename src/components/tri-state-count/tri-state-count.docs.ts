import type { ComponentDoc } from "../../docs-model";

export const triStateCountDoc: ComponentDoc = {
  id: "tri-state-count",
  title: "Tri-State Count",
  description:
    "A number, or the reason there is no number. Zero is a fact, a dot means the data is in flight, and a dash means nobody asked for it — three states a plain counter collapses into one misleading zero.",
  imports: ["UiTriStateCount"],
  api: [
    {
      name: "state",
      type: "'known' | 'pending' | 'unrequested'",
      default: "'known'",
      description: "Which of the three things this counter is.",
    },
    {
      name: "value",
      type: "number | null",
      default: "null",
      description: "The count. Only read when state is 'known'.",
    },
    {
      name: "tone",
      type: "'neutral' | 'ok' | 'warn' | 'danger'",
      default: "'neutral'",
      description: "Semantic tone. Ignored unless the value is known.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "What is being counted, for the accessible name.",
    },
    {
      name: "pendingGlyph",
      type: "string",
      default: "'·'",
      description: "Stand-in shown while loading.",
    },
    {
      name: "unrequestedGlyph",
      type: "string",
      default: "'—'",
      description: "Stand-in shown when the data was never requested.",
    },
  ],
  demos: [
    {
      title: "The three states",
      description:
        "A zero and a dash are not the same claim. The first says there is nothing; the second says nobody looked.",
      code: `<UiTriStateCount :value="12" label="pull requests" />
<UiTriStateCount :value="0" label="conflicts" />
<UiTriStateCount state="pending" />
<UiTriStateCount state="unrequested" />`,
    },
    {
      title: "Tones",
      code: `<UiTriStateCount :value="3" tone="ok" label="ready to merge" />
<UiTriStateCount :value="7" tone="warn" label="stale" />
<UiTriStateCount :value="2" tone="danger" label="secrets" />`,
    },
  ],
};
