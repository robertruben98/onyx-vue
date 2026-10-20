import type { ComponentDoc } from "../../docs-model";

export const statusDotDoc: ComponentDoc = {
  id: "status-dot",
  title: "Status Dot",
  description:
    "A small coloured dot reporting a state. Carries an accessible name so the state never depends on colour alone; without a name it is treated as decorative and hidden from assistive technology.",
  imports: ["UiStatusDot"],
  api: [
    {
      name: "state",
      type: "'live' | 'dead' | 'warn' | 'off' | 'unknown'",
      default: "'unknown'",
      description: "State the dot reports.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "Accessible name. When empty the dot is decorative and aria-hidden.",
    },
  ],
  demos: [
    {
      title: "States",
      code: `<UiStatusDot state="live" label="Up" />
<UiStatusDot state="warn" label="Degraded" />
<UiStatusDot state="dead" label="Down" />
<UiStatusDot state="off" label="Stopped" />
<UiStatusDot state="unknown" label="Unknown" />`,
    },
  ],
};
