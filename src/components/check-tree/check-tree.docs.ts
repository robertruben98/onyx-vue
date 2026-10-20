import type { ComponentDoc } from "../../docs-model";

export const checkTreeDoc: ComponentDoc = {
  id: "check-tree",
  title: "Check Tree",
  description:
    "Two levels of checkboxes for choosing what counts: a group, and what hangs off it. The model is the list of keys that are OFF, never the selection — storing what is excluded is what makes tomorrow's new item count by default instead of disappearing because it was not in a preference written last month. Unchecking the last child promotes the exception to its group, so `all children off` and `group off` are never two different stored states that look identical on screen.",
  imports: ["UiCheckTree"],
  api: [
    {
      name: "groups",
      type: "CheckTreeGroup[]",
      default: "[]",
      description:
        "`{ key, label, note?, items? }`. A group with no `items` is a first-level leaf — it still has its own checkbox.",
    },
    {
      name: "v-model:excluded",
      type: "string[]",
      default: "[]",
      description:
        "The keys that are off. A leaf counts only when neither its own key nor its group's is in here.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Accessible name for the whole list.",
    },
    {
      name: "emptyText",
      type: "string",
      default: "''",
      description: "Shown when there is nothing to choose from.",
    },
    {
      name: "@toggled",
      type: "(key: string, on: boolean)",
      default: "—",
      description: "Fired after the model is updated, for the key the user actually clicked.",
    },
  ],
  demos: [
    {
      title: "Which repos count",
      description:
        "The group's box goes to a dash as soon as one child is off: with a tick or an empty box it would claim `all` or `none` in front of a `some`.",
      code: `<UiCheckTree
  v-model:excluded="excluded"
  :groups="groups"
  label="repos que cuentan"
/>
<p style="font-size:12px;color:var(--ui-color-text-muted)">fuera: {{ excluded.join(", ") || "nada" }}</p>`,
      setup: () => ({
        excluded: ["~/Workspaces/robertdev/onyx"],
        groups: [
          {
            key: "~/Workspaces/sm23",
            label: "sm23",
            note: "33 repos locales · 37 hoy",
            items: [
              { key: "~/Workspaces/sm23/APIs/tiendasopenidconnect", label: "tiendasopenidconnect", note: "19 hoy" },
              { key: "~/Workspaces/sm23/Procesamiento/apiTreewPayment", label: "apiTreewPayment", note: "15 hoy" },
            ],
          },
          {
            key: "~/Workspaces/robertdev",
            label: "robertdev",
            note: "53 repos locales · 25 hoy",
            items: [
              { key: "~/Workspaces/robertdev/control-panel", label: "control-panel", note: "18 hoy" },
              { key: "~/Workspaces/robertdev/onyx", label: "onyx", note: "7 hoy" },
            ],
          },
        ],
      }),
    },
    {
      title: "A group that is off",
      description:
        "Its children stay visible and keep their marks, but they are dimmed and unclickable: while the group is off, none of them counts.",
      code: `<UiCheckTree v-model:excluded="excluded" :groups="groups" label="grupos" />`,
      setup: () => ({
        excluded: ["b"],
        groups: [
          { key: "a", label: "cuenta", note: "2 dentro", items: [{ key: "a1", label: "uno" }, { key: "a2", label: "dos" }] },
          { key: "b", label: "no cuenta", note: "2 dentro", items: [{ key: "b1", label: "uno" }, { key: "b2", label: "dos" }] },
          { key: "c", label: "sin hijos" },
        ],
      }),
    },
  ],
};
