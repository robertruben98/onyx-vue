### Task 6: `UiAlert` gains a band appearance and two slots

The console pages carry `.notice` bands (`prs.css:263-273`): full-bleed, square, separated by a rule instead of a radius, with an icon that is sometimes a spinner and a button on the right. `UiAlert` already has the semantics — variants, roles, dismissal — and none of the layout.

This is the batch's only change to an existing component and it must be **strictly additive**: `control-panel/web/src/ServiceDetail.vue` imports `UiAlert` in production. Every current usage keeps its exact appearance.

**Files:**
- Modify: `src/components/alert/Alert.vue`
- Modify: `src/components/alert/alert.scss`
- Modify: `src/components/alert/Alert.test.ts`
- Modify: `src/components/alert/alert.docs.ts`
- Modify: `src/components/alert/index.ts`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Consumes: nothing.
- Produces: `export type AlertAppearance = "boxed" | "band"`, added to the `alert` barrel's type exports. `variant` is untouched.

## Why `appearance` and not another variant

`variant` is semantic — it says what kind of message this is. Band versus boxed is layout: a `warning` band and a `warning` box are the same message in different furniture. Folding one into the other would make `variant="band"` a value that answers a different question from its siblings. Keep the two axes separate.

- [ ] **Step 1: Add the tokens**

Append beside the existing `--ui-alert-*` group in `src/styles/tokens.css`:

```css
  --ui-alert-band-padding-x: var(--ui-space-4);
  --ui-alert-band-padding-y: var(--ui-space-3);
  --ui-alert-band-border: var(--ui-color-border);
```

- [ ] **Step 2: Extend the test**

Add to `src/components/alert/Alert.test.ts`, inside the existing `describe`. Also add `"band"` coverage to the axe loop by wrapping the existing `it.each` variants with both appearances, or by adding a second `it.each` — either is fine, but every variant must go through `jest-axe` in the band appearance too, which is the constraint that returned a task in batch 1.

```ts
  it("is boxed by default, so nothing that exists today moves", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(false);
    expect(root.classList.contains("ui-alert--boxed")).toBe(true);
  });

  it("applies the band appearance", () => {
    const { container } = render(Alert, {
      props: { appearance: "band" },
      slots: { default: "Mensaje" },
    });
    expect(container.querySelector(".ui-alert")?.classList.contains("ui-alert--band")).toBe(true);
  });

  it("keeps appearance independent of variant", () => {
    const { container } = render(Alert, {
      props: { appearance: "band", variant: "warning" },
      slots: { default: "Mensaje" },
    });
    const root = container.querySelector(".ui-alert")!;
    expect(root.classList.contains("ui-alert--band")).toBe(true);
    expect(root.classList.contains("ui-alert--warning")).toBe(true);
  });

  it("projects an icon", () => {
    render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(screen.getByText("!")).toBeTruthy();
  });

  it("hides the icon from assistive tech — the variant already carries the role", () => {
    const { container } = render(Alert, {
      slots: { default: "Mensaje", icon: "<span>!</span>" },
    });
    expect(container.querySelector(".ui-alert__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders no icon element when no icon was given", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    expect(container.querySelector(".ui-alert__icon")).toBe(null);
  });

  it("projects an action", () => {
    render(Alert, {
      slots: { default: "Mensaje", action: "<button>cargar ahora</button>" },
    });
    expect(screen.getByRole("button", { name: "cargar ahora" })).toBeTruthy();
  });

  it("renders no action element when no action was given", () => {
    const { container } = render(Alert, { slots: { default: "Mensaje" } });
    expect(container.querySelector(".ui-alert__action")).toBe(null);
  });

  it("keeps the dismiss button when an action is present", () => {
    render(Alert, {
      props: { dismissible: true, dismissLabel: "Cerrar" },
      slots: { default: "Mensaje", action: "<button>reintentar</button>" },
    });
    expect(screen.getByRole("button", { name: "reintentar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });
```

If `screen` is not already imported in that file, add it to the `@testing-library/vue` import.

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/alert/Alert.test.ts`
Expected: FAIL — no `ui-alert--boxed` class, no `ui-alert__icon`, no `ui-alert__action`; typecheck would also reject `appearance`.

- [ ] **Step 4: Extend the component**

In `src/components/alert/Alert.vue`, add the type beside `AlertVariant`:

```ts
export type AlertAppearance = "boxed" | "band";
```

Add the prop to `defineProps` with its doc comment and its default:

```ts
    /**
     * Layout. `boxed` is a self-contained card; `band` is full-bleed, square,
     * and separated from what follows by a rule — the console pages' notice.
     * Orthogonal to `variant`, which stays semantic.
     */
    appearance?: AlertAppearance;
```

```ts
    appearance: "boxed",
```

Add both modifier classes to `rootClasses`:

```ts
  "ui-alert--boxed": props.appearance === "boxed",
  "ui-alert--band": props.appearance === "band",
```

And extend the template. The icon goes before the body, the action after it and before the dismiss button:

```vue
<template>
  <div :class="rootClasses" :hidden="hidden || undefined">
    <div class="ui-alert__el" :role="role">
      <span v-if="$slots.icon" class="ui-alert__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
      <div class="ui-alert__body">
        <p v-if="title" class="ui-alert__title">{{ title }}</p>
        <div class="ui-alert__content"><slot /></div>
      </div>
      <span v-if="$slots.action" class="ui-alert__action">
        <slot name="action" />
      </span>
      <button
        v-if="dismissible"
        type="button"
        class="ui-alert__close"
        :aria-label="dismissLabel"
        @click="dismiss"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>
```

The icon is `aria-hidden` because the variant already sets `role="alert"` or `role="status"` and the message carries the meaning — an icon announced as well would say the same thing twice, and a spinner announced at all says nothing.

- [ ] **Step 5: Extend the SCSS**

Append to `src/components/alert/alert.scss`. Do not modify any existing rule:

```scss
.ui-alert__icon {
  flex: none;
  display: inline-flex;
  align-items: center;
}

.ui-alert__action {
  flex: none;
  display: inline-flex;
  align-items: center;
}

// The band: full-bleed, square, no side accent, ruled off from what follows.
// That is what makes several in a row read as a list of notices rather than a
// stack of cards.
.ui-alert--band .ui-alert__el {
  padding: var(--ui-alert-band-padding-y) var(--ui-alert-band-padding-x);
  border-left: 0;
  border-radius: 0;
  border-bottom: var(--ui-border-width) solid var(--ui-alert-band-border);
}
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/alert/Alert.test.ts`
Expected: PASS.

- [ ] **Step 7: Document it**

In `src/components/alert/alert.docs.ts`, add api rows for `appearance`, `#icon` and `#action`, and one demo showing a band with a spinner icon and an action button — the shape the console pages actually use:

```ts
    {
      title: "Band with an icon and an action",
      description:
        "Full-bleed, square, ruled off from what follows. The icon can be a spinner while the data it is talking about is still in flight.",
      code: `<UiAlert appearance="band" variant="info">
  <template #icon><UiSpinner size="sm" /></template>
  Pidiendo alertas a GitHub: una peticion por repo. Tarda unos segundos.
  <template #action><UiButton size="sm" variant="secondary">cancelar</UiButton></template>
</UiAlert>`,
    },
```

`UiSpinner` does have a `size` prop with an `sm` value — verified — so the demo compiles as written.

- [ ] **Step 8: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

This task adds no component, so `docs-model.test.ts` contributes nothing — the suite grows only by your new cases. Report what you observe.

- [ ] **Step 9: Export the type**

`src/components/alert/index.ts` currently exports `AlertVariant` and not the new
type. Add it beside:

```ts
export type { AlertVariant, AlertAppearance } from "./Alert.vue";
```

- [ ] **Step 10: Commit**

```bash
git add src/components/alert src/styles/tokens.css
git commit -m "feat(alert): variante en banda, con slots de icono y de accion"
```
