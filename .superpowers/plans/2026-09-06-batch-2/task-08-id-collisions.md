### Task 8: Unique ids in five shipped components, and a guard so it stops happening

Five components already in the library generate DOM ids from a counter declared inside `<script setup>`. Vue compiles that body into `setup()`, so the counter is **per instance**, not per module, and it resets to zero for every component created. Two of the same component on one page therefore render the same `id`.

This is not theoretical and it is not new code:

```
UiInput     two instances -> id="ui-input-0" and id="ui-input-0"     COLLISION
UiCheckbox  two instances -> "ui-checkbox-0" and "ui-checkbox-1"     correct
```

Measured with a throwaway probe on this branch. `UiCheckbox` is correct because it declares its counter in a **plain `<script lang="ts">` block** after `<script setup>` (`Checkbox.vue:78-81`), which really is module scope. That contrast is almost certainly how the bug spread: someone copied the idea and not the placement.

What it breaks: `<label for>` resolves to the first matching id, so clicking the second field's label focuses the first field. `aria-labelledby` and `aria-describedby` resolve the same way. For `UiInput` and `UiSelect`, "two on one page" is not an edge case — it is a form.

**Files:**
- Modify: `src/components/select/Select.vue` — `let nextSelectId = 0` at `:11`, consumed at `:40`, feeding `listboxId` (`:41`) and per-option ids (`:61`)
- Modify: `src/components/input/Input.vue` — `let nextId = 0` at `:15`, consumed at `:51`
- Modify: `src/components/textarea/Textarea.vue` — `let nextId = 0` at `:5`, consumed at `:38`
- Modify: `src/components/radio-group/RadioGroup.vue` — `let nextId = 0` at `:11`
- Modify: `src/components/dialog/Dialog.vue` — `let nextId = 0` at `:7`, consumed at `:45`
- Modify: each of those five components' `*.test.ts` — one two-instance case each
- Create: `src/id-scope.test.ts` — the guard

**Interfaces:**
- Consumes: `useId` from `vue` (3.5+; this repo is on `^3.5.13`), already used by `src/components/empty-state/EmptyState.vue`.
- Produces: nothing exported. Behaviour change only — ids become unique, and their format changes.

## The guard comes first

Fixing five files without a guard means the sixth person repeats it. Write the guard, watch it fail with exactly five violations, then fix them.

- [ ] **Step 1: Write the failing guard**

Create `src/id-scope.test.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A counter declared inside `<script setup>` is NOT module scope: Vue compiles
// that block into `setup()`, so it resets for every instance and two components
// on one page render the same DOM id. `<label for>` then points at the wrong
// control, and aria-labelledby/aria-describedby resolve to the wrong element.
//
// This guard is static on purpose. Rendering every component twice would need
//每 component's required props; reading where the counter is declared needs
// nothing and catches the mistake at the place it is made.
const COMPONENTES = join(process.cwd(), "src", "components");

/** The `<script setup>` block's body, or "" when the file has none. */
function cuerpoDeScriptSetup(sfc: string): string {
  const m = /<script setup[^>]*>([\s\S]*?)<\/script>/.exec(sfc);
  return m ? m[1] : "";
}

const sfcs = readdirSync(COMPONENTES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) =>
    readdirSync(join(COMPONENTES, d.name))
      .filter((f) => f.endsWith(".vue"))
      .map((f) => [`${d.name}/${f}`, readFileSync(join(COMPONENTES, d.name, f), "utf8")] as const),
  );

describe("id generation is not scoped to setup()", () => {
  it("finds the component files", () => {
    expect(sfcs.length).toBeGreaterThan(20);
  });

  it("declares no id counter inside <script setup>", () => {
    const infractores = sfcs
      .filter(([, sfc]) => /\blet\s+next\w*[Ii]d\b/.test(cuerpoDeScriptSetup(sfc)))
      .map(([nombre]) => nombre);
    expect(infractores).toEqual([]);
  });

  it("calls no bare increment of such a counter inside <script setup>", () => {
    // `const uid = nextId++` is the other half of the same mistake, and it can
    // appear even when the declaration was moved out correctly.
    const infractores = sfcs
      .filter(([, sfc]) => /\bnext\w*[Ii]d\+\+/.test(cuerpoDeScriptSetup(sfc)))
      .map(([nombre]) => nombre);
    expect(infractores).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail with a named list**

Run: `npx vitest run src/id-scope.test.ts`
Expected: FAIL. The second case must name exactly five files — `select/Select.vue`, `input/Input.vue`, `textarea/Textarea.vue`, `radio-group/RadioGroup.vue`, `dialog/Dialog.vue`. `checkbox/Checkbox.vue` must **not** appear: its counter is in a plain `<script>` block and is legitimate.

If the list differs from those five, stop and report it — the population changed and the fix list needs to change with it.

- [ ] **Step 3: Fix the five with `useId()`**

For each file: delete the `let next…Id = 0` declaration, import `useId` from `vue` alongside the existing imports, and derive the ids from it. `EmptyState.vue:40-42` is the worked example already in the tree:

```ts
const uid = useId();
const titleId = `ui-empty-state-title-${uid}`;
```

Keep each component's existing id **prefix** so the shape stays recognisable — `ui-input-…`, `ui-select-listbox-…`, `ui-dialog-title-…`. `useId()` returns something like `v-0`, so `ui-input-v-0` is the expected new shape; that is fine and no test should assert the old exact string.

`Select.vue` is the one to read carefully: its `uid` feeds both `listboxId` and a per-option id function at `:61`. Both must keep working from the single `useId()` value.

`RadioGroup.vue` declares a counter at `:11` — check what actually consumes it before assuming. If nothing does, delete the declaration rather than converting it, and say so.

**Do not touch `Checkbox.vue`.** It is correct. Its module-scoped counter is a second legitimate pattern; converting it would be changing working code for consistency alone, which is not what this task is for. Note it in your report as the odd one out.

- [ ] **Step 4: Run the guard and watch it pass**

Run: `npx vitest run src/id-scope.test.ts`
Expected: PASS.

- [ ] **Step 5: Prove the behaviour, not just the shape**

The guard is static — it proves where the counter lives, not that ids differ. Add one case to each of the five components' existing test files rendering **two** instances under one tree and asserting the ids differ. `EmptyState.test.ts` already has this shape from task 3's fix round; follow it.

Two instances must share one app tree for `useId()` to distinguish them — mounting two separate roots resets the counter, which is documented Vue behaviour and not a bug. Use a wrapper component with `h()`, as `EmptyState.test.ts` does.

- [ ] **Step 6: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Every existing test that asserted an exact id string will now fail, because the format changed. Those assertions were pinning an implementation detail that was itself the bug. Update them to assert **uniqueness or linkage** — that a `<label for>` matches its input's `id`, that `aria-labelledby` resolves to a real element — rather than a literal `ui-input-0`. Report every test you had to change and why.

- [ ] **Step 7: Check the consumer still builds**

`control-panel/web` imports `UiInput`, `UiDialog` and others from this library through a Vite alias to the working tree.

```bash
cd /home/arobertdev/Workspaces/robertdev/control-panel/web
npm run test
npm run typecheck
```

Baseline measured on this branch before this task: **5 test files, 26 tests green, typecheck clean**. If either goes red, it is this change.

- [ ] **Step 8: Commit**

```bash
cd /home/arobertdev/Workspaces/robertdev/onyx/onyx-vue
git add src/components/select src/components/input src/components/textarea \
        src/components/radio-group src/components/dialog src/id-scope.test.ts
git commit -m "fix(a11y): ids unicos por instancia en los cinco componentes que colisionaban"
```
