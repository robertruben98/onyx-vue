### Task 4: `UiLoadMoreRow`

The `.more-row` of `prs.css`: a full-width band closing a truncated list, holding one button that says how many rows are still hidden. Small, but it is the only thing standing between "these are the alerts" and "these are the first fifty alerts", and the count is the whole message.

**Files:**
- Create: `src/components/load-more-row/LoadMoreRow.vue`
- Create: `src/components/load-more-row/load-more-row.scss`
- Create: `src/components/load-more-row/LoadMoreRow.test.ts`
- Create: `src/components/load-more-row/load-more-row.docs.ts`
- Create: `src/components/load-more-row/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `UiButton` from `../button`.
- Produces: `UiLoadMoreRow`.

- [ ] **Step 1: Add the tokens**

```css
  --ui-load-more-row-padding-x: var(--ui-space-4);
  --ui-load-more-row-padding-y: var(--ui-space-3);
  --ui-load-more-row-border: var(--ui-color-border);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/load-more-row/LoadMoreRow.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import LoadMoreRow from "./LoadMoreRow.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("LoadMoreRow (Vue)", () => {
  it("says how many rows are still hidden", () => {
    render(LoadMoreRow, { props: { remaining: 737 } });
    expect(screen.getByRole("button", { name: /737/ })).toBeTruthy();
  });

  it("takes a custom label", () => {
    render(LoadMoreRow, { props: { remaining: 12, label: "ver las 12 restantes" } });
    expect(screen.getByRole("button", { name: "ver las 12 restantes" })).toBeTruthy();
  });

  it("emits loadMore when activated", () => {
    const { emitted } = render(LoadMoreRow, { props: { remaining: 5 } });
    (screen.getByRole("button") as HTMLButtonElement).click();
    expect(emitted().loadMore).toBeTruthy();
    expect(emitted().loadMore!.length).toBe(1);
  });

  it("renders nothing at all when nothing remains", () => {
    const { container } = render(LoadMoreRow, { props: { remaining: 0 } });
    expect(container.querySelector(".ui-load-more-row")).toBe(null);
  });

  it("renders nothing for a negative remainder either", () => {
    const { container } = render(LoadMoreRow, { props: { remaining: -3 } });
    expect(container.querySelector(".ui-load-more-row")).toBe(null);
  });

  it("shows a busy button while loading, and does not emit again", () => {
    const { emitted } = render(LoadMoreRow, { props: { remaining: 9, loading: true } });
    const button = screen.getByRole("button") as HTMLButtonElement;
    button.click();
    expect(emitted().loadMore).toBeFalsy();
  });

  it("has no axe violations", async () => {
    const { container } = render(LoadMoreRow, { props: { remaining: 42 } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/load-more-row/LoadMoreRow.test.ts`
Expected: FAIL — `Failed to resolve import "./LoadMoreRow.vue"`.

- [ ] **Step 4: Write the SCSS**

```scss
// Load-more row — closes a truncated list. References ONLY semantic /
// component tokens.

.ui-load-more-row {
  display: flex;
  align-items: center;
  padding: var(--ui-load-more-row-padding-y) var(--ui-load-more-row-padding-x);
  border-bottom: var(--ui-border-width) solid var(--ui-load-more-row-border);
}
```

- [ ] **Step 5: Write the component**

```vue
<script setup lang="ts">
import { computed } from "vue";
import { UiButton } from "../button";
import "./load-more-row.scss";

const props = withDefaults(
  defineProps<{
    /** How many rows are still hidden. At zero or below the row does not render. */
    remaining: number;
    /** Overrides the generated label. */
    label?: string;
    /** Shows the button busy and suppresses further activation. */
    loading?: boolean;
  }>(),
  {
    label: "",
    loading: false,
  },
);

/** Emitted when the user asks for the rest. */
const emit = defineEmits<{ loadMore: [] }>();

/**
 * A row that offers to load nothing is worse than no row: it says the list is
 * truncated when it is complete.
 */
const visible = computed(() => props.remaining > 0);

const text = computed(() => props.label || `show the remaining ${props.remaining}`);
</script>

<template>
  <div v-if="visible" class="ui-load-more-row">
    <UiButton size="sm" variant="secondary" :loading="loading" @clicked="emit('loadMore')">
      {{ text }}
    </UiButton>
  </div>
</template>
```

`UiButton` suppresses `clicked` while `loading`, which is what makes the busy test pass. Read `src/components/button/Button.vue` to confirm rather than assuming.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/load-more-row/LoadMoreRow.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 7: Write the gallery metadata**

```ts
import type { ComponentDoc } from "../../docs-model";

export const loadMoreRowDoc: ComponentDoc = {
  id: "load-more-row",
  title: "Load More Row",
  description:
    "Closes a truncated list with a button that names how many rows are still hidden. Renders nothing when nothing remains — a row offering to load zero says the list is truncated when it is complete.",
  imports: ["UiLoadMoreRow"],
  api: [
    { name: "remaining", type: "number", default: "—", description: "Rows still hidden. At zero or below nothing renders." },
    { name: "label", type: "string", default: "''", description: "Overrides the generated label." },
    { name: "loading", type: "boolean", default: "false", description: "Shows the button busy and suppresses activation." },
    { name: "@loadMore", type: "() => void", default: "—", description: "Emitted when the user asks for the rest." },
  ],
  demos: [
    {
      title: "Remaining rows",
      code: `<UiLoadMoreRow :remaining="737" />
<UiLoadMoreRow :remaining="12" label="ver las 12 restantes" />
<UiLoadMoreRow :remaining="9" loading />`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

```ts
export { default as UiLoadMoreRow } from "./LoadMoreRow.vue";
export { loadMoreRowDoc } from "./load-more-row.docs";
```

Add to `src/index.ts`, alphabetically between `./components/input` and `./components/menu`:

```ts
export * from "./components/load-more-row";
```

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: grows by your 7 tests plus 6. Report what you observe.

- [ ] **Step 10: Commit**

```bash
git add src/components/load-more-row src/styles/tokens.css src/index.ts
git commit -m "feat(load-more-row): cierra una lista truncada diciendo cuanto falta"
```
