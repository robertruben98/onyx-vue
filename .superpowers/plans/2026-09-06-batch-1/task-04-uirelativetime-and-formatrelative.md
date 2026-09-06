### Task 4: `UiRelativeTime` and `formatRelative`

The `visto` and `creada` columns. Ports `timeAgo()` from `prs.js`, fixing its stale rule on the way in: the original tests the rendered string with `/d$|mes$/` and `parseInt >= 3`, so `3d` is stale but `1mes` — thirty days — is not.

**Files:**
- Create: `src/components/relative-time/RelativeTime.vue`
- Create: `src/components/relative-time/relative-time.scss`
- Create: `src/components/relative-time/RelativeTime.test.ts`
- Create: `src/components/relative-time/relative-time.docs.ts`
- Create: `src/components/relative-time/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiRelativeTime` and `formatRelative(date: string | Date, now: Date): string`, which returns `"0m"`, `"5m"`, `"3h"`, `"2d"` or `"4mo"`.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`:

```css
  --ui-relative-time-font-size: var(--ui-font-size-sm);
  --ui-relative-time-color: var(--ui-color-text-muted);
  --ui-relative-time-stale-color: var(--ui-color-warning);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/relative-time/RelativeTime.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import RelativeTime, { formatRelative } from "./RelativeTime.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const now = new Date("2026-09-06T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatRelative", () => {
  it("counts minutes under an hour", () => {
    expect(formatRelative(ago(5 * MIN), now)).toBe("5m");
  });

  it("shows a fresh timestamp as zero minutes, not as empty", () => {
    expect(formatRelative(ago(10_000), now)).toBe("0m");
  });

  it("counts hours under a day", () => {
    expect(formatRelative(ago(3 * HOUR), now)).toBe("3h");
  });

  it("counts days under a month", () => {
    expect(formatRelative(ago(2 * DAY), now)).toBe("2d");
  });

  it("counts months past thirty-one days", () => {
    expect(formatRelative(ago(120 * DAY), now)).toBe("4mo");
  });

  it("never goes negative when a clock runs ahead", () => {
    expect(formatRelative(new Date(now.getTime() + HOUR), now)).toBe("0m");
  });
});

describe("RelativeTime (Vue)", () => {
  it("renders the compact age", () => {
    render(RelativeTime, { props: { date: ago(2 * HOUR), now } });
    expect(screen.getByText("2h")).toBeTruthy();
  });

  it("carries the machine-readable date", () => {
    const date = ago(DAY);
    const { container } = render(RelativeTime, { props: { date, now } });
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(date);
  });

  it("puts the absolute date in the title, so the age is never the only record", () => {
    const { container } = render(RelativeTime, { props: { date: ago(DAY), now } });
    expect(container.querySelector("time")?.getAttribute("title")).toBeTruthy();
  });

  it("marks a row stale past the threshold", () => {
    const { container } = render(RelativeTime, { props: { date: ago(4 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("does not mark a fresh row stale", () => {
    const { container } = render(RelativeTime, { props: { date: ago(2 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(false);
  });

  it("counts a month as stale, which the string-matching original did not", () => {
    const { container } = render(RelativeTime, { props: { date: ago(30 * DAY), now } });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("honours a custom threshold", () => {
    const { container } = render(RelativeTime, {
      props: { date: ago(2 * DAY), now, staleAfterDays: 1 },
    });
    expect(
      container.querySelector("time")?.classList.contains("ui-relative-time--stale"),
    ).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(RelativeTime, { props: { date: ago(DAY), now } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/relative-time/RelativeTime.test.ts`
Expected: FAIL — `Failed to resolve import "./RelativeTime.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/relative-time/relative-time.scss`:

```scss
// Relative time — a compact age with the absolute date in the title.
// References ONLY semantic / component tokens.

.ui-relative-time {
  font-size: var(--ui-relative-time-font-size);
  font-variant-numeric: tabular-nums;
  color: var(--ui-relative-time-color);
  white-space: nowrap;
}

.ui-relative-time--stale {
  color: var(--ui-relative-time-stale-color);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/relative-time/RelativeTime.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./relative-time.scss";

const MINUTE = 60_000;

/**
 * Compact age: `0m`, `5m`, `3h`, `2d`, `4mo`.
 *
 * `now` is a parameter and not `Date.now()` so the output is testable. A
 * future timestamp clamps to `0m` rather than reporting a negative age —
 * clocks on two machines disagree and that is not worth rendering.
 */
export function formatRelative(date: string | Date, now: Date): string {
  const then = date instanceof Date ? date : new Date(date);
  const mins = Math.max(0, Math.round((now.getTime() - then.getTime()) / MINUTE));
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  const days = Math.round(mins / 1440);
  if (days < 31) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
}

const props = withDefaults(
  defineProps<{
    /** The moment being aged. */
    date: string | Date;
    /**
     * Age past which the row reads as stale. The original in `prs.js` tested
     * the rendered string, so `3d` was stale and `1mes` was not; this compares
     * the actual age.
     */
    staleAfterDays?: number;
    /** Clock, injectable so tests are deterministic. */
    now?: Date;
  }>(),
  {
    staleAfterDays: 3,
    now: () => new Date(),
  },
);

const then = computed(() =>
  props.date instanceof Date ? props.date : new Date(props.date),
);

const text = computed(() => formatRelative(then.value, props.now));

const iso = computed(() => then.value.toISOString());

const absolute = computed(() => then.value.toLocaleString());

const stale = computed(() => {
  const ms = props.now.getTime() - then.value.getTime();
  return ms >= props.staleAfterDays * 24 * 60 * MINUTE;
});

const rootClasses = computed(() => ({
  "ui-relative-time": true,
  "ui-relative-time--stale": stale.value,
}));
</script>

<template>
  <time :class="rootClasses" :datetime="iso" :title="absolute">{{ text }}</time>
</template>
```

Note on Step 2's `datetime` assertion: the test passes an ISO string produced by `toISOString()`, and the component round-trips it through `new Date(...).toISOString()`, so the two match exactly. A non-ISO input would be normalised, which is the desired behaviour for the attribute.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/relative-time/RelativeTime.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/relative-time/relative-time.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const relativeTimeDoc: ComponentDoc = {
  id: "relative-time",
  title: "Relative Time",
  description:
    "A compact age — 5m, 3h, 2d, 4mo — with the absolute date in the title and a stale flag past a threshold. Takes its clock as a prop so it can be tested.",
  imports: ["UiRelativeTime"],
  api: [
    {
      name: "date",
      type: "string | Date",
      default: "—",
      description: "The moment being aged.",
    },
    {
      name: "staleAfterDays",
      type: "number",
      default: "3",
      description: "Age past which the value renders as stale.",
    },
    {
      name: "now",
      type: "Date",
      default: "new Date()",
      description: "Clock, injectable for deterministic tests.",
    },
  ],
  demos: [
    {
      title: "Ages",
      code: `<UiRelativeTime :date="hace5m" :now="ahora" />
<UiRelativeTime :date="hace3h" :now="ahora" />
<UiRelativeTime :date="hace2d" :now="ahora" />
<UiRelativeTime :date="hace40d" :now="ahora" />`,
      setup: () => {
        const ahora = new Date();
        const atras = (ms: number) => new Date(ahora.getTime() - ms);
        return {
          ahora,
          hace5m: atras(5 * 60_000),
          hace3h: atras(3 * 3_600_000),
          hace2d: atras(2 * 86_400_000),
          hace40d: atras(40 * 86_400_000),
        };
      },
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/relative-time/index.ts`:

```ts
export { default as UiRelativeTime, formatRelative } from "./RelativeTime.vue";
export { relativeTimeDoc } from "./relative-time.docs";
```

Add to `src/index.ts`, alphabetically between `./components/radio-group` and `./components/select`:

```ts
export * from "./components/relative-time";
```

**Register the doc in `src/docs-model.test.ts`.** That file validates every
`ComponentDoc` through `describe.each(TODOS)` over a hand-written `TODOS` array,
and it has an explicit case asserting no component is left without metadata. Add
the import and the `TODOS` entry for this component, keeping both lists in the
order they already use. This is why the suite grows by six more than this
component's own test count.

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: 28 files, 458 tests passed; typecheck clean.

- [ ] **Step 10: Commit**

```bash
git add src/components/relative-time src/styles/tokens.css src/index.ts
git commit -m "feat(relative-time): edad compacta con la fecha absoluta en el title"
```
