### Task 2: `UiSeverityBadge` and `severityRank`

The `.sev` cell of the security view. The component is half the value; the other half is the sort scale, which lives inline in `prs.js` as a `RANK` map and gets copied by every consumer that needs to order alerts.

**Files:**
- Create: `src/components/severity-badge/SeverityBadge.vue`
- Create: `src/components/severity-badge/severity-badge.scss`
- Create: `src/components/severity-badge/SeverityBadge.test.ts`
- Create: `src/components/severity-badge/severity-badge.docs.ts`
- Create: `src/components/severity-badge/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiSeverityBadge`, `export type Severity = "critical" | "high" | "moderate" | "medium" | "low" | "unknown"`, and `severityRank(severity: Severity | string): number` — lower sorts first, unrecognised input yields `9`.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`:

```css
  --ui-severity-badge-padding-x: var(--ui-space-2);
  --ui-severity-badge-padding-y: var(--ui-space-1);
  --ui-severity-badge-font-size: var(--ui-font-size-sm);
  --ui-severity-badge-font-weight: var(--ui-font-weight-medium);
  --ui-severity-badge-radius: var(--ui-radii-sm);
  --ui-severity-badge-critical-bg: var(--ui-color-danger);
  --ui-severity-badge-critical-text: var(--ui-color-on-primary);
  --ui-severity-badge-high-bg: var(--ui-color-danger-surface);
  --ui-severity-badge-high-text: var(--ui-color-danger);
  --ui-severity-badge-moderate-bg: var(--ui-color-warning-surface);
  --ui-severity-badge-moderate-text: var(--ui-color-warning);
  --ui-severity-badge-low-bg: var(--ui-color-info-surface);
  --ui-severity-badge-low-text: var(--ui-color-info);
  --ui-severity-badge-unknown-bg: var(--ui-color-neutral-surface);
  --ui-severity-badge-unknown-text: var(--ui-color-neutral);
```

`critical` is the only solid fill. Five surfaces at equal weight is a wall of colour in which nothing is worse than anything else, which is the failure the security view exists to avoid.

- [ ] **Step 2: Write the failing test**

Create `src/components/severity-badge/SeverityBadge.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import SeverityBadge, { severityRank } from "./SeverityBadge.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const severities = ["critical", "high", "moderate", "medium", "low", "unknown"] as const;

describe("SeverityBadge (Vue)", () => {
  it("renders the severity as its own label", () => {
    render(SeverityBadge, { props: { severity: "critical" } });
    expect(screen.getByText("critical")).toBeTruthy();
  });

  it("lets a slot override the visible text", () => {
    render(SeverityBadge, {
      props: { severity: "high" },
      slots: { default: "HIGH (2)" },
    });
    expect(screen.getByText("HIGH (2)")).toBeTruthy();
  });

  it("applies the severity class on the root", () => {
    const { container } = render(SeverityBadge, { props: { severity: "moderate" } });
    expect(
      container
        .querySelector(".ui-severity-badge")
        ?.classList.contains("ui-severity-badge--moderate"),
    ).toBe(true);
  });

  it("treats medium as moderate, which is the same rung under another name", () => {
    const { container } = render(SeverityBadge, { props: { severity: "medium" } });
    expect(
      container
        .querySelector(".ui-severity-badge")
        ?.classList.contains("ui-severity-badge--moderate"),
    ).toBe(true);
  });

  it.each(severities)("has no axe violations (%s)", async (severity) => {
    const { container } = render(SeverityBadge, { props: { severity } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("severityRank", () => {
  it("orders worst first", () => {
    const shuffled = ["low", "critical", "unknown", "moderate", "high"];
    expect([...shuffled].sort((a, b) => severityRank(a) - severityRank(b))).toEqual([
      "critical",
      "high",
      "moderate",
      "low",
      "unknown",
    ]);
  });

  it("ranks medium alongside moderate", () => {
    expect(severityRank("medium")).toBe(severityRank("moderate"));
  });

  it("is case-insensitive, because GitHub shouts its severities", () => {
    expect(severityRank("CRITICAL")).toBe(severityRank("critical"));
  });

  it("sends anything it does not recognise to the back", () => {
    expect(severityRank("banana")).toBe(9);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/severity-badge/SeverityBadge.test.ts`
Expected: FAIL — `Failed to resolve import "./SeverityBadge.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/severity-badge/severity-badge.scss`:

```scss
// Severity badge — the severity scale of the security views. References ONLY
// semantic / component tokens. `critical` is the only solid fill: five
// surfaces at equal weight make a wall of colour in which nothing is worse
// than anything else.

.ui-severity-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--ui-severity-badge-padding-y) var(--ui-severity-badge-padding-x);
  font-size: var(--ui-severity-badge-font-size);
  font-weight: var(--ui-severity-badge-font-weight);
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  border-radius: var(--ui-severity-badge-radius);
  background-color: var(--ui-severity-badge-unknown-bg);
  color: var(--ui-severity-badge-unknown-text);
}

.ui-severity-badge--critical {
  background-color: var(--ui-severity-badge-critical-bg);
  color: var(--ui-severity-badge-critical-text);
}
.ui-severity-badge--high {
  background-color: var(--ui-severity-badge-high-bg);
  color: var(--ui-severity-badge-high-text);
}
.ui-severity-badge--moderate {
  background-color: var(--ui-severity-badge-moderate-bg);
  color: var(--ui-severity-badge-moderate-text);
}
.ui-severity-badge--low {
  background-color: var(--ui-severity-badge-low-bg);
  color: var(--ui-severity-badge-low-text);
}
.ui-severity-badge--unknown {
  background-color: var(--ui-severity-badge-unknown-bg);
  color: var(--ui-severity-badge-unknown-text);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/severity-badge/SeverityBadge.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./severity-badge.scss";

export type Severity =
  | "critical"
  | "high"
  | "moderate"
  | "medium"
  | "low"
  | "unknown";

/**
 * Sort key for a severity: lower comes first.
 *
 * Lives here and not in the consumer because every page that lists alerts
 * needs it and each one was copying the same map. `medium` and `moderate` are
 * the same rung under two names — GitHub's dependency alerts say one and its
 * code scanning says the other. Anything unrecognised goes to the back rather
 * than to the front: an unknown severity is not an emergency.
 */
const RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  medium: 2,
  low: 3,
  unknown: 9,
};

export function severityRank(severity: Severity | string): number {
  const rank = RANK[String(severity).toLowerCase()];
  return rank === undefined ? 9 : rank;
}

const props = withDefaults(
  defineProps<{
    /** Severity reported. */
    severity?: Severity;
  }>(),
  {
    severity: "unknown",
  },
);

/** `medium` and `moderate` share a rung, so they share a look. */
const level = computed(() =>
  props.severity === "medium" ? "moderate" : props.severity,
);

const rootClasses = computed(() => ({
  "ui-severity-badge": true,
  "ui-severity-badge--critical": level.value === "critical",
  "ui-severity-badge--high": level.value === "high",
  "ui-severity-badge--moderate": level.value === "moderate",
  "ui-severity-badge--low": level.value === "low",
  "ui-severity-badge--unknown": level.value === "unknown",
}));
</script>

<template>
  <span :class="rootClasses"><slot>{{ severity }}</slot></span>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/severity-badge/SeverityBadge.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/severity-badge/severity-badge.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const severityBadgeDoc: ComponentDoc = {
  id: "severity-badge",
  title: "Severity Badge",
  description:
    "The severity scale of a security or alert list. Ships with severityRank(), the sort key that orders worst first, so every consumer sorts on the same scale instead of copying its own map.",
  imports: ["UiSeverityBadge"],
  api: [
    {
      name: "severity",
      type: "'critical' | 'high' | 'moderate' | 'medium' | 'low' | 'unknown'",
      default: "'unknown'",
      description: "Severity reported. `medium` renders as `moderate`.",
    },
    {
      name: "#default",
      type: "slot",
      default: "the severity",
      description: "Overrides the visible text.",
    },
  ],
  demos: [
    {
      title: "Scale",
      code: `<UiSeverityBadge severity="critical" />
<UiSeverityBadge severity="high" />
<UiSeverityBadge severity="moderate" />
<UiSeverityBadge severity="low" />
<UiSeverityBadge severity="unknown" />`,
    },
    {
      title: "With a count",
      code: `<UiSeverityBadge severity="high">high · 12</UiSeverityBadge>`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/severity-badge/index.ts`:

```ts
export { default as UiSeverityBadge, severityRank } from "./SeverityBadge.vue";
export type { Severity } from "./SeverityBadge.vue";
export { severityBadgeDoc } from "./severity-badge.docs";
```

Add to `src/index.ts`, alphabetically between `./components/select` and `./components/spinner`:

```ts
export * from "./components/severity-badge";
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

Expected: 26 files, 414 tests passed; typecheck clean.

If typecheck complains that `severityRank` is not exported from an SFC, the named export must be moved out of `<script setup>` into a plain `<script lang="ts">` block in the same file — `<script setup>` only exports the default component. Both blocks may coexist in one SFC.

- [ ] **Step 10: Commit**

```bash
git add src/components/severity-badge src/styles/tokens.css src/index.ts
git commit -m "feat(severity-badge): escala de severidad con su orden de sorteo"
```
