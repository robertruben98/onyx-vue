### Task 0: Branch

Batch 1 is on `feat/console-atoms` and unmerged (PR #20, stacked on PR #19). Batch 2 stacks on top rather than waiting: its components share `src/index.ts` and `src/styles/tokens.css` with batch 1, so branching off `master` would conflict on both and lose the five atoms this batch's demos reference.

**Files:** none — branch operations only.

**Interfaces:**
- Consumes: batch 1's components and tokens, present on `feat/console-atoms`.
- Produces: `feat/console-lists`, the branch every task below commits to.

- [ ] **Step 1: Confirm the starting point**

```bash
cd ~/Workspaces/robertdev/onyx/onyx-vue
git branch --show-current
git status --short
```

Expected: `feat/console-atoms` and an empty status. If the working tree is dirty, stop and report — do not stash someone else's work.

- [ ] **Step 2: Verify the baseline you are building on**

```bash
npx vitest run
npm run typecheck
```

Expected: 29 files, 484 tests passed; typecheck clean. If either fails, stop — the baseline is what every later task's numbers are measured against.

- [ ] **Step 3: Branch**

```bash
git checkout -b feat/console-lists
```

- [ ] **Step 4: Report**

No commit. Report the branch name and the verified baseline numbers.
