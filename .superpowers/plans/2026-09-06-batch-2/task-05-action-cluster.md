### Task 5: `UiActionCluster`

The `.acts` of `style.css:192-199`: the micro-buttons at the end of a list row, held at 32% ink until the row is hovered or selected. With twenty rows on screen, eighty icons at full ink compete with the data beside them — the dimming is the point, not decoration.

It is also the batch's one accessibility fix. Both existing implementations reveal on `.row:hover` and `.row.sel` and **on nothing else**, so in a page whose whole argument is that it is driven with `j k enter o a r s x`, the row actions cannot be reached by keyboard at all. The library version reveals on focus-within too, always.

**Files:**
- Create: `src/components/action-cluster/ActionCluster.vue`
- Create: `src/components/action-cluster/action-cluster.scss`
- Create: `src/components/action-cluster/ActionCluster.test.ts`
- Create: `src/components/action-cluster/action-cluster.docs.ts`
- Create: `src/components/action-cluster/index.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `UiActionCluster`. Task 7 swaps `control-panel/web/src/RowActions.vue` onto it.

## What this component can and cannot own

CSS cannot express "reveal when my ancestor row is hovered" without a hook on that ancestor, so the component owns what it can reach — its own `:hover`, its own `:focus-within`, and an explicit `revealed` prop — and documents the one line a consumer writes for ancestor hover. Do not invent a JavaScript hover listener to close that gap: it would duplicate what CSS already does for the cases that matter and would fire on every row of a twenty-row list.

- [ ] **Step 1: Add the tokens**

```css
  --ui-action-cluster-gap: var(--ui-space-1);
  --ui-action-cluster-quiet-opacity: 0.32;
  --ui-action-cluster-transition: 0.12s;
```

- [ ] **Step 2: Write the failing test**

Create `src/components/action-cluster/ActionCluster.test.ts`:

```ts
import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import ActionCluster from "./ActionCluster.vue";

const axeOptions = { rules: { region: { enabled: false } } };
const acciones = "<button>abrir</button><button>reiniciar</button>";

describe("ActionCluster (Vue)", () => {
  it("projects its actions", () => {
    render(ActionCluster, { props: { label: "acciones" }, slots: { default: acciones } });
    expect(screen.getByRole("button", { name: "abrir" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "reiniciar" })).toBeTruthy();
  });

  it("is a named group, so the buttons are not loose in the row", () => {
    render(ActionCluster, { props: { label: "acciones del servicio" }, slots: { default: acciones } });
    expect(screen.getByRole("group", { name: "acciones del servicio" })).toBeTruthy();
  });

  it("is quiet by default", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones" },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(true);
  });

  it("drops the quiet modifier when told it is revealed", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", revealed: true },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(false);
  });

  it("can be told never to dim", () => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", quiet: false },
      slots: { default: acciones },
    });
    expect(
      container.querySelector(".ui-action-cluster")?.classList.contains("ui-action-cluster--quiet"),
    ).toBe(false);
  });

  it("keeps its actions reachable by keyboard", () => {
    render(ActionCluster, { props: { label: "acciones" }, slots: { default: acciones } });
    const abrir = screen.getByRole("button", { name: "abrir" });
    abrir.focus();
    expect(document.activeElement).toBe(abrir);
  });

  it.each([
    ["quiet", {}],
    ["revealed", { revealed: true }],
    ["never quiet", { quiet: false }],
  ] as const)("has no axe violations (%s)", async (_n, extra) => {
    const { container } = render(ActionCluster, {
      props: { label: "acciones", ...extra },
      slots: { default: acciones },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
```

Note what these tests can and cannot prove. jsdom computes no styles, so the focus-within reveal is **not** verified by the suite — the case above proves only that the buttons are focusable, which is the half that can be tested here. Say so in your report; do not claim the reveal is covered.

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/components/action-cluster/ActionCluster.test.ts`
Expected: FAIL — `Failed to resolve import "./ActionCluster.vue"`.

- [ ] **Step 4: Write the SCSS**

```scss
// Action cluster — the micro-buttons at the end of a list row. References ONLY
// semantic / component tokens.
//
// Se atenua a proposito: con veinte filas en pantalla, ochenta iconos a plena
// tinta compiten con el dato que tienen al lado. Lo que NO se hace es atenuarlos
// y dejarlos inalcanzables — las dos implementaciones de las que sale esto
// revelan en `:hover` y en fila seleccionada y en nada mas, asi que en una
// pagina que se conduce con el teclado las acciones de fila no existian.
// `:focus-within` es la mitad que faltaba.

.ui-action-cluster {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-action-cluster-gap);
}

.ui-action-cluster--quiet {
  opacity: var(--ui-action-cluster-quiet-opacity);
  transition: opacity var(--ui-action-cluster-transition);
}

.ui-action-cluster--quiet:hover,
.ui-action-cluster--quiet:focus-within {
  opacity: 1;
}

// Un consumidor que quiera revelar al pasar por encima de la FILA entera
// escribe una linea, porque CSS no sabe seleccionar por el hover de un
// ancestro:  .mi-fila:hover .ui-action-cluster { opacity: 1; }
```

- [ ] **Step 5: Write the component**

```vue
<script setup lang="ts">
import { computed } from "vue";
import "./action-cluster.scss";

const props = withDefaults(
  defineProps<{
    /** Accessible name for the group of actions. */
    label: string;
    /**
     * Dim until hovered or focused. Turn it off for a cluster that is not
     * inside a dense list.
     */
    quiet?: boolean;
    /**
     * Force the revealed state — for a row the consumer knows is selected or
     * under the keyboard cursor.
     */
    revealed?: boolean;
  }>(),
  {
    quiet: true,
    revealed: false,
  },
);

const rootClasses = computed(() => ({
  "ui-action-cluster": true,
  "ui-action-cluster--quiet": props.quiet && !props.revealed,
}));
</script>

<template>
  <div :class="rootClasses" role="group" :aria-label="label">
    <slot />
  </div>
</template>
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/components/action-cluster/ActionCluster.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 7: Write the gallery metadata**

```ts
import type { ComponentDoc } from "../../docs-model";

export const actionClusterDoc: ComponentDoc = {
  id: "action-cluster",
  title: "Action Cluster",
  description:
    "The actions at the end of a dense list row. Dimmed until hovered or focused, so twenty rows of icons do not compete with the data beside them — and revealed on focus-within, so a keyboard can still reach them.",
  imports: ["UiActionCluster"],
  api: [
    { name: "label", type: "string", default: "—", description: "Accessible name for the group." },
    { name: "quiet", type: "boolean", default: "true", description: "Dim until hovered or focused." },
    { name: "revealed", type: "boolean", default: "false", description: "Force the revealed state, e.g. for the selected row." },
    { name: "#default", type: "slot", default: "—", description: "The action buttons." },
  ],
  demos: [
    {
      title: "In a row",
      description:
        "Tab into the cluster to see it reveal without a mouse. Revealing on the whole row's hover needs one line from the consumer, since CSS cannot select on an ancestor's hover: .fila:hover .ui-action-cluster { opacity: 1 }",
      code: `<UiActionCluster label="acciones de la fila">
  <UiButton variant="text" size="sm">wf</UiButton>
  <UiButton variant="text" size="sm">appr</UiButton>
  <UiButton variant="text" size="sm">ci</UiButton>
</UiActionCluster>`,
    },
    {
      title: "Revealed",
      code: `<UiActionCluster label="acciones de la fila" revealed>
  <UiButton variant="text" size="sm">wf</UiButton>
  <UiButton variant="text" size="sm">appr</UiButton>
</UiActionCluster>`,
    },
  ],
};
```

- [ ] **Step 8: Write the barrel and export it**

```ts
export { default as UiActionCluster } from "./ActionCluster.vue";
export { actionClusterDoc } from "./action-cluster.docs";
```

Add to `src/index.ts` between `./components/accordion` and `./components/alert` — `accordion` sorts first because `acc` precedes `act`:

```ts
export * from "./components/action-cluster";
```

- [ ] **Step 9: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: grows by your 9 tests plus 6. Report what you observe.

- [ ] **Step 10: Commit**

```bash
git add src/components/action-cluster src/styles/tokens.css src/index.ts
git commit -m "feat(action-cluster): acciones de fila que el teclado tambien alcanza"
```
