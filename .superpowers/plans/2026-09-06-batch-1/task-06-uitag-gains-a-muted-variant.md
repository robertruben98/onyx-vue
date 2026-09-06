### Task 6: `UiTag` gains a `muted` variant

The console pages need a `draft` tag. Unlike every other tag in a row, it does not warn about anything — it states what the row *is*. `neutral` is already the default and carries no such signal, so the dimmed variant is a real addition rather than an alias.

**Files:**
- Modify: `src/components/tag/Tag.vue`
- Modify: `src/components/tag/tag.scss`
- Modify: `src/components/tag/tag.docs.ts`
- Modify: `src/components/tag/Tag.test.ts`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Consumes: nothing.
- Produces: `TagVariant` widens to include `"muted"`. Additive — every existing usage keeps its behaviour.

- [ ] **Step 1: Add the tokens**

Append to the existing `--ui-tag-*` group in `src/styles/tokens.css`:

```css
  --ui-tag-muted-bg: var(--ui-color-disabled-bg);
  --ui-tag-muted-text: var(--ui-color-disabled-text);
```

- [ ] **Step 2: Extend the test**

In `src/components/tag/Tag.test.ts`, add `"muted"` to the `variants` array that drives the axe loop, and add this case to the `describe` block:

```ts
  it("applies the muted variant class on the root", () => {
    const { container } = render(Tag, {
      props: { variant: "muted" },
      slots: { default: "draft" },
    });
    expect(
      container.querySelector(".ui-tag")?.classList.contains("ui-tag--muted"),
    ).toBe(true);
  });

  it("still defaults to neutral, which muted does not replace", () => {
    const { container } = render(Tag, { slots: { default: "label" } });
    expect(
      container.querySelector(".ui-tag")?.classList.contains("ui-tag--neutral"),
    ).toBe(true);
  });
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/tag/Tag.test.ts`
Expected: FAIL — the muted case finds no `ui-tag--muted` class, and typecheck would reject `variant="muted"`.

- [ ] **Step 4: Widen the union and the class map**

In `src/components/tag/Tag.vue`, change the type and add the class binding:

```ts
export type TagVariant =
  | "neutral"
  | "muted"
  | "info"
  | "success"
  | "warning"
  | "danger";
```

and inside `rootClasses`, after the `neutral` line:

```ts
  "ui-tag--muted": props.variant === "muted",
```

- [ ] **Step 5: Add the style**

In `src/components/tag/tag.scss`, after the `.ui-tag--neutral` rule:

```scss
// `muted` says what a row IS — a draft — rather than warning about it, so it
// recedes instead of competing with the tags that do carry a warning.
.ui-tag--muted {
  background-color: var(--ui-tag-muted-bg);
  color: var(--ui-tag-muted-text);
}
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/tag/Tag.test.ts`
Expected: PASS.

- [ ] **Step 7: Document it**

In `src/components/tag/tag.docs.ts`, widen the `variant` row's `type` string to include `'muted'`, and add a demo:

```ts
    {
      title: "Muted",
      description:
        "For a tag that states what a row is rather than warning about it — a draft, an archived item.",
      code: `<UiTag variant="muted">draft</UiTag>`,
    },
```

- [ ] **Step 8: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: 29 files, 443 tests passed; typecheck clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/tag src/styles/tokens.css
git commit -m "feat(tag): variante muted para lo que la fila ES, no lo que avisa"
```
