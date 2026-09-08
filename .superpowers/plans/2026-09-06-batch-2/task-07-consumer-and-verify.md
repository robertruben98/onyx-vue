### Task 7: Retire the consumer's reveal CSS, then verify the batch

Batch 1 added vocabulary the app never had and retired nothing. This is the first task in the whole effort that takes code **away** from a consumer, which is the only proof an extraction worked: the library component has to be good enough that the hand-written one can go.

**Files:**
- Modify: `/home/arobertdev/Workspaces/robertdev/control-panel/web/src/RowActions.vue` — **a different repository**
- Modify: `src/styles/console.test.ts` — only if the guard needs it; see step 4

**Interfaces:**
- Consumes: `UiActionCluster` from Task 5.
- Produces: nothing the library exports.

## What is being retired, and what is not

`RowActions.vue` does not disappear. It is domain-coupled — it takes a `Service`, hardcodes four SVG paths and emits `abrir`/`reiniciar`/`logs`/`power` — so the library can own its reveal behaviour and its layout, not its buttons. What goes is its `<style scoped>` block: the flex layout, the `opacity: 0.32`, the transition, and the `:global(.ui-dt__tr:hover)` selector that reaches into `UiDataTable`'s internal class names.

That last one is only half-fixed here. CSS cannot select on an ancestor's hover, so the consumer keeps **one** line for the row-hover case while the library owns focus-within — which is the half that was missing entirely and the reason a keyboard could not reach these buttons. Batch 6 owns the rest, when `UiDataTable` gains real row state.

- [ ] **Step 1: Read the consumer before touching it**

```bash
cat /home/arobertdev/Workspaces/robertdev/control-panel/web/src/RowActions.vue
cd /home/arobertdev/Workspaces/robertdev/control-panel && git status --short && git branch --show-current
```

Expected branch: `chore/baseline-snapshot`. This repo has **no remote** and must not be given one — `AVISO-SECRETOS.md` in its root explains why. Commit locally; do not push.

If the working tree is dirty, stop and report rather than committing someone else's changes alongside yours.

- [ ] **Step 2: Swap the component**

In `RowActions.vue`: import `UiActionCluster` from `@onyx/vue`, wrap the four buttons in it with an accessible label, and **delete** the `.acciones` layout, opacity, transition and `:global(...)` rules from the `<style scoped>` block. Keep the button, `:disabled` and `svg` rules — those are its own icons and the library does not own them.

The wrapper gains one line the library cannot express:

```css
:global(.ui-dt__tr:hover) .ui-action-cluster { opacity: 1; }
```

Keep the existing comment explaining *why* the icons are dimmed; move it onto the `UiActionCluster` usage so the reasoning survives the file it was written in.

The app resolves `@onyx/vue` through a Vite alias to `../../onyx/onyx-vue/src/index.ts` — it reads the library's **working tree**, so this swap only builds while `feat/console-lists` is checked out. Note that in your report.

- [ ] **Step 3: Run the consumer's own tests**

```bash
cd /home/arobertdev/Workspaces/robertdev/control-panel/web
npm run test
npm run typecheck
```

Both scripts exist and both tools are installed — verified. The consumer's
baseline **before** your change, measured on this branch: **5 test files, 26
tests green, typecheck clean**. That typecheck passing is itself worth noting:
the app resolves `@onyx/vue` to the library's working tree, so it compiles
against whatever this branch currently holds. If either goes red after your
swap, it is your swap — there was nothing broken to inherit.

Then commit in that repo:

```bash
git add src/RowActions.vue
git commit -m "refactor(web): las acciones de fila pasan a UiActionCluster"
```

- [ ] **Step 4: Confirm the console preset still needs nothing**

Batch 1 learned the hard way that component tokens defined as `var(--ui-color-*)` are already correct under the console preset, and that reaching for the generic palette to "fix" them puts a second red into a theme that has one. `console.test.ts` now guards that. Confirm this batch did not break it and did not need an exception:

```bash
cd /home/arobertdev/Workspaces/robertdev/onyx/onyx-vue
npx vitest run src/styles/console.test.ts
grep -nE 'var\(--ui-(slate|red|amber|blue|green|emerald|white|black)-?[0-9]*\)' src/styles/console.css || echo "sin primitivos genericos"
```

Expected: green, and no output from the grep. If any token this batch added does **not** resolve through a semantic, that is a finding — report it rather than adding a remap.

- [ ] **Step 5: Verify the gallery**

The docs site serves the Vite dev server over this working tree, but its registry globs `../../src/components/*/*.docs.ts` from **outside** the Vite root, so the watcher does not see directories added while it runs. Restart it or you will be looking at the component list it booted with — measured in batch 1: five new components on disk, all tests green, the site answering 200, and the registry still listing the old count.

```bash
systemctl --user restart onyx-docs && sleep 4
systemctl --user is-active onyx-docs
curl -sS -o /dev/null -w '%{http_code}\n' https://onyx.local.com/
curl -sS http://127.0.0.1:9300/src/registry.ts | grep -oE '[a-z-]+\.docs\.ts' | sort -u | wc -l
```

Expected: `active`, `200`, and **32** — the 27 from batch 1 plus this batch's five. Confirm the five new ids appear:

```bash
curl -sS http://127.0.0.1:9300/src/registry.ts | grep -oE '(section-header|group-header|empty-state|load-more-row|action-cluster)\.docs\.ts' | sort -u
```

- [ ] **Step 6: Say what you could not verify**

There is no browser in this environment. The checks above prove the pages are registered and routable; they do **not** prove anything renders correctly, and in this batch specifically they do not prove:

- that `UiActionCluster` actually reveals on `:focus-within` — jsdom computes no styles, so the suite proves only that the buttons are focusable;
- that `UiEmptyState`'s responsive stacking under 30rem works;
- that `UiGroupHeader`'s long form disappears below 77.5rem;
- that the `UiAlert` band reads as a band.

Write these under a `## Not verified` heading, plainly, without softening any of them into "should work".

- [ ] **Step 7: Run the whole suite one last time and report**

```bash
cd /home/arobertdev/Workspaces/robertdev/onyx/onyx-vue
npx vitest run
npm run typecheck
```

Report the final numbers. Baseline entering this batch was 29 files / 484 tests.

- [ ] **Step 8: Stop**

Do **not** push and do **not** open a pull request. Outward-facing actions stay with the controller. Report and stop.
