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
      name: "@checkedChanged / @checkedChange",
      type: "(value: boolean) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`. `@checkedChange` is the deprecated name of the same event, still emitted until 1.0.",
    },
  ],
  demos: [
    {
      title: "Long labels in a narrow column",
      description: "Controls keep their token size and align with the first line when the label wraps. Unlabelled controls keep their existing alignment.",
      code: `<div style="display: grid; gap: 8px; width: 100%; max-width: 390px">
  <UiSwitch label="Short label" />
  <UiSwitch label="Review the notification settings before continuing with your subscription and confirm the changes for everyone in your household" />
</div>`,
    },
    {
      title: "Basic",
      code: `<UiSwitch v-model="on" label="Enable notifications" />
<span>{{ on ? 'on' : 'off' }}</span>`,
      setup: () => ({ on: false }),
    },
    { title: "Disabled", code: `<UiSwitch disabled label="Disabled" />` },
  ],
};
