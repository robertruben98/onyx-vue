import type { ComponentDoc } from "../../docs-model";

export const appShellDoc: ComponentDoc = {
  id: "app-shell",
  title: "App Shell",
  description:
    "The frame of a console page: a sticky navigation rail and the content beside it. The rail scrolls on its own and never sideways; below 900px it stacks above the content. The shell paints no background, so a preset's atmosphere shows through the rail.",
  imports: ["UiAppShell", "UiBrandMark", "UiNavRail", "UiNavRailItem"],
  api: [
    {
      name: "label",
      type: "string",
      default: "'Navigation'",
      description: "Accessible name of the rail landmark (an <aside>).",
    },
    { name: "#rail", type: "slot", default: "—", description: "The rail: usually a brand mark and a UiNavRail." },
    { name: "default", type: "slot", default: "—", description: "The page content." },
  ],
  demos: [
    {
      title: "Rail and content",
      description: "The demo is boxed to 220px high; in a page the rail is the viewport's height.",
      code: `<div style="height: 220px; overflow: hidden; border: 1px solid var(--ui-color-border)">
  <UiAppShell label="Agents">
    <template #rail>
      <UiBrandMark mark="AG" name="Agents" />
      <UiNavRail label="Views">
        <UiNavRailItem label="Todos los agentes" :count="12" active />
        <UiNavRailItem label="Analisis" />
      </UiNavRail>
    </template>
    <p style="padding: 16px">content</p>
  </UiAppShell>
</div>`,
    },
  ],
};
