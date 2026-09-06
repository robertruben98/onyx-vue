### Task 3: `UiTriStateCount`, `resolveTriState` and `TriState`

The component this whole effort exists to produce. The console pages distinguish three things a plain number cannot: `5` is a fact, `·` means the data is in flight, `—` means nobody asked for it. Today that distinction is re-implemented by hand in `renderChips`, `renderSidebar` and the row cells, and the Vue rewrite of the sibling dashboard dropped it entirely.

**Files:**
- Create: `src/components/tri-state-count/TriStateCount.vue`
- Create: `src/components/tri-state-count/tri-state-count.scss`
- Create: `src/components/tri-state-count/TriStateCount.test.ts`
- Create: `src/components/tri-state-count/tri-state-count.docs.ts`
- Create: `src/components/tri-state-count/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiTriStateCount`, `export type TriState = "known" | "pending" | "unrequested"`, `export type TriStateTone = "neutral" | "ok" | "warn" | "danger"`, and `resolveTriState(input: { value?: number | null; loading?: boolean; requested?: boolean }): TriState`. Batch 3's `UiFilterChip` takes `TriState`; batch 5's `UiSideNavItem` renders this component in its `#marks` slot.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`:

```css
  --ui-tri-state-count-font-size: var(--ui-font-size-sm);
  --ui-tri-state-count-font-weight: var(--ui-font-weight-medium);
  --ui-tri-state-count-neutral: var(--ui-color-text-muted);
  --ui-tri-state-count-ok: var(--ui-color-success);
  --ui-tri-state-count-warn: var(--ui-color-warning);
  --ui-tri-state-count-danger: var(--ui-color-danger);
  --ui-tri-state-count-quiet: var(--ui-color-disabled-text);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/tri-state-count/TriStateCount.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import TriStateCount, { resolveTriState } from "./TriStateCount.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("TriStateCount (Vue)", () => {
  it("shows the number when the value is known", () => {
    render(TriStateCount, { props: { state: "known", value: 5 } });
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("shows zero as a number, because zero is a fact", () => {
    render(TriStateCount, { props: { state: "known", value: 0 } });
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("shows the pending glyph while the data is in flight", () => {
    render(TriStateCount, { props: { state: "pending" } });
    expect(screen.getByText("·")).toBeTruthy();
  });

  it("shows the unrequested glyph when nobody asked", () => {
    render(TriStateCount, { props: { state: "unrequested" } });
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("names the meaning and not the glyph", () => {
    const { container } = render(TriStateCount, { props: { state: "unrequested" } });
    const label = container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label");
    expect(label).toBe("not requested");
    expect(label).not.toContain("—");
  });

  it("distinguishes pending from unrequested in the accessible name", () => {
    const { container } = render(TriStateCount, { props: { state: "pending" } });
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("loading");
  });

  it("reads the count out with its label when one is given", () => {
    const { container } = render(TriStateCount, {
      props: { state: "known", value: 3, label: "open alerts" },
    });
    expect(
      container.querySelector(".ui-tri-state-count")?.getAttribute("aria-label"),
    ).toBe("3 open alerts");
  });

  it("applies the tone class on the root", () => {
    const { container } = render(TriStateCount, {
      props: { state: "known", value: 2, tone: "danger" },
    });
    expect(
      container
        .querySelector(".ui-tri-state-count")
        ?.classList.contains("ui-tri-state-count--danger"),
    ).toBe(true);
  });

  it("ignores the tone when the value is not known — a colour would be a claim", () => {
    const { container } = render(TriStateCount, {
      props: { state: "pending", tone: "danger" },
    });
    const el = container.querySelector(".ui-tri-state-count");
    expect(el?.classList.contains("ui-tri-state-count--danger")).toBe(false);
    expect(el?.classList.contains("ui-tri-state-count--quiet")).toBe(true);
  });

  it("takes custom glyphs", () => {
    render(TriStateCount, {
      props: { state: "pending", pendingGlyph: "…" },
    });
    expect(screen.getByText("…")).toBeTruthy();
  });

  it.each(["known", "pending", "unrequested"] as const)(
    "has no axe violations (%s)",
    async (state) => {
      const { container } = render(TriStateCount, {
        props: { state, value: 4, label: "items" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});

describe("resolveTriState", () => {
  it("is unrequested when nobody asked, even with a value lying around", () => {
    expect(resolveTriState({ value: 7, requested: false })).toBe("unrequested");
  });

  it("is pending while loading", () => {
    expect(resolveTriState({ requested: true, loading: true })).toBe("pending");
  });

  it("is pending when requested and the value has not arrived", () => {
    expect(resolveTriState({ requested: true, value: null })).toBe("pending");
  });

  it("is known once a value is in, zero included", () => {
    expect(resolveTriState({ requested: true, value: 0 })).toBe("known");
  });

  it("assumes requested when the caller does not say", () => {
    expect(resolveTriState({ value: 2 })).toBe("known");
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/tri-state-count/TriStateCount.test.ts`
Expected: FAIL — `Failed to resolve import "./TriStateCount.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/tri-state-count/tri-state-count.scss`:

```scss
// Tri-state count — a number, or the reason there is no number. References
// ONLY semantic / component tokens. Tabular figures so a column of counts
// does not shuffle sideways as the numbers change.

.ui-tri-state-count {
  display: inline-block;
  font-size: var(--ui-tri-state-count-font-size);
  font-weight: var(--ui-tri-state-count-font-weight);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--ui-tri-state-count-neutral);
}

.ui-tri-state-count--ok {
  color: var(--ui-tri-state-count-ok);
}
.ui-tri-state-count--warn {
  color: var(--ui-tri-state-count-warn);
}
.ui-tri-state-count--danger {
  color: var(--ui-tri-state-count-danger);
}

// Pending and unrequested are deliberately quiet: a glyph standing in for a
// number must not compete with the real numbers around it.
.ui-tri-state-count--quiet {
  color: var(--ui-tri-state-count-quiet);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/tri-state-count/TriStateCount.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./tri-state-count.scss";

/**
 * The three things a counter can be.
 *
 * `known` is a fact — including zero. `pending` means the data is in flight.
 * `unrequested` means nobody asked for it. Collapsing the last two into a
 * zero is the bug this type exists to prevent: "no open alerts" and "we never
 * looked for alerts" render identically and mean opposite things.
 */
export type TriState = "known" | "pending" | "unrequested";

export type TriStateTone = "neutral" | "ok" | "warn" | "danger";

/** Derive the state from the shape a data layer usually reports. */
export function resolveTriState(input: {
  value?: number | null;
  loading?: boolean;
  requested?: boolean;
}): TriState {
  if (input.requested === false) return "unrequested";
  if (input.loading) return "pending";
  return input.value === null || input.value === undefined ? "pending" : "known";
}

const props = withDefaults(
  defineProps<{
    /** Which of the three things this counter is. */
    state?: TriState;
    /** The count. Only read when `state` is `known`. */
    value?: number | null;
    /** Semantic tone, applied only to a known value. */
    tone?: TriStateTone;
    /** What is being counted, for the accessible name — e.g. "open alerts". */
    label?: string;
    /** Stand-in shown while the data is in flight. */
    pendingGlyph?: string;
    /** Stand-in shown when nobody asked for the data. */
    unrequestedGlyph?: string;
  }>(),
  {
    state: "known",
    value: null,
    tone: "neutral",
    label: "",
    pendingGlyph: "·",
    unrequestedGlyph: "—",
  },
);

const text = computed(() => {
  if (props.state === "pending") return props.pendingGlyph;
  if (props.state === "unrequested") return props.unrequestedGlyph;
  return String(props.value ?? 0);
});

/**
 * The name states the meaning, never the glyph. A screen reader announcing
 * "em dash" tells the user nothing; "not requested" tells them everything.
 */
const ariaLabel = computed(() => {
  if (props.state === "pending") return "loading";
  if (props.state === "unrequested") return "not requested";
  const n = String(props.value ?? 0);
  return props.label ? `${n} ${props.label}` : n;
});

/**
 * Tone is a claim about the number, so a state with no number gets no tone:
 * a red "·" would report a problem that has not been measured yet.
 */
const known = computed(() => props.state === "known");

const rootClasses = computed(() => ({
  "ui-tri-state-count": true,
  "ui-tri-state-count--ok": known.value && props.tone === "ok",
  "ui-tri-state-count--warn": known.value && props.tone === "warn",
  "ui-tri-state-count--danger": known.value && props.tone === "danger",
  "ui-tri-state-count--quiet": !known.value,
}));
</script>

<template>
  <span :class="rootClasses" :aria-label="ariaLabel">
    <span aria-hidden="true">{{ text }}</span>
  </span>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/tri-state-count/TriStateCount.test.ts`
Expected: PASS, 18 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/tri-state-count/tri-state-count.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const triStateCountDoc: ComponentDoc = {
  id: "tri-state-count",
  title: "Tri-State Count",
  description:
    "A number, or the reason there is no number. Zero is a fact, a dot means the data is in flight, and a dash means nobody asked for it — three states a plain counter collapses into one misleading zero.",
  imports: ["UiTriStateCount"],
  api: [
    {
      name: "state",
      type: "'known' | 'pending' | 'unrequested'",
      default: "'known'",
      description: "Which of the three things this counter is.",
    },
    {
      name: "value",
      type: "number | null",
      default: "null",
      description: "The count. Only read when state is 'known'.",
    },
    {
      name: "tone",
      type: "'neutral' | 'ok' | 'warn' | 'danger'",
      default: "'neutral'",
      description: "Semantic tone. Ignored unless the value is known.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "What is being counted, for the accessible name.",
    },
    {
      name: "pendingGlyph",
      type: "string",
      default: "'·'",
      description: "Stand-in shown while loading.",
    },
    {
      name: "unrequestedGlyph",
      type: "string",
      default: "'—'",
      description: "Stand-in shown when the data was never requested.",
    },
  ],
  demos: [
    {
      title: "The three states",
      description:
        "A zero and a dash are not the same claim. The first says there is nothing; the second says nobody looked.",
      code: `<UiTriStateCount :value="12" label="pull requests" />
<UiTriStateCount :value="0" label="conflicts" />
<UiTriStateCount state="pending" />
<UiTriStateCount state="unrequested" />`,
    },
    {
      title: "Tones",
      code: `<UiTriStateCount :value="3" tone="ok" label="ready to merge" />
<UiTriStateCount :value="7" tone="warn" label="stale" />
<UiTriStateCount :value="2" tone="danger" label="secrets" />`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/tri-state-count/index.ts`:

```ts
export { default as UiTriStateCount, resolveTriState } from "./TriStateCount.vue";
export type { TriState, TriStateTone } from "./TriStateCount.vue";
export { triStateCountDoc } from "./tri-state-count.docs";
```

Add to `src/index.ts`, alphabetically **after** `./components/tooltip` — `tooltip` sorts before `tri-state-count` because `o` precedes `r`, so this is the last line of the file until Task 5 adds one below it:

```ts
export * from "./components/tri-state-count";
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

Expected: 27 files, 438 tests passed; typecheck clean. The same `<script setup>` export caveat from Task 2 Step 9 applies to `resolveTriState`.

- [ ] **Step 10: Commit**

```bash
git add src/components/tri-state-count src/styles/tokens.css src/index.ts
git commit -m "feat(tri-state-count): un numero, o la razon de que no lo haya"
```
