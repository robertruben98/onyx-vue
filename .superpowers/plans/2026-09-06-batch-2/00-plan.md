# Console Components, Batch 2 (lists) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the five list components the console pages re-implement by hand — `UiSectionHeader`, `UiGroupHeader`, `UiEmptyState`, `UiLoadMoreRow`, `UiActionCluster` — plus the band appearance and slots `UiAlert` is missing, taking the library from 27 components to 32, and retire the first piece of hand-written CSS from `control-panel/web`.

**Architecture:** Each component follows the five-file contract established by `src/components/badge/` and repeated five times in batch 1. `UiEmptyState` is a **port** of `onyx-ng/libs/ui/components/empty-state`, not a new design. `UiLoadMoreRow` composes `UiButton`; `UiActionCluster` composes nothing. The `UiAlert` change is strictly additive because `control-panel/web/src/ServiceDetail.vue` imports it in production. Tasks 1–6 are independent of one another; task 7 depends on task 5.

**Tech Stack:** Vue 3.5 `<script setup lang="ts">`, Vite 6, Vitest 2 + jsdom, `@testing-library/vue` 8, `jest-axe` 9, Sass.

**Spec:** `.superpowers/specs/2026-09-06-console-components-design.md`

## Global Constraints

- **Component export name is `UiXxx`; the SFC file is `Xxx.vue`; the directory is kebab-case.**
- **SCSS references `var(--ui-*)` only.** No raw colors, sizes, radii or shadows.
- **BEM class shape:** root `.ui-xxx`, elements `.ui-xxx__el`, modifiers `.ui-xxx--modifier`. The root carries one modifier class per active variant.
- **Props use `withDefaults(defineProps<{...}>(), {...})` with a doc comment on every prop.** Variant unions are exported types.
- **Every component ships `xxx.docs.ts`.** `docs/src/registry.ts` eagerly globs `../../src/components/*/*.docs.ts`; without that file the component is exported and invisible in the gallery.
- **Semantic variant vocabulary is the family's** — `neutral | info | success | warning | danger`.
- **Colour is never the only carrier of meaning**, and nothing interactive is reachable by mouse only.
- **Tests are written before the implementation** and every variant goes through `jest-axe`.
- **Comments inside component SCSS are in English**, matching every existing component (`badge`, `tag`, `alert`, and all five from batch 1). Spanish is for the theme files (`console.css`) and internal notes, not for `src/components/**`.
- **Commit messages are Spanish, Conventional Commits, single line, no AI trailers.** A PreToolUse hook rejects `Co-Authored-By: Claude` and `Generated with Claude Code`, and another rejects any commit over 1000 changed lines.
- **Baseline to hold:** 29 test files, 484 tests green at `99ba327`; 27 components. Every task ends with the full suite green.

## Two lessons from batch 1 that bind this batch

**Do not touch `src/styles/console.css`.** Batch 1 spent a task and a fix round discovering that the console preset already remaps every semantic colour onto its own `--ui-console-*` palette, so a component token defined as `var(--ui-color-*)` is already correct under console and needs no remap. Batch 1's attempt to "fix" this put three different reds for `danger` into a theme that has one. `console.test.ts` now carries a guard that fails if `console.css` reaches for the generic primitive palette. **Define your tokens against semantics and add nothing to any preset.**

**Each new component adds its own tests plus six.** `src/docs-model.test.ts` discovers components itself — `readdirSync` over `src/components` plus `Object.entries(onyx).filter(([n]) => n.endsWith("Doc"))` — and runs six `it.each(docs…)` blocks over them. There is nothing to register by hand. Do not chase a stated target number: run the suite and report what you observe.

## File Structure

| File | Responsibility |
|---|---|
| `src/components/section-header/…` | five files — the list section band: title, count, actions, inline controls |
| `src/components/group-header/…` | five files — the per-group band inside a grouped list, optionally activatable |
| `src/components/empty-state/…` | five files — port of the Angular component, structured copy plus two optional actions |
| `src/components/load-more-row/…` | five files — the "show the remaining N" row; composes `UiButton` |
| `src/components/action-cluster/…` | five files — row-level action group that stays keyboard reachable |
| `src/components/alert/Alert.vue` | **modify** — `appearance` prop, `#icon` and `#action` slots |
| `src/components/alert/alert.scss` | **modify** — the band appearance |
| `src/components/alert/Alert.test.ts` | **modify** — cases for both additions |
| `src/components/alert/alert.docs.ts` | **modify** — document them |
| `src/styles/tokens.css` | **modify** — new `--ui-*` families for the five components and the alert band |
| `src/index.ts` | **modify** — five new export lines |
| `control-panel/web/src/RowActions.vue` | **modify** (different repo) — wrap in `UiActionCluster`, drop the local reveal CSS |

## Tasks

Execute in order. Tasks 1–6 have no dependency on each other; task 7 needs task 5.

| Brief | Deliverable |
|---|---|
| [`task-00-branch.md`](task-00-branch.md) | `feat/console-lists` branched off `feat/console-atoms` |
| [`task-01-section-header.md`](task-01-section-header.md) | `UiSectionHeader` |
| [`task-02-group-header.md`](task-02-group-header.md) | `UiGroupHeader` |
| [`task-03-empty-state.md`](task-03-empty-state.md) | `UiEmptyState`, `EmptyStateRole` |
| [`task-04-load-more-row.md`](task-04-load-more-row.md) | `UiLoadMoreRow` |
| [`task-05-action-cluster.md`](task-05-action-cluster.md) | `UiActionCluster` |
| [`task-06-alert-band.md`](task-06-alert-band.md) | `AlertAppearance`, `#icon` and `#action` slots |
| [`task-07-consumer-and-verify.md`](task-07-consumer-and-verify.md) | `RowActions.vue` swapped, gallery checked, batch PR |
