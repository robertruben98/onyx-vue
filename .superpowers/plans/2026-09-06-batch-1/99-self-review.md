## Self-review

**Spec coverage.** Batch 1 of the spec lists `UiStatusDot`, `UiSeverityBadge`, `UiTriStateCount`, `UiRelativeTime`, `UiTruncate`, the `resolveTriState` helper and the `UiTag` `muted` extension — tasks 1 to 6 cover all seven. The spec's *Tokens* section requires console remaps and the `console.test.ts` guard: task 7. The spec's *Delivery* section requires step zero and one pull request per batch: task 0 and task 7 step 9. The spec's *Verification* section requires suite, typecheck and gallery: every task's penultimate step plus task 7 step 7. Batch 1 retires nothing from `control-panel/web`, per the spec's retirement table, so no consumer task exists here — correct, not a gap.

**Placeholders.** None. Every code step carries the code.

**Type consistency.** `TriState` is defined in task 3 and consumed by batch 3's `UiFilterChip` per the spec's interface note. `StatusDotState` (task 1) is consumed by batch 3's `UiHealthChip` and batch 5's `UiCheckItem`. `Severity` and `severityRank` (task 2) are self-contained. `formatRelative(date, now)` takes `now` as a required second parameter in the helper and an optional prop on the component — deliberate, and the tests pin both.

**Known deviation from the source.** `UiRelativeTime`'s stale rule changes behaviour relative to `prs.js`: a 30-day-old row now reads stale where the original's string match said otherwise. Task 4 step 2 pins this with an explicit test rather than leaving it to be discovered.

## Test-count arithmetic

The running totals in each task's Step 9 assume every preceding task landed and that the baseline is 379. Each new component contributes its own test file **plus six** cases in `src/docs-model.test.ts`, which runs `describe.each(TODOS)` over the component registry — the first version of this table missed that and under-counted every row by six per component. If tasks are executed out of order the totals shift; the invariant that matters is that the suite is **green** and the count only ever goes up.

| After task | Files | Tests |
|---|---|---|
| baseline | 24 | 379 |
| 1 | 25 | 394 |
| 2 | 26 | 414 |
| 3 | 27 | 438 |
| 4 | 28 | 458 |
| 5 | 29 | 470 |
| 6 | 29 | 473 |
| 7 | 29 | 474 |
