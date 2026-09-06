### Task 3: `UiEmptyState`

A **port** of `onyx-ng/libs/ui/components/empty-state`, the one component the Angular library has and this one does not. Read the original before you write anything: `empty-state.component.ts`, `.html`, `.scss` and `.docs.ts` in that directory.

**Files:**
- Create: `src/components/empty-state/EmptyState.vue`
- Create: `src/components/empty-state/empty-state.scss`
- Create: `src/components/empty-state/EmptyState.test.ts`
- Create: `src/components/empty-state/empty-state.docs.ts`
- Create: `src/components/empty-state/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `UiButton` from `../button`.
- Produces: `UiEmptyState`, `export type EmptyStateRole = "region" | "status"`.

## Two deliberate departures from the original

Port the **API** faithfully — the props, the events, the slot names, the ARIA wiring. Depart in exactly these two places, and say so in your report:

**1. The actions compose `UiButton` instead of re-styling buttons.** The Angular component owns `.ui-empty-state__action--primary` and `--secondary` with their own hover, active, disabled and focus rules, and 15 of its 28 tokens exist only to feed them. `UiButton` already does all of it, with `variant="primary"` and `variant="secondary"`, `size`, `disabled` and the same focus ring. Re-implementing that here would be verbatim duplication of a logic block. Port only the 13 layout and copy tokens listed below.

**2. Slot presence is read with `useSlots()`, not with `:has()` and `childElementCount`.** Angular needs `afterNextRender` plus a `viewChild` to discover whether a projection landed; Vue knows at setup. This also fixes a wart in the original: it always renders `<p class="ui-empty-state__description" [id]="descriptionId">` and always points `aria-describedby` at it, so an empty state with no description advertises an empty description to a screen reader. Render the description only when its slot has content, and set `aria-describedby` only then.

- [ ] **Step 1: Add the tokens**

Append to the `:root` block of `src/styles/tokens.css`. These are the original's values, minus the fifteen that only fed the hand-rolled buttons:

```css
  --ui-empty-state-max-width: 32rem;
  --ui-empty-state-full-width: 100%;
  --ui-empty-state-visual-size: 4rem;
  --ui-empty-state-padding-x: var(--ui-space-4);
  --ui-empty-state-padding-y: var(--ui-space-5);
  --ui-empty-state-gap: var(--ui-space-4);
  --ui-empty-state-content-gap: var(--ui-space-2);
  --ui-empty-state-title-font-size: var(--ui-font-size-lg);
  --ui-empty-state-title-font-weight: var(--ui-font-weight-medium);
  --ui-empty-state-description-font-size: var(--ui-font-size-md);
  --ui-empty-state-actions-gap: var(--ui-space-2);
  --ui-empty-state-color: var(--ui-color-text);
  --ui-empty-state-description-color: var(--ui-color-text-muted);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/empty-state/EmptyState.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import EmptyState from "./EmptyState.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("EmptyState (Vue)", () => {
  it("projects the title and labels the region with it", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Sin issues asignadas" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    const titleId = root.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(container.querySelector(`#${titleId}`)?.textContent).toContain(
      "Sin issues asignadas",
    );
  });

  it("prefers an explicit ariaLabel over the title for the accessible name", () => {
    const { container } = render(EmptyState, {
      props: { ariaLabel: "Lista vacia" },
      slots: { title: "Sin issues" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("aria-label")).toBe("Lista vacia");
    expect(root.getAttribute("aria-labelledby")).toBe(null);
  });

  it("defaults to the region role", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    expect(container.querySelector(".ui-empty-state")?.getAttribute("role")).toBe("region");
  });

  it("takes the status role, for an empty state that appears dynamically", () => {
    const { container } = render(EmptyState, {
      props: { role: "status" },
      slots: { title: "Vacio" },
    });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("role")).toBe("status");
    expect(root.getAttribute("aria-atomic")).toBe("true");
  });

  it("describes itself only when a description was actually given", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    const root = container.querySelector(".ui-empty-state")!;
    expect(root.getAttribute("aria-describedby")).toBe(null);
    expect(container.querySelector(".ui-empty-state__description")).toBe(null);
  });

  it("wires aria-describedby when there is a description", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Vacio", description: "Nada que revisar hoy." },
    });
    const root = container.querySelector(".ui-empty-state")!;
    const id = root.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(container.querySelector(`#${id}`)?.textContent).toContain("Nada que revisar hoy.");
  });

  it("renders no actions when no action slot was filled", () => {
    const { container } = render(EmptyState, { slots: { title: "Vacio" } });
    expect(container.querySelector(".ui-empty-state__actions")).toBe(null);
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  it("emits primaryAction when the primary button is activated", async () => {
    const { emitted } = render(EmptyState, {
      slots: { title: "Vacio", primaryAction: "Cargar ahora" },
    });
    (screen.getByRole("button", { name: "Cargar ahora" }) as HTMLButtonElement).click();
    expect(emitted().primaryAction).toBeTruthy();
  });

  it("emits secondaryAction when the secondary button is activated", async () => {
    const { emitted } = render(EmptyState, {
      slots: { title: "Vacio", secondaryAction: "Ver opciones" },
    });
    (screen.getByRole("button", { name: "Ver opciones" }) as HTMLButtonElement).click();
    expect(emitted().secondaryAction).toBeTruthy();
  });

  it("disables both actions and marks itself aria-disabled", () => {
    const { container } = render(EmptyState, {
      props: { disabled: true },
      slots: { title: "Vacio", primaryAction: "Cargar", secondaryAction: "Opciones" },
    });
    expect(container.querySelector(".ui-empty-state")?.getAttribute("aria-disabled")).toBe("true");
    const buttons = [...container.querySelectorAll("button")] as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it("emits nothing while disabled", () => {
    const { container, emitted } = render(EmptyState, {
      props: { disabled: true },
      slots: { title: "Vacio", primaryAction: "Cargar" },
    });
    (container.querySelector("button") as HTMLButtonElement).click();
    expect(emitted().primaryAction).toBeFalsy();
  });

  it("hides the visual from assistive tech", () => {
    const { container } = render(EmptyState, {
      slots: { title: "Vacio", icon: "<svg />" },
    });
    expect(container.querySelector(".ui-empty-state__visual")?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    ["title only", { title: "Vacio" }],
    ["full", { title: "Vacio", description: "Nada aqui.", icon: "<svg />", primaryAction: "Cargar", secondaryAction: "Opciones" }],
  ] as const)("has no axe violations (%s)", async (_n, slots) => {
    const { container } = render(EmptyState, { slots });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/empty-state/EmptyState.test.ts`
Expected: FAIL — `Failed to resolve import "./EmptyState.vue"`.

- [ ] **Step 4: Write the SCSS**

Create `src/components/empty-state/empty-state.scss`. This is the original's layout, with every action rule dropped — `UiButton` owns those now:

```scss
// EmptyState — ported from the Angular lib. References ONLY semantic /
// component tokens. The Angular `:host` maps to the root class.
//
// The original's `:has()` rules for hiding empty slots are gone: Vue knows at
// setup whether a slot was filled, so the elements are not rendered at all
// rather than rendered and hidden. Its action styling is gone too — UiButton
// already carries it, and fifteen of the original's tokens existed only to
// feed a second copy of it.

.ui-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: var(--ui-empty-state-full-width);
  max-width: var(--ui-empty-state-max-width);
  padding: var(--ui-empty-state-padding-y) var(--ui-empty-state-padding-x);
  gap: var(--ui-empty-state-gap);
  color: var(--ui-empty-state-color);
  text-align: center;
}

.ui-empty-state__visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-empty-state-visual-size);
  height: var(--ui-empty-state-visual-size);
  color: var(--ui-color-primary);
}

.ui-empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ui-empty-state-content-gap);
}

.ui-empty-state__title,
.ui-empty-state__description {
  margin: 0;
}

.ui-empty-state__title {
  font-size: var(--ui-empty-state-title-font-size);
  font-weight: var(--ui-empty-state-title-font-weight);
}

.ui-empty-state__description {
  font-size: var(--ui-empty-state-description-font-size);
  color: var(--ui-empty-state-description-color);
}

.ui-empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ui-empty-state-actions-gap);
}

// Bajo 30rem los botones dejan de caber uno al lado del otro.
@media (max-width: 30rem) {
  .ui-empty-state__actions {
    width: var(--ui-empty-state-full-width);
    flex-direction: column;
  }
}
```

- [ ] **Step 5: Write the component**

Create `src/components/empty-state/EmptyState.vue`:

```vue
<script setup lang="ts">
import { computed, useSlots } from "vue";
import { UiButton } from "../button";
import "./empty-state.scss";

export type EmptyStateRole = "region" | "status";

let nextId = 0;

const props = withDefaults(
  defineProps<{
    /** ARIA role. Use `status` when the empty state appears dynamically and should be announced. */
    role?: EmptyStateRole;
    /** Accessible name used instead of the title slot when provided. */
    ariaLabel?: string;
    /** Disables both actions and exposes `aria-disabled` on the root. */
    disabled?: boolean;
  }>(),
  {
    role: "region",
    ariaLabel: "",
    disabled: false,
  },
);

/** Emitted when the primary action is activated. */
/** Emitted when the secondary action is activated. */
const emit = defineEmits<{
  primaryAction: [event: MouseEvent];
  secondaryAction: [event: MouseEvent];
}>();

const slots = useSlots();

const uid = nextId++;
const titleId = `ui-empty-state-title-${uid}`;
const descriptionId = `ui-empty-state-description-${uid}`;

const hasVisual = computed(() => !!slots.icon || !!slots.illustration);
const hasDescription = computed(() => !!slots.description);
const hasPrimary = computed(() => !!slots.primaryAction);
const hasSecondary = computed(() => !!slots.secondaryAction);
const hasActions = computed(() => hasPrimary.value || hasSecondary.value);

/**
 * An explicit name wins; otherwise the title labels the region. Pointing
 * `aria-describedby` at a description that was never given is the wart this
 * port fixes — the Angular original always renders the paragraph.
 */
const labelledBy = computed(() => (props.ariaLabel ? undefined : titleId));
const describedBy = computed(() => (hasDescription.value ? descriptionId : undefined));
</script>

<template>
  <div
    class="ui-empty-state"
    :class="{ 'ui-empty-state--disabled': disabled }"
    :role="role"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-atomic="role === 'status' ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div v-if="hasVisual" class="ui-empty-state__visual" aria-hidden="true">
      <slot name="icon"><slot name="illustration" /></slot>
    </div>

    <div class="ui-empty-state__content">
      <h2 :id="titleId" class="ui-empty-state__title"><slot name="title" /></h2>
      <p v-if="hasDescription" :id="descriptionId" class="ui-empty-state__description">
        <slot name="description" />
      </p>
    </div>

    <div v-if="hasActions" class="ui-empty-state__actions">
      <UiButton
        v-if="hasPrimary"
        variant="primary"
        :disabled="disabled"
        @clicked="(e) => emit('primaryAction', e)"
      >
        <slot name="primaryAction" />
      </UiButton>
      <UiButton
        v-if="hasSecondary"
        variant="secondary"
        :disabled="disabled"
        @clicked="(e) => emit('secondaryAction', e)"
      >
        <slot name="secondaryAction" />
      </UiButton>
    </div>
  </div>
</template>
```

`UiButton` emits `clicked` and suppresses it while disabled, which is what makes the "emits nothing while disabled" test pass without a guard here. Confirm that by reading `src/components/button/Button.vue` before trusting it.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/empty-state/EmptyState.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 7: Write the gallery metadata**

Create `src/components/empty-state/empty-state.docs.ts`:

```ts
import type { ComponentDoc } from "../../docs-model";

export const emptyStateDoc: ComponentDoc = {
  id: "empty-state",
  title: "Empty State",
  description:
    "Placeholder for empty and zero-data views: a decorative visual, structured copy, and up to two actions. Ported from the Angular library, with the actions built on UiButton and the description wired only when one is actually given.",
  imports: ["UiEmptyState"],
  api: [
    {
      name: "role",
      type: "'region' | 'status'",
      default: "'region'",
      description: "Use status when the empty state appears dynamically and should be announced.",
    },
    { name: "ariaLabel", type: "string", default: "''", description: "Accessible name that overrides labelling by the title slot." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables both actions and marks the root aria-disabled." },
    { name: "@primaryAction", type: "(event: MouseEvent) => void", default: "—", description: "Emitted when the primary action is activated." },
    { name: "@secondaryAction", type: "(event: MouseEvent) => void", default: "—", description: "Emitted when the secondary action is activated." },
    { name: "#title", type: "slot", default: "—", description: "Required unless ariaLabel is given." },
    { name: "#description", type: "slot", default: "—", description: "Optional. Wired to aria-describedby only when filled." },
    { name: "#icon / #illustration", type: "slot", default: "—", description: "Decorative visual, hidden from assistive technology." },
    { name: "#primaryAction / #secondaryAction", type: "slot", default: "—", description: "Button labels. The button itself is rendered for you." },
  ],
  demos: [
    {
      title: "Copy only",
      code: `<UiEmptyState>
  <template #title>Sin issues asignadas</template>
  <template #description>Nada que revisar hoy.</template>
</UiEmptyState>`,
    },
    {
      title: "With actions",
      code: `<UiEmptyState>
  <template #title>Alertas en modo a demanda</template>
  <template #description>No se han pedido a GitHub. Esto no es "nada abierto", es "no se sabe".</template>
  <template #primaryAction>Cargar ahora</template>
  <template #secondaryAction>Opciones</template>
</UiEmptyState>`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

Create `src/components/empty-state/index.ts`:

```ts
export { default as UiEmptyState } from "./EmptyState.vue";
export type { EmptyStateRole } from "./EmptyState.vue";
export { emptyStateDoc } from "./empty-state.docs";
```

`export type` from `<script setup>` is fine and needs no second script block — `src/components/status-dot/StatusDot.vue` exports `StatusDotState` exactly this way and its barrel re-exports it with typecheck clean. The second block is only needed for a **runtime** export like `severityRank`, which `SeverityBadge.vue` has.

Add to `src/index.ts`, alphabetically between `./components/divider` and `./components/group-header`:

```ts
export * from "./components/empty-state";
```

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: grows by your 14 tests plus 6. Report what you observe.

- [ ] **Step 10: Commit**

```bash
git add src/components/empty-state src/styles/tokens.css src/index.ts
git commit -m "feat(empty-state): portado de la libreria de Angular, con las acciones sobre UiButton"
```
