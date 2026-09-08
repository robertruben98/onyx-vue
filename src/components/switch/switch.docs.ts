import type { ComponentDoc } from "../../docs-model";

export const switchDoc: ComponentDoc = {
  id: "switch",
  title: "Switch",
  description:
    "On/off control for a setting that applies immediately. Use a Checkbox instead when the value is submitted with a form.",
  imports: ["UiSwitch"],
  api: [
    { name: "v-model", type: "boolean", default: "false", description: "Two-way checked state." },
    { name: "label", type: "string", default: "''", description: "Visible label." },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when there is no visible label.",
    },
    { name: "invalid", type: "boolean", default: "false", description: "Sets `aria-invalid`." },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "A disabled switch never emits `checkedChange`.",
    },
    {
      name: "@checkedChange",
      type: "(value: boolean) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiSwitch v-model="on" label="Enable notifications" />
<span>{{ on ? 'on' : 'off' }}</span>`,
      setup: () => ({ on: false }),
    },
    { title: "Disabled", code: `<UiSwitch disabled label="Disabled" />` },
  ],
};
