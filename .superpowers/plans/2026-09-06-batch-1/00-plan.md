# Console Components, Batch 1 (state atoms) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the five state atoms the console pages re-implement by hand — `UiStatusDot`, `UiSeverityBadge`, `UiTriStateCount`, `UiRelativeTime`, `UiTruncate` — plus the `muted` variant `UiTag` is missing, taking the library from 22 components to 27.

**Architecture:** Each component follows the five-file contract already established by `src/components/badge/`: an SFC, a SCSS file referencing only `--ui-*` tokens, a testing-library + jest-axe test, a `ComponentDoc` metadata file that makes the gallery page appear on its own, and a barrel. New component tokens are hand-written into `src/styles/tokens.css` and remapped in `src/styles/console.css` where the console look diverges. No component in this batch depends on another, so tasks 2–6 may be done in any order once task 1 lands.

**Tech Stack:** Vue 3.5 `<script setup lang="ts">`, Vite 6, Vitest 2 + jsdom, `@testing-library/vue` 8, `jest-axe` 9, Sass.

**Spec:** `.superpowers/specs/2026-09-06-console-components-design.md`

## Global Constraints

- **Component export name is `UiXxx`; the SFC file is `Xxx.vue`; the directory is kebab-case.**
- **SCSS references `var(--ui-*)` only.** No raw colors, sizes, radii or shadows. This is what lets `console.css` restyle the library without touching a component.
- **BEM class shape:** root `.ui-xxx`, elements `.ui-xxx__el`, modifiers `.ui-xxx--modifier`. The root carries one modifier class per active variant, mirroring the Angular host bindings.
- **Props use `withDefaults(defineProps<{...}>(), {...})` with a doc comment on every prop.** Variant unions are exported types.
- **Every component ships `xxx.docs.ts`.** `docs/src/registry.ts` eagerly globs `../../src/components/*/*.docs.ts`; without that file the component is exported and invisible in the gallery.
- **Semantic variant vocabulary is the family's** — `neutral | info | success | warning | danger` — not the console page's private `ok | warn | down | off`. State vocabularies that are genuinely not semantic variants (a dot's `live`/`dead`) are their own unions.
- **Anything time-dependent takes its clock as a prop.** A component that reads `Date.now()` internally cannot be tested deterministically.
- **Colour is never the only carrier of meaning.** Every state has an accessible name stating the meaning, not the glyph.
- **Tests are written before the implementation** and every variant goes through `jest-axe`.
- **Commit messages are Spanish, Conventional Commits, single line, no AI trailers.** A PreToolUse hook rejects `Co-Authored-By: Claude` and `Generated with Claude Code`.
- **Baseline to hold:** 24 test files, 379 tests green at `eda0468`. Every task ends with the full suite green, never just its own file.

## File Structure

| File | Responsibility |
|---|---|
| `src/components/status-dot/StatusDot.vue` | coloured dot with an accessible name; `role="img"` when named, `aria-hidden` when decorative |
| `src/components/status-dot/status-dot.scss` | dot size and the five state colours |
| `src/components/status-dot/StatusDot.test.ts` | behaviour + axe |
| `src/components/status-dot/status-dot.docs.ts` | gallery metadata |
| `src/components/status-dot/index.ts` | barrel |
| `src/components/severity-badge/…` | same five, plus `severityRank()` — the sort scale consumers currently copy |
| `src/components/tri-state-count/…` | same five, plus `resolveTriState()` and the exported `TriState` type |
| `src/components/relative-time/…` | same five, plus `formatRelative()` |
| `src/components/truncate/…` | same five |
| `src/styles/tokens.css` | **modify** — new `--ui-*` component tokens for the four new families |
| `src/styles/console.css` | **modify** — remaps where the console look diverges |
| `src/components/tag/Tag.vue` | **modify** — add `muted` to `TagVariant` |
| `src/components/tag/tag.scss` | **modify** — `.ui-tag--muted` rule |
| `src/components/tag/tag.docs.ts` | **modify** — document and demo the new variant |
| `src/index.ts` | **modify** — five new export lines |

## Tasks

Execute in order. Each file is a self-contained brief: the files it touches, the
interfaces it consumes and produces, and its own TDD cycle ending in a commit.

| Brief | Deliverable |
|---|---|
| [`task-00-ship-the-substrate.md`](task-00-ship-the-substrate.md) | `feat/console-preset` merged to `master`; batch branch created |
| [`task-01-uistatusdot.md`](task-01-uistatusdot.md) | `UiStatusDot`, `StatusDotState` |
| [`task-02-uiseveritybadge-and-severityrank.md`](task-02-uiseveritybadge-and-severityrank.md) | `UiSeverityBadge`, `Severity`, `severityRank()` |
| [`task-03-uitristatecount-resolvetristate-and-tris.md`](task-03-uitristatecount-resolvetristate-and-tris.md) | `UiTriStateCount`, `TriState`, `TriStateTone`, `resolveTriState()` |
| [`task-04-uirelativetime-and-formatrelative.md`](task-04-uirelativetime-and-formatrelative.md) | `UiRelativeTime`, `formatRelative()` |
| [`task-05-uitruncate.md`](task-05-uitruncate.md) | `UiTruncate` |
| [`task-06-uitag-gains-a-muted-variant.md`](task-06-uitag-gains-a-muted-variant.md) | `TagVariant` widened with `"muted"` |
| [`task-07-console-preset-coverage-and-batch-verifi.md`](task-07-console-preset-coverage-and-batch-verifi.md) | console remaps, style guard, gallery check, batch pull request |
| [`99-self-review.md`](99-self-review.md) | spec-coverage check and the test-count table |

Tasks 1 to 5 have no dependency on each other and may be reordered. Task 0 comes
first, tasks 6 and 7 last — task 7 asserts the console preset covers every token
the earlier tasks added.
