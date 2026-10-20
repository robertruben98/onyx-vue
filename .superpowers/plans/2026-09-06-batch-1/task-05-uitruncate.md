### Task 5: `UiTruncate`

The `.c-repo` and `.t` cells: one line, ellipsis, and the full text in `title`. Small, but it is repeated in every row of every console list and it is where the `title` gets forgotten.

**Files:**
- Create: `src/components/truncate/Truncate.vue`
- Create: `src/components/truncate/truncate.scss`
- Create: `src/components/truncate/Truncate.test.ts`
- Create: `src/components/truncate/truncate.docs.ts`
- Create: `src/components/truncate/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiTruncate`.

- [ ] **Step 1: Add the token**

Append to the `:root` block of `src/styles/tokens.css`:

```css
  --ui-truncate-lines: 1;
```

- [ ] **Step 2: Write the failing test**

Create `src/components/truncate/Truncate.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import Truncate from "./Truncate.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const long = "treew-inc/supervision-api-payment";

describe("Truncate (Vue)", () => {
  it("renders the text", () => {
    render(Truncate, { props: { text: long } });
    expect(screen.getByText(long)).toBeTruthy();
  });

  it("carries the full text in the title, so nothing is lost to the ellipsis", () => {
    const { container } = render(Truncate, { props: { text: long } });
    expect(container.querySelector(".ui-truncate")?.getAttribute("title")).toBe(long);
  });

  it("clamps to one line by default", () => {
    const { container } = render(Truncate, { props: { text: long } });
    const el = container.querySelector(".ui-truncate") as HTMLElement;
    expect(el.classList.contains("ui-truncate--single")).toBe(true);
  });

  it("clamps to several lines when asked", () => {
    const { container } = render(Truncate, { props: { text: long, lines: 2 } });
    const el = container.querySelector(".ui-truncate") as HTMLElement;
    expect(el.classList.contains("ui-truncate--single")).toBe(false);
    expect(el.style.getPropertyValue("--ui-truncate-lines")).toBe("2");
  });

  it("lets an explicit title win over the text", () => {
    const { container } = render(Truncate, {
      props: { text: long, title: "the full repository path" },
    });
    expect(container.querySelector(".ui-truncate")?.getAttribute("title")).toBe(
      "the full repository path",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(Truncate, { props: { text: long } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/truncate/Truncate.test.ts`
Expected: FAIL — `Failed to resolve import "./Truncate.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/truncate/truncate.scss`:

```scss
// Truncate — one line with an ellipsis, or several with a clamp, and always
// the full text in `title`. References ONLY semantic / component tokens.
//
// `min-width: 0` is not cosmetic: inside a flex or grid row a text cell
// refuses to shrink below its content without it, and the ellipsis never
// appears — the row overflows instead.

.ui-truncate {
  display: block;
  min-width: 0;
  overflow: hidden;
}

.ui-truncate--single {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ui-truncate--clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--ui-truncate-lines);
  line-clamp: var(--ui-truncate-lines);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/truncate/Truncate.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./truncate.scss";

const props = withDefaults(
  defineProps<{
    /** The text, which is also the default tooltip. */
    text: string;
    /** Lines to keep before clamping. */
    lines?: number;
    /** Overrides the tooltip when the full text is not the useful thing to show. */
    title?: string;
  }>(),
  {
    lines: 1,
    title: "",
  },
);

const single = computed(() => props.lines <= 1);

const rootClasses = computed(() => ({
  "ui-truncate": true,
  "ui-truncate--single": single.value,
  "ui-truncate--clamped": !single.value,
}));

const rootStyle = computed(() =>
  single.value ? undefined : { "--ui-truncate-lines": String(props.lines) },
);
</script>

<template>
  <span :class="rootClasses" :style="rootStyle" :title="title || text">{{ text }}</span>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/truncate/Truncate.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/truncate/truncate.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const truncateDoc: ComponentDoc = {
  id: "truncate",
  title: "Truncate",
  description:
    "Text that ellipsizes on one line or clamps to several, with the full string in the title so nothing is lost. Sets min-width: 0 so it actually shrinks inside a flex or grid row.",
  imports: ["UiTruncate"],
  api: [
    { name: "text", type: "string", default: "—", description: "The text, and the default tooltip." },
    { name: "lines", type: "number", default: "1", description: "Lines kept before clamping." },
    {
      name: "title",
      type: "string",
      default: "''",
      description: "Overrides the tooltip.",
    },
  ],
  demos: [
    {
      title: "One line",
      code: `<div style="max-width: 12rem">
  <UiTruncate text="treew-inc/supervision-api-payment" />
</div>`,
    },
    {
      title: "Two lines",
      code: `<div style="max-width: 12rem">
  <UiTruncate :lines="2" text="feat(payments): reconciliar los reembolsos parciales contra el extracto del banco" />
</div>`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/truncate/index.ts`:

```ts
export { default as UiTruncate } from "./Truncate.vue";
export { truncateDoc } from "./truncate.docs";
```

Add to `src/index.ts` as the last export line. The tail of the file, sorted by directory name, ends up: `textarea`, `tooltip`, `tri-state-count`, `truncate`.

```ts
export * from "./components/truncate";
```

**Nothing to register for `src/docs-model.test.ts`.** That file discovers
components on its own — `readdirSync` over `src/components` for the directory
contract, and `Object.entries(onyx).filter(([n]) => n.endsWith("Doc"))` for the
metadata, against the live library index. It runs six `it.each(docs…)` blocks, so
exporting `xxxDoc` through the component barrel and `src/index.ts` — which the
steps above already do — makes six more tests appear by themselves. That is why
the suite grows by six more than this component's own test file.

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: 29 files, 470 tests passed; typecheck clean.

- [ ] **Step 10: Commit**

```bash
git add src/components/truncate src/styles/tokens.css src/index.ts
git commit -m "feat(truncate): texto con elipsis y el original en el title"
```
