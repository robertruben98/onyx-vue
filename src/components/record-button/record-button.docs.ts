import type { ComponentDoc } from "../../docs-model";

export const recordButtonDoc: ComponentDoc = {
  id: "record-button",
  title: "Record Button",
  description:
    "The big microphone toggle of a spoken answer, with idle, recording and busy states. It is a toggle button (`aria-pressed` while recording); recording pulses (a static halo under reduced motion) and busy shows a spinner with `aria-busy`. A level meter and a timer go in slots that are hidden from assistive tech. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiRecordButton"],
  api: [
    { name: "recording", type: "boolean", default: "false", description: "Recording now: `aria-pressed=\"true\"`, the danger colour and the pulse." },
    { name: "busy", type: "boolean", default: "false", description: "Processing the recording: spinner, `aria-busy`, not activatable. Keeps its colour instead of turning grey." },
    { name: "disabled", type: "boolean", default: "false", description: "Not activatable." },
    { name: "label", type: "string", default: "'Record'", description: "Visible label and accessible name." },
    { name: "recordingLabel", type: "string", default: "undefined", description: "Visible label while recording (e.g. 'Stop'). Defaults to `label`." },
    { name: "busyLabel", type: "string", default: "undefined", description: "Visible label while busy (e.g. 'Transcribing…'). Defaults to `label`." },
    { name: "size", type: "'md' | 'lg'", default: "'lg'", description: "`lg` is 56px (`--ui-record-button-height`), for the main action of a screen; `md` is a large control tall." },
    { name: "block", type: "boolean", default: "false", description: "Full width of the container." },
    { name: "@toggled", type: "(recording: boolean) => void", default: "—", description: "Emitted on activation with the state the button is moving to. Never while busy or disabled." },
    { name: "#icon", type: "slot { recording }", default: "microphone / stop", description: "Replaces the built-in glyph (a microphone, a stop square while recording)." },
    { name: "#detail", type: "slot", default: "—", description: "Extra text after the label, such as the elapsed time. `aria-hidden`: announce time limits from a status region." },
    { name: "#meter", type: "slot", default: "—", description: "A level meter (UiLevelMeter), shown only while recording. `aria-hidden`." },
  ],
  demos: [
    {
      title: "Idle, recording and busy",
      code: `<div style="display: grid; gap: 12px; max-width: 320px">
  <UiRecordButton label="Record my answer" block />
  <UiRecordButton label="Record my answer" recording-label="Stop" recording block>
    <template #detail>0:12</template>
  </UiRecordButton>
  <UiRecordButton label="Record my answer" busy-label="Transcribing…" busy block />
</div>`,
    },
    {
      title: "Medium and disabled",
      code: `<UiRecordButton size="md" label="Record" />
<UiRecordButton size="md" label="Record" disabled />`,
    },
  ],
};
