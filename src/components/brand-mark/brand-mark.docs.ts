import type { ComponentDoc } from "../../docs-model";

export const brandMarkDoc: ComponentDoc = {
  id: "brand-mark",
  title: "Brand Mark",
  description:
    "The head of a rail: a letter tile and the tool's name, with an optional secondary line. The tile is decorative; with href the whole mark becomes a link back to the tool's home.",
  imports: ["UiBrandMark"],
  api: [
    { name: "mark", type: "string", default: "—", description: "Two or three letters for the tile." },
    { name: "name", type: "string", default: "—", description: "The tool's name." },
    { name: "sub", type: "string", default: "''", description: "Secondary line: a host, a port, a section." },
    { name: "href", type: "string", default: "''", description: "Makes the whole mark a link." },
  ],
  demos: [
    {
      title: "Plain and linked",
      code: `<UiBrandMark mark="AG" name="Agents" />
<UiBrandMark mark="S" name="SM23" sub="control-panel :9100" href="#" />`,
    },
  ],
};
