import type { ComponentDoc } from "../../docs-model";

export const courseSwitcherDoc: ComponentDoc = {
  id: "course-switcher",
  title: "Course Switcher",
  description:
    "The course picker of a learning app: a small icon with a number in the top bar (\"🇬🇧 56\") that opens a panel under the bar with a scrolling row of course tiles and, below them, a detail area such as a score card. Under `sheetBelow` (600px) the panel is a full-width sheet with the page dimmed, `aria-modal` and a focus trap; wider, a popover anchored to the trigger. Opening focuses the selected tile, Escape or a tap outside closes and returns focus to the trigger, arrows move between tiles, and the selected tile always follows the model, so a parent that refuses a change keeps the old course selected. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiCourseSwitcher", "UiProgressBar"],
  api: [
    { name: "options", type: "{ value: string; label: string; disabled?: boolean }[]", default: "—", description: "The courses, in order. `label` is the tile's visible and accessible name." },
    { name: "v-model", type: "string", default: "''", description: "The current course. `update:modelValue` is emitted only for an enabled course other than the current one." },
    { name: "v-model:open", type: "boolean", default: "false", description: "Open state of the panel." },
    { name: "label", type: "string", default: "—", description: "Accessible name of the trigger, e.g. \"Course: English, score 56\". The badge is `aria-hidden`, so put the number in the label too." },
    { name: "badge", type: "string | number", default: "undefined", description: "Short text beside the trigger icon: a score or a level." },
    { name: "panelLabel", type: "string", default: "''", description: "Accessible name of the panel (`role=\"dialog\"`). Falls back to `label`." },
    { name: "tilesLabel", type: "string", default: "'Courses'", description: "Accessible name of the tile group." },
    { name: "sheetBelow", type: "number", default: "600", description: "Viewport width (px) under which the panel is a full-width modal sheet under the app bar. `0` always uses the popover." },
    { name: "closeOnSelect", type: "boolean", default: "true", description: "Close after a different course is picked and the parent accepts it. Set `false` to keep the panel open while the switch loads (with `busy`)." },
    { name: "busy", type: "boolean", default: "false", description: "A switch is in progress: tiles are `aria-disabled` and not activatable, the panel is `aria-busy`." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables the trigger." },
    { name: "@changed", type: "(value: string) => void", default: "—", description: "A different, enabled course was picked (with `update:modelValue`)." },
    { name: "@opened / @closed", type: "() => void", default: "—", description: "After the panel opened (focus inside) or closed." },
    { name: "#icon", type: "slot { option, selected, place }", default: "two letters", description: "The course icon (a flag), drawn on the trigger (`place: 'trigger'`, the current course) and on each tile (`place: 'tile'`). Always `aria-hidden`; the name comes from the label." },
    { name: "#detail", type: "slot { option, close }", default: "—", description: "Content under the tiles, e.g. a score card with a link." },
    { name: "#trigger-extra", type: "slot", default: "—", description: "Extra content inside the trigger, after the badge." },
  ],
  demos: [
    {
      title: "Flag, score and score card",
      description: "Tap the trigger; on a phone the panel spans the width under the bar.",
      code: `<UiCourseSwitcher v-model="course" :options="[{ value: 'en', label: 'English' }, { value: 'fr', label: 'French' }, { value: 'de', label: 'German', disabled: true }]" label="Course: English, score 56" badge="56">
  <template #icon="{ option }">
    <svg v-if="option.value === 'fr'" viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055a4" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#ef4135" /></svg>
    <svg v-else-if="option.value === 'de'" viewBox="0 0 5 3"><rect width="5" height="1" fill="#000" /><rect y="1" width="5" height="1" fill="#dd0000" /><rect y="2" width="5" height="1" fill="#ffce00" /></svg>
    <svg v-else viewBox="0 0 3 2"><rect width="3" height="2" fill="#3b5bdb" /></svg>
  </template>
  <template #detail>
    <div style="display: flex; align-items: center; gap: 8px"><strong>56</strong><UiProgressBar :value="40" label="Progress to 57" style="flex: 1" /><strong>57</strong></div>
    <p>Your score is 56.</p>
  </template>
</UiCourseSwitcher>`,
      setup: () => ({ course: "en" }),
    },
    {
      title: "Without icons",
      code: `<UiCourseSwitcher v-model="course" :options="[{ value: 'en', label: 'English' }, { value: 'no', label: 'Norsk' }]" label="Course: Norsk" />`,
      setup: () => ({ course: "no" }),
    },
  ],
};
