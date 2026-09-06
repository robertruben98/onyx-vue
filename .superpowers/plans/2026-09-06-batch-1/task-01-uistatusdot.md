### Task 1: `UiStatusDot`

The `.dot` of `style.css`, used for service health, per-check status and the workflow checklist glyphs. Five states, and it must never rely on colour alone.

**Files:**
- Create: `src/components/status-dot/StatusDot.vue`
- Create: `src/components/status-dot/status-dot.scss`
- Create: `src/components/status-dot/StatusDot.test.ts`
- Create: `src/components/status-dot/status-dot.docs.ts`
- Create: `src/components/status-dot/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiStatusDot`, `export type StatusDotState = "live" | "dead" | "warn" | "off" | "unknown"`. Batch 3's `UiHealthChip` and batch 5's `UiCheckItem` compose it.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`, after the existing `--ui-tag-*` group:

```css
  --ui-status-dot-size: 0.5rem;
  --ui-status-dot-live: var(--ui-color-success);
  --ui-status-dot-dead: var(--ui-color-danger);
  --ui-status-dot-warn: var(--ui-color-warning);
  --ui-status-dot-off: var(--ui-color-disabled-text);
  --ui-status-dot-unknown: var(--ui-color-border);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/status-dot/StatusDot.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import StatusDot from "./StatusDot.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const states = ["live", "dead", "warn", "off", "unknown"] as const;

describe("StatusDot (Vue)", () => {
  it("defaults to the unknown state", () => {
    const { container } = render(StatusDot);
    expect(
      container.querySelector(".ui-status-dot")?.classList.contains("ui-status-dot--unknown"),
    ).toBe(true);
  });

  it("applies the state class on the root", () => {
    const { container } = render(StatusDot, { props: { state: "live" } });
    expect(
      container.querySelector(".ui-status-dot")?.classList.contains("ui-status-dot--live"),
    ).toBe(true);
  });

  it("exposes the label as an image role so the state is not colour-only", () => {
    render(StatusDot, { props: { state: "dead", label: "Down" } });
    expect(screen.getByRole("img", { name: "Down" })).toBeTruthy();
  });

  it("is hidden from assistive tech when it carries no label", () => {
    const { container } = render(StatusDot, { props: { state: "live" } });
    const dot = container.querySelector(".ui-status-dot");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.getAttribute("role")).toBe(null);
  });

  it.each(states)("has no axe violations (%s state)", async (state) => {
    const { container } = render(StatusDot, { props: { state, label: "Status" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/status-dot/StatusDot.test.ts`
Expected: FAIL — `Failed to resolve import "./StatusDot.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/status-dot/status-dot.scss`:

```scss
// Status dot — a state carrier, not decoration. References ONLY semantic /
// component tokens. The dot is round by meaning, so it keeps --ui-radii-full
// even under the console preset, which squares off every other corner.

.ui-status-dot {
  display: inline-block;
  flex: none;
  width: var(--ui-status-dot-size);
  height: var(--ui-status-dot-size);
  border-radius: var(--ui-radii-full);
  background-color: var(--ui-status-dot-unknown);
}

.ui-status-dot--live {
  background-color: var(--ui-status-dot-live);
}
.ui-status-dot--dead {
  background-color: var(--ui-status-dot-dead);
}
.ui-status-dot--warn {
  background-color: var(--ui-status-dot-warn);
}
.ui-status-dot--off {
  background-color: var(--ui-status-dot-off);
}
.ui-status-dot--unknown {
  background-color: var(--ui-status-dot-unknown);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/status-dot/StatusDot.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./status-dot.scss";

export type StatusDotState = "live" | "dead" | "warn" | "off" | "unknown";

const props = withDefaults(
  defineProps<{
    /** State the dot reports. */
    state?: StatusDotState;
    /**
     * Accessible name. Without it the dot is decorative and hidden from
     * assistive tech — a coloured circle with no name announces nothing
     * useful, and `role="img"` without a name is an axe violation.
     */
    label?: string;
  }>(),
  {
    state: "unknown",
    label: "",
  },
);

const rootClasses = computed(() => ({
  "ui-status-dot": true,
  "ui-status-dot--live": props.state === "live",
  "ui-status-dot--dead": props.state === "dead",
  "ui-status-dot--warn": props.state === "warn",
  "ui-status-dot--off": props.state === "off",
  "ui-status-dot--unknown": props.state === "unknown",
}));
</script>

<template>
  <span
    :class="rootClasses"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  ></span>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/status-dot/StatusDot.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/status-dot/status-dot.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const statusDotDoc: ComponentDoc = {
  id: "status-dot",
  title: "Status Dot",
  description:
    "A small coloured dot reporting a state. Carries an accessible name so the state never depends on colour alone; without a name it is treated as decorative and hidden from assistive technology.",
  imports: ["UiStatusDot"],
  api: [
    {
      name: "state",
      type: "'live' | 'dead' | 'warn' | 'off' | 'unknown'",
      default: "'unknown'",
      description: "State the dot reports.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description:
        "Accessible name. When empty the dot is decorative and aria-hidden.",
    },
  ],
  demos: [
    {
      title: "States",
      code: `<UiStatusDot state="live" label="Up" />
<UiStatusDot state="warn" label="Degraded" />
<UiStatusDot state="dead" label="Down" />
<UiStatusDot state="off" label="Stopped" />
<UiStatusDot state="unknown" label="Unknown" />`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/status-dot/index.ts`:

```ts
export { default as UiStatusDot } from "./StatusDot.vue";
export type { StatusDotState } from "./StatusDot.vue";
export { statusDotDoc } from "./status-dot.docs";
```

Add to `src/index.ts`, keeping the list alphabetical — between `./components/spinner` and `./components/switch`:

```ts
export * from "./components/status-dot";
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

Expected: 25 files, 394 tests passed; typecheck clean.

- [ ] **Step 10: Commit**

```bash
git add src/components/status-dot src/styles/tokens.css src/index.ts
git commit -m "feat(status-dot): punto de estado con nombre accesible"
```
