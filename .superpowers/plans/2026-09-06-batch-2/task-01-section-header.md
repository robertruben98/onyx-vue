### Task 1: `UiSectionHeader`

The band above every list in the console pages. In `style.css:132-144` it is a 34px flex row carrying an uppercase, letter-spaced name, a muted count, and an optional text button; `prs.css` adds a `.sortbox` pushed to the right with `margin-left: auto` that holds an inline `<select>`. Four things in one row, three of them optional.

**Files:**
- Create: `src/components/section-header/SectionHeader.vue`
- Create: `src/components/section-header/section-header.scss`
- Create: `src/components/section-header/SectionHeader.test.ts`
- Create: `src/components/section-header/section-header.docs.ts`
- Create: `src/components/section-header/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiSectionHeader`. No exported types — `headingLevel` is a plain numeric union inline.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`:

The scale has no bold weight — only `--ui-font-weight-medium` exists. Add one to
the scale first, since task 2 needs the same weight, then the component family:

```css
  --ui-font-weight-bold: 700;
```

```css
  --ui-section-header-height: 2.125rem;
  --ui-section-header-gap: var(--ui-space-3);
  --ui-section-header-title-size: var(--ui-font-size-sm);
  --ui-section-header-title-weight: var(--ui-font-weight-bold);
  --ui-section-header-title-tracking: 0.16em;
  --ui-section-header-title-color: var(--ui-color-text);
  --ui-section-header-title-color-quiet: var(--ui-color-text-muted);
  --ui-section-header-count-size: var(--ui-font-size-sm);
  --ui-section-header-count-color: var(--ui-color-text-muted);
```

Put `--ui-font-weight-bold` beside the existing `--ui-font-weight-medium`, not with the component families — it belongs to the type scale.

- [ ] **Step 2: Write the failing test**

Create `src/components/section-header/SectionHeader.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import SectionHeader from "./SectionHeader.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("SectionHeader (Vue)", () => {
  it("renders the title as a heading", () => {
    render(SectionHeader, { props: { title: "pull requests" } });
    expect(screen.getByRole("heading", { name: "pull requests" })).toBeTruthy();
  });

  it("defaults to an h2", () => {
    const { container } = render(SectionHeader, { props: { title: "alerts" } });
    expect(container.querySelector("h2")).toBeTruthy();
  });

  it("honours a different heading level, so a page keeps a sane outline", () => {
    const { container } = render(SectionHeader, {
      props: { title: "alerts", headingLevel: 3 },
    });
    expect(container.querySelector("h3")).toBeTruthy();
    expect(container.querySelector("h2")).toBe(null);
  });

  it("renders the count when given", () => {
    render(SectionHeader, { props: { title: "issues", count: 12 } });
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("renders a string count, because the console pages pass prose there", () => {
    render(SectionHeader, {
      props: { title: "issues", count: "12 · GitHub dice 40" },
    });
    expect(screen.getByText("12 · GitHub dice 40")).toBeTruthy();
  });

  it("omits the count element entirely when there is none", () => {
    const { container } = render(SectionHeader, { props: { title: "issues" } });
    expect(container.querySelector(".ui-section-header__count")).toBe(null);
  });

  it("treats a zero count as a value, not as absent", () => {
    const { container } = render(SectionHeader, {
      props: { title: "issues", count: 0 },
    });
    expect(container.querySelector(".ui-section-header__count")?.textContent).toBe("0");
  });

  it("projects actions", () => {
    render(SectionHeader, {
      props: { title: "pull requests" },
      slots: { actions: "<button>agrupar por repo</button>" },
    });
    expect(screen.getByRole("button", { name: "agrupar por repo" })).toBeTruthy();
  });

  it("projects controls", () => {
    render(SectionHeader, {
      props: { title: "pull requests" },
      slots: { controls: "<span>orden</span>" },
    });
    expect(screen.getByText("orden")).toBeTruthy();
  });

  it("applies the quiet modifier", () => {
    const { container } = render(SectionHeader, {
      props: { title: "secrets", quiet: true },
    });
    expect(
      container
        .querySelector(".ui-section-header")
        ?.classList.contains("ui-section-header--quiet"),
    ).toBe(true);
  });

  it.each([
    ["plain", {}],
    ["with count", { count: 3 }],
    ["quiet", { quiet: true }],
  ] as const)("has no axe violations (%s)", async (_name, extra) => {
    const { container } = render(SectionHeader, {
      props: { title: "pull requests", ...extra },
      slots: { actions: "<button>ver todo</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/section-header/SectionHeader.test.ts`
Expected: FAIL — `Failed to resolve import "./SectionHeader.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/section-header/section-header.scss`:

```scss
// Section header — the band above a list. References ONLY semantic /
// component tokens.
//
// `font-family` is deliberately absent: the console preset defines a display
// family and the default theme does not, so inheriting is what lets one
// component read correctly under both. What makes the band recognisable is the
// tracking and the caps, not the face.

.ui-section-header {
  display: flex;
  align-items: center;
  gap: var(--ui-section-header-gap);
  min-height: var(--ui-section-header-height);
}

.ui-section-header__title {
  margin: 0;
  font-size: var(--ui-section-header-title-size);
  font-weight: var(--ui-section-header-title-weight);
  letter-spacing: var(--ui-section-header-title-tracking);
  text-transform: uppercase;
  color: var(--ui-section-header-title-color);
}

.ui-section-header--quiet .ui-section-header__title {
  color: var(--ui-section-header-title-color-quiet);
}

.ui-section-header__count {
  font-size: var(--ui-section-header-count-size);
  font-variant-numeric: tabular-nums;
  color: var(--ui-section-header-count-color);
}

// Los controles se van al fondo; las acciones se quedan junto al contador,
// que es donde el ojo ya esta.
.ui-section-header__controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}
```

- [ ] **Step 5: Write the component**

Create `src/components/section-header/SectionHeader.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./section-header.scss";

const props = withDefaults(
  defineProps<{
    /** Section name. Rendered as a heading. */
    title: string;
    /**
     * Count shown beside the title. A number or a prepared string — the
     * console pages pass prose there ("12 · GitHub dice 40").
     */
    count?: string | number | null;
    /** Dims the title, for a section that is empty or inactive. */
    quiet?: boolean;
    /** Heading level, so a page with several sections keeps a sane outline. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
  }>(),
  {
    count: null,
    quiet: false,
    headingLevel: 2,
  },
);

const heading = computed(() => `h${props.headingLevel}`);

/** Zero is a count, not an absence — `v-if` on the value alone would hide it. */
const hasCount = computed(() => props.count !== null && props.count !== undefined);

const rootClasses = computed(() => ({
  "ui-section-header": true,
  "ui-section-header--quiet": props.quiet,
}));
</script>

<template>
  <div :class="rootClasses">
    <component :is="heading" class="ui-section-header__title">{{ title }}</component>
    <span v-if="hasCount" class="ui-section-header__count">{{ count }}</span>
    <slot name="actions" />
    <div v-if="$slots.controls" class="ui-section-header__controls">
      <slot name="controls" />
    </div>
  </div>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/section-header/SectionHeader.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/section-header/section-header.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const sectionHeaderDoc: ComponentDoc = {
  id: "section-header",
  title: "Section Header",
  description:
    "The band above a list: an uppercase title, an optional count, actions beside it and controls pushed to the far end. The title is a real heading, so a page of sections keeps a usable outline.",
  imports: ["UiSectionHeader"],
  api: [
    { name: "title", type: "string", default: "—", description: "Section name, rendered as a heading." },
    {
      name: "count",
      type: "string | number | null",
      default: "null",
      description: "Shown beside the title. Zero renders; null omits the element.",
    },
    { name: "quiet", type: "boolean", default: "false", description: "Dims the title for an empty or inactive section." },
    {
      name: "headingLevel",
      type: "2 | 3 | 4 | 5 | 6",
      default: "2",
      description: "Heading level used for the title.",
    },
    { name: "#actions", type: "slot", default: "—", description: "Buttons placed beside the count." },
    { name: "#controls", type: "slot", default: "—", description: "Controls pushed to the far end, e.g. a sort select." },
  ],
  demos: [
    {
      title: "Title and count",
      code: `<UiSectionHeader title="pull requests" :count="12" />
<UiSectionHeader title="secrets sin resolver" count="nada abierto" quiet />`,
    },
    {
      title: "With actions and controls",
      code: `<UiSectionHeader title="pull requests" :count="12">
  <template #actions>
    <UiButton variant="text" size="sm">agrupar por repo</UiButton>
  </template>
  <template #controls>
    <span>orden</span>
    <UiSelect size="sm" :options="orden" v-model="criterio" />
  </template>
</UiSectionHeader>`,
      setup: () => ({
        criterio: "recientes",
        orden: [
          { value: "recientes", label: "mas recientes" },
          { value: "viejas", label: "mas viejas" },
        ],
      }),
    },
  ],
};
```

If `UiSelect` has no `size` prop yet — batch 4 adds it — drop that attribute from the demo rather than shipping a template that fails to compile. `docs-model.test.ts` compiles every demo.

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/section-header/index.ts`:

```ts
export { default as UiSectionHeader } from "./SectionHeader.vue";
export { sectionHeaderDoc } from "./section-header.docs";
```

Add to `src/index.ts`, alphabetically between `./components/relative-time` (line 20) and `./components/select` (line 21) — `sec` sorts before `sel`:

```ts
export * from "./components/section-header";
```

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: the suite grows by your 13 tests plus 6 from `docs-model.test.ts`. Report the number you observe.

- [ ] **Step 10: Commit**

```bash
git add src/components/section-header src/styles/tokens.css src/index.ts
git commit -m "feat(section-header): la banda que encabeza una lista"
```
