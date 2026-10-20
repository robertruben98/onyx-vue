### Task 2: `UiGroupHeader`

The per-repo band inside a grouped list (`prs.css:154-172`, built in `renderList`). Carries a short name in the display treatment, a count, any number of risk marks, and — pushed to the far end and hidden below 1240px — the long form of the name. The original is a `<div>` with `cursor: pointer` and a click handler, which is a button that no keyboard can reach; this port fixes that.

**Files:**
- Create: `src/components/group-header/GroupHeader.vue`
- Create: `src/components/group-header/group-header.scss`
- Create: `src/components/group-header/GroupHeader.test.ts`
- Create: `src/components/group-header/group-header.docs.ts`
- Create: `src/components/group-header/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `--ui-font-weight-bold`, added to the type scale by Task 1. If Task 1 has not landed, add it yourself beside `--ui-font-weight-medium` and say so in your report.
- Produces: `UiGroupHeader`.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`:

```css
  --ui-group-header-height: 1.875rem;
  --ui-group-header-gap: var(--ui-space-3);
  --ui-group-header-padding-x: var(--ui-space-4);
  --ui-group-header-bg: var(--ui-color-surface);
  --ui-group-header-bg-hover: var(--ui-color-surface-hover);
  --ui-group-header-border: var(--ui-color-border);
  --ui-group-header-name-size: var(--ui-font-size-sm);
  --ui-group-header-name-weight: var(--ui-font-weight-bold);
  --ui-group-header-name-tracking: 0.14em;
  --ui-group-header-meta-size: var(--ui-font-size-sm);
  --ui-group-header-meta-color: var(--ui-color-text-muted);
```

There is deliberately no breakpoint token: a media query cannot read a custom property, so one would be a token nothing can consume. The `77.5rem` lives in the `@media` with a comment saying what it is for.

- [ ] **Step 2: Write the failing test**

Create `src/components/group-header/GroupHeader.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import GroupHeader from "./GroupHeader.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("GroupHeader (Vue)", () => {
  it("renders the name", () => {
    render(GroupHeader, { props: { name: "supervision-api-payment" } });
    expect(screen.getByText("supervision-api-payment")).toBeTruthy();
  });

  it("renders the long form when given", () => {
    render(GroupHeader, {
      props: { name: "supervision-api-payment", full: "treew-inc/supervision-api-payment" },
    });
    expect(screen.getByText("treew-inc/supervision-api-payment")).toBeTruthy();
  });

  it("omits the long form when there is none", () => {
    const { container } = render(GroupHeader, { props: { name: "core-api" } });
    expect(container.querySelector(".ui-group-header__full")).toBe(null);
  });

  it("projects marks", () => {
    render(GroupHeader, {
      props: { name: "core-api" },
      slots: { marks: "<span>3 listas</span>" },
    });
    expect(screen.getByText("3 listas")).toBeTruthy();
  });

  it("is a plain container by default, with nothing to activate", () => {
    const { container } = render(GroupHeader, { props: { name: "core-api" } });
    expect(container.querySelector("button")).toBe(null);
    expect(container.querySelector(".ui-group-header")?.tagName).toBe("DIV");
  });

  it("becomes a real button when interactive, so a keyboard can reach it", () => {
    render(GroupHeader, { props: { name: "core-api", interactive: true } });
    expect(screen.getByRole("button", { name: /core-api/ })).toBeTruthy();
  });

  it("emits selected when activated", async () => {
    const { emitted } = render(GroupHeader, {
      props: { name: "core-api", interactive: true },
    });
    (screen.getByRole("button") as HTMLButtonElement).click();
    expect(emitted().selected).toBeTruthy();
    expect(emitted().selected!.length).toBe(1);
  });

  it("does not emit when it is not interactive", () => {
    const { container, emitted } = render(GroupHeader, { props: { name: "core-api" } });
    (container.querySelector(".ui-group-header") as HTMLElement).click();
    expect(emitted().selected).toBeFalsy();
  });

  it.each([
    ["plain", { name: "core-api" }],
    ["with long form", { name: "core-api", full: "treew-inc/core-api" }],
    ["interactive", { name: "core-api", interactive: true }],
  ] as const)("has no axe violations (%s)", async (_n, props) => {
    const { container } = render(GroupHeader, {
      props,
      slots: { marks: "<span>2 PR</span>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/group-header/GroupHeader.test.ts`
Expected: FAIL — `Failed to resolve import "./GroupHeader.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/group-header/group-header.scss`:

```scss
// Group header — the band that opens a group inside a list. References ONLY
// semantic / component tokens.
//
// The interactive form is a real <button>, not a div with a click handler as in
// the page this is extracted from: a group you can only open with a mouse is
// unreachable in a list whose whole argument is that it is driven from the
// keyboard.

.ui-group-header {
  display: flex;
  align-items: center;
  gap: var(--ui-group-header-gap);
  width: 100%;
  min-height: var(--ui-group-header-height);
  padding: 0 var(--ui-group-header-padding-x);
  background-color: var(--ui-group-header-bg);
  border: 0;
  border-bottom: var(--ui-border-width) solid var(--ui-group-header-border);
  color: inherit;
  font: inherit;
  text-align: left;
}

.ui-group-header--interactive {
  cursor: pointer;
}

.ui-group-header--interactive:hover {
  background-color: var(--ui-group-header-bg-hover);
}

.ui-group-header--interactive:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 var(--ui-focus-ring-width) var(--ui-focus-ring);
}

.ui-group-header__name {
  font-size: var(--ui-group-header-name-size);
  font-weight: var(--ui-group-header-name-weight);
  letter-spacing: var(--ui-group-header-name-tracking);
  text-transform: uppercase;
}

.ui-group-header__marks {
  display: flex;
  align-items: center;
  gap: var(--ui-group-header-gap);
  font-size: var(--ui-group-header-meta-size);
}

.ui-group-header__full {
  margin-left: auto;
  font-size: var(--ui-group-header-meta-size);
  color: var(--ui-group-header-meta-color);
}

// The long form is the first thing to go when the row narrows: the short name
// already identifies the group. 77.5rem is where the /prs/ grid stops fitting.
@media (max-width: 77.5rem) {
  .ui-group-header__full {
    display: none;
  }
}
```

- [ ] **Step 5: Write the component**

Create `src/components/group-header/GroupHeader.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./group-header.scss";

const props = withDefaults(
  defineProps<{
    /** Short name identifying the group. */
    name: string;
    /** Long form, pushed to the far end and hidden on narrow viewports. */
    full?: string;
    /** Makes the whole band activatable. Renders a real button. */
    interactive?: boolean;
  }>(),
  {
    full: "",
    interactive: false,
  },
);

/** Emitted when an interactive header is activated. */
const emit = defineEmits<{ selected: [] }>();

const rootClasses = computed(() => ({
  "ui-group-header": true,
  "ui-group-header--interactive": props.interactive,
}));

function activate(): void {
  if (props.interactive) emit("selected");
}
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :class="rootClasses"
    :type="interactive ? 'button' : undefined"
    @click="activate"
  >
    <span class="ui-group-header__name">{{ name }}</span>
    <span v-if="$slots.marks" class="ui-group-header__marks"><slot name="marks" /></span>
    <span v-if="full" class="ui-group-header__full">{{ full }}</span>
  </component>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/group-header/GroupHeader.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/group-header/group-header.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const groupHeaderDoc: ComponentDoc = {
  id: "group-header",
  title: "Group Header",
  description:
    "The band that opens a group inside a list: a short name, any marks the group carries, and its long form pushed to the end and dropped on narrow viewports. The interactive form is a real button, not a clickable div.",
  imports: ["UiGroupHeader"],
  api: [
    { name: "name", type: "string", default: "—", description: "Short name identifying the group." },
    { name: "full", type: "string", default: "''", description: "Long form, hidden below 77.5rem." },
    {
      name: "interactive",
      type: "boolean",
      default: "false",
      description: "Renders the band as a button and enables `selected`.",
    },
    { name: "@selected", type: "() => void", default: "—", description: "Emitted when an interactive header is activated." },
    { name: "#marks", type: "slot", default: "—", description: "Counts and risk indicators for the group." },
  ],
  demos: [
    {
      title: "With marks",
      code: `<UiGroupHeader name="supervision-api-payment" full="treew-inc/supervision-api-payment">
  <template #marks>
    <UiTriStateCount :value="4" label="pull requests" />
    <UiTriStateCount :value="2" tone="ok" label="ready to merge" />
    <UiTriStateCount :value="1" tone="danger" label="secrets" />
  </template>
</UiGroupHeader>`,
    },
    {
      title: "Activatable",
      code: `<UiGroupHeader name="core-api" interactive />`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/group-header/index.ts`:

```ts
export { default as UiGroupHeader } from "./GroupHeader.vue";
export { groupHeaderDoc } from "./group-header.docs";
```

Add to `src/index.ts`, alphabetically between `./components/divider` and `./components/input`:

```ts
export * from "./components/group-header";
```

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: grows by your 11 tests plus 6. Report what you observe.

- [ ] **Step 10: Commit**

```bash
git add src/components/group-header src/styles/tokens.css src/index.ts
git commit -m "feat(group-header): la banda que abre un grupo, y es un boton de verdad"
```
