import type { ComponentDoc } from "../../docs-model";

export const countdownDoc: ComponentDoc = {
  id: "countdown",
  title: "Countdown",
  description:
    "A live countdown to a moment: \"13 h 18 min to the written exam\". The figure updates every tick, but it is a role=timer that is not a chatty live region: a screen reader reads the whole sentence when it gets there, and `announce` speaks only at coarse steps. Emits `ended` once at zero and stops its timer, also when unmounted.",
  imports: ["UiCountdown"],
  api: [
    { name: "to", type: "Date | string | number", default: "—", description: "The moment: a Date, an ISO string or epoch ms." },
    { name: "units", type: "('days' | 'hours' | 'minutes' | 'seconds')[] | 'auto'", default: "'auto'", description: "Units shown. `auto` is days, hours and minutes without the leading zero units. The smallest unit rounds up, so the display reaches 0 with the time." },
    { name: "format", type: "'long' | 'short'", default: "'long'", description: "`long` \"13 h 18 min\", `short` \"13:18\" (days stay apart: \"2 d 13:18\")." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Size of the figure (--ui-countdown-value-size-*)." },
    { name: "label", type: "string", default: "''", description: "Text after the figure and end of the spoken sentence: \"to the written exam\"." },
    { name: "tick", type: "number", default: "1000 with seconds, else 30000", description: "Update interval in ms." },
    { name: "now", type: "Date | string | number | (() => …)", default: "Date.now", description: "Clock, for tests: a fixed moment, or a function read on every tick." },
    { name: "announce", type: "boolean", default: "false", description: "aria-live=polite. The spoken sentence then changes only per day, hour, ten minutes, then minute." },
    { name: "unitLabels", type: "Partial<CountdownUnitLabels>", default: "English", description: "Unit words { short, one, other } per unit, for another language." },
    { name: "@ended", type: "() => void", default: "—", description: "Once, at zero (also on mount if the moment has passed). A later `to` re-arms it." },
    { name: "#ended", type: "slot", default: "—", description: "Replaces the figure once the time is up." },
  ],
  demos: [
    {
      title: "To the exam",
      setup: () => ({ exam: Date.now() + (13 * 60 + 18) * 60_000 - 1 }),
      code: `<UiCountdown :to="exam" size="lg" label="to the written exam" />`,
    },
    {
      title: "Days, short format, seconds",
      setup: () => ({ later: Date.now() + 2 * 86_400_000 + 5 * 3_600_000, soon: Date.now() + 4 * 60_000 }),
      code: `<UiCountdown :to="later" />
<UiCountdown :to="later" format="short" />
<UiCountdown :to="soon" :units="['minutes', 'seconds']" format="short" size="sm" label="left" />`,
    },
    {
      title: "Ended",
      setup: () => ({ past: Date.now() - 1000 }),
      code: `<UiCountdown :to="past" label="to the exam">
  <template #ended>The exam has started. Good luck!</template>
</UiCountdown>`,
    },
  ],
};
