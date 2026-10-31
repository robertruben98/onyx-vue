import type { ComponentDoc } from "../../docs-model";

export const timelineDoc: ComponentDoc = {
  id: "timeline",
  title: "Timeline",
  description:
    "What happened to one thing, newest first: the versions of an idea, the decisions taken on it. Each event has a date, a title, an optional state tag and a body (text or a slot). It sorts the events itself, so the caller can pass them in the order they were stored. It is not a gantt — nothing has a duration, so nothing is drawn to scale. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiTimeline"],
  api: [
    { name: "events", type: "TimelineEvent[]", default: "—", description: "`{ id?, date, title, body?, tag?, tagTone? }`, in any order. Sorted newest first; an unreadable date goes last." },
    { name: "dateFormat", type: "'absolute' | 'relative'", default: "'absolute'", description: "`relative` writes the age (`3d`, via UiRelativeTime) with the full date as tooltip." },
    { name: "locale", type: "string", default: "browser", description: "Locale of absolute dates." },
    { name: "dateOptions", type: "Intl.DateTimeFormatOptions", default: "{ dateStyle: 'medium' }", description: "Format of absolute dates." },
    { name: "formatDate", type: "(date: Date) => string", default: "—", description: "Writes the absolute date yourself (`31-10`). Wins over locale and dateOptions." },
    { name: "now", type: "Date", default: "new Date()", description: "Clock for relative dates." },
    { name: "units", type: "RelativeUnits", default: "m / h / d / mo", description: "Suffixes of relative dates, for a page in another language." },
    { name: "label", type: "string", default: "'History'", description: "Accessible name of the list." },
    { name: "emptyText", type: "string", default: "'Nothing has happened yet'", description: "Shown when there are no events." },
    { name: "#event", type: "slot { event, index }", default: "body", description: "The body of one event. Replaces `body`." },
    { name: "#empty", type: "slot", default: "emptyText", description: "Replaces the empty text." },
  ],
  demos: [
    {
      title: "The versions of an idea",
      description: "Passed oldest first; shown newest first. The newest dot is filled: it is the version that still holds.",
      code: `<UiTimeline :events="events" :format-date="dm" label="History of the idea" />`,
      setup: () => ({
        events: [
          { id: 1, date: "2026-10-15", title: "v1 · critic + confirm", body: "Confidence 58. Dismissed: not mature enough.", tag: "dismissed", tagTone: "danger" },
          { id: 2, date: "2026-10-31", title: "v2 · adds a calibrate stage", body: "Confidence 58 → 74.", tag: "to decide", tagTone: "info" },
        ],
        dm: (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      }),
    },
    {
      title: "Relative dates and a slot body",
      code: `<UiTimeline :events="events" date-format="relative">
  <template #event="{ event }"><em>{{ event.body }}</em></template>
</UiTimeline>`,
      setup: () => {
        const now = Date.now();
        return {
          events: [
            { date: now - 3 * 3600_000, title: "Analysed", body: "50 commits, 3 ideas" },
            { date: now - 6 * 86400_000, title: "Repo added", body: "Watching every Friday" },
          ],
        };
      },
    },
    {
      title: "Empty",
      code: `<UiTimeline :events="[]" empty-text="No versions yet" />`,
    },
  ],
};
