### Task 0: Ship the substrate

`feat/console-preset` is 19 commits ahead of `origin/master` and has never been pushed. It carries the `console` preset, the documentation site and the `docs-model` mechanism that every task below depends on. Until it is on `master`, every batch branch either forks a moving local branch or loses the gallery.

**Files:** none — branch and remote operations only.

**Interfaces:**
- Consumes: nothing.
- Produces: an `origin/master` that contains `docs-model`, `src/styles/console.css`, `docs/src/registry.ts` and the spec at `.superpowers/specs/2026-09-06-console-components-design.md`.

- [ ] **Step 1: Confirm the branch state before touching the remote**

```bash
cd ~/Workspaces/robertdev/onyx/onyx-vue
git rev-list --left-right --count origin/master...feat/console-preset
git status --short
```

Expected: `0	20` (zero behind, twenty ahead — nineteen plus the spec commit `9cb85d6`) and empty status. If it is behind, stop: rebase is a decision for a human, not a step in this plan.

- [ ] **Step 2: Run the full suite on the branch as it stands**

```bash
npx vitest run
npm run typecheck
```

Expected: 24 files, 379 tests passed; typecheck clean. If either fails, stop and report — this is the baseline the whole effort is measured against.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin feat/console-preset
```

- [ ] **Step 4: Open the pull request**

```bash
gh pr create --base master --head feat/console-preset \
  --title "feat: preset console, sitio de documentacion y docs-model" \
  --body "$(cat <<'EOF'
Veinte commits que llevaban sin empujarse.

- `feat(styles)`: el preset `console` — el look del svc-dashboard como tema
  seleccionable, un remapeo de tokens que no toca ningun componente.
- `feat(docs)`: el sitio de la galeria, servido en https://onyx.local.com.
- `feat(docs-model)`: los metadatos de documentacion viven junto a cada
  componente y una plantilla generica los pinta, como en la libreria de
  Angular. Antes habia 7 paginas escritas a mano para 22 componentes; ahora
  anadir un componente anade su pagina.
- `feat(input)`: `focus()` y `select()` expuestos.
- `feat(button)`: variante `danger`.
- `feat(data-table)`: modo `plain`.
- `docs(specs)`: el diseno de los componentes del preset console.

Base de todo lo que viene despues: las seis tandas de componentes salen de
`master` una vez esto entre.
EOF
)"
```

- [ ] **Step 5: Stop and hand back**

Do not merge. Report the pull request URL and wait — merging is the human's call.

- [ ] **Step 6: After the human merges, branch batch 1 off master**

```bash
git checkout master && git pull && git checkout -b feat/console-atoms
```
