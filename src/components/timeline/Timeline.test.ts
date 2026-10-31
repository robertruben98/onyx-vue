import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import Timeline, { sortNewestFirst, type TimelineEvent } from "./Timeline.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const events: TimelineEvent[] = [
  { id: "v1", date: "2026-10-15T10:00:00Z", title: "v1", body: "dismissed: not mature", tag: "dismissed", tagTone: "danger" },
  { id: "v2", date: "2026-10-31T10:00:00Z", title: "v2", body: "adds calibrate, 58 → 74", tag: "to decide" },
  { id: "v0", date: "2026-10-01T10:00:00Z", title: "v0" },
];

const dm = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

describe("Timeline (Vue)", () => {
  it("is an ordered list, newest first, whatever order the events came in", () => {
    const { container, getByRole } = render(Timeline, { props: { events, label: "History of the idea" } });
    const list = getByRole("list", { name: "History of the idea" });
    expect(list.tagName).toBe("OL");
    const titles = [...container.querySelectorAll(".ui-timeline__title")].map((n) => n.textContent);
    expect(titles).toEqual(["v2", "v1", "v0"]);
    expect(container.querySelectorAll("li.ui-timeline__event")).toHaveLength(3);
  });

  it("does not reorder the caller's array", () => {
    const copy = [...events];
    sortNewestFirst(events);
    expect(events).toEqual(copy);
  });

  it("keeps same-moment events in their order and puts unreadable dates last", () => {
    const sorted = sortNewestFirst([
      { id: "bad", date: "not a date", title: "?" },
      { id: "a", date: "2026-10-31", title: "a" },
      { id: "b", date: "2026-10-31", title: "b" },
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["a", "b", "bad"]);
  });

  it("writes each date in a <time> with its ISO datetime", () => {
    const { container } = render(Timeline, { props: { events, formatDate: dm } });
    const times = [...container.querySelectorAll("time.ui-timeline__date")];
    expect(times.map((t) => t.textContent)).toEqual(["31-10", "15-10", "01-10"]);
    expect(times[0].getAttribute("datetime")).toBe("2026-10-31T10:00:00.000Z");
  });

  it("formats absolute dates with Intl by default", () => {
    const { container } = render(Timeline, {
      props: { events: [events[1]], locale: "en-GB", dateOptions: { day: "numeric", month: "short", timeZone: "UTC" } },
    });
    expect(container.querySelector("time")!.textContent).toBe("31 Oct");
  });

  it("writes the age with dateFormat relative", () => {
    const { container } = render(Timeline, {
      props: { events: [events[1]], dateFormat: "relative", now: new Date("2026-11-03T10:00:00Z") },
    });
    const t = container.querySelector("time.ui-relative-time")!;
    expect(t.textContent).toBe("3d");
    // A three-day-old version is history, not a warning.
    expect(t.classList.contains("ui-relative-time--stale")).toBe(false);
  });

  it("shows the tag with its tone, and only when given", () => {
    const { container } = render(Timeline, { props: { events } });
    const tags = container.querySelectorAll(".ui-timeline__tag");
    expect([...tags].map((t) => t.textContent?.trim())).toEqual(["to decide", "dismissed"]);
    expect(tags[1].classList.contains("ui-tag--danger")).toBe(true);
  });

  it("renders the body, or the #event slot with the event", () => {
    const plain = render(Timeline, { props: { events } });
    expect(plain.container.querySelector(".ui-timeline__body")!.textContent).toBe("adds calibrate, 58 → 74");
    // An event with no body and no slot draws no empty box.
    expect(plain.container.querySelectorAll(".ui-timeline__body")).toHaveLength(2);

    const slotted = render(Timeline, {
      props: { events },
      slots: { event: `<template #event="{ event, index }"><b>{{ index }}:{{ event.id }}</b></template>` },
    });
    expect([...slotted.container.querySelectorAll(".ui-timeline__body b")].map((b) => b.textContent)).toEqual(["0:v2", "1:v1", "2:v0"]);
  });

  it("shows the empty text, or the #empty slot, with no list", () => {
    const empty = render(Timeline, { props: { events: [], emptyText: "No versions yet" } });
    expect(empty.container.querySelector("ol")).toBeNull();
    expect(empty.getByText("No versions yet")).toBeTruthy();
    const slotted = render(Timeline, { props: { events: [] }, slots: { empty: "<i>nada</i>" } });
    expect(slotted.container.querySelector(".ui-timeline__empty i")!.textContent).toBe("nada");
  });

  it("has no axe violations", async () => {
    const { container } = render(Timeline, { props: { events } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("styles with tokens only, so both themes apply", () => {
    const scss = readFileSync(join(__dirname, "timeline.scss"), "utf8");
    expect(scss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    const tokens = readFileSync(join(__dirname, "..", "..", "styles", "tokens.css"), "utf8");
    for (const t of scss.matchAll(/var\((--ui-timeline-[a-z-]+)\)/g)) expect(tokens).toContain(`${t[1]}:`);
  });
});
