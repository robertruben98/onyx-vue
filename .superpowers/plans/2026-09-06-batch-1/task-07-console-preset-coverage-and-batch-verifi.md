### Task 7: Console preset coverage and batch verification

Five new token families landed in `tokens.css`. The console preset inherits them from the default theme unless it is told otherwise, and a token inherited from a light theme renders as a light element in the middle of a black console — a failure that no unit test catches and that looks like a styling accident rather than a missing remap.

**Files:**
- Modify: `src/styles/console.css`
- Modify: `src/styles/console.test.ts`

**Interfaces:**
- Consumes: every token added in tasks 1–6.
- Produces: a console preset that covers the batch; no exported symbols.

- [ ] **Step 1: Check what the preset is missing**

```bash
cd ~/Workspaces/robertdev/onyx/onyx-vue
comm -23 \
  <(grep -oE '^\s*--ui-(status-dot|severity-badge|tri-state-count|relative-time|truncate|tag)-[a-z-]+' src/styles/tokens.css | tr -d ' ' | sort -u) \
  <(grep -oE '^\s*--ui-(status-dot|severity-badge|tri-state-count|relative-time|truncate|tag)-[a-z-]+' src/styles/console.css | tr -d ' ' | sort -u)
```

Expected: the full list of new tokens, since `console.css` has none of them yet.

- [ ] **Step 2: Write the failing guard**

Add to `src/styles/console.test.ts`, inside the existing `describe("console preset")` block:

```ts
  it("remaps the state tokens the console look depends on", () => {
    // Los atomos de estado son el vocabulario de la consola: si el preset se
    // deja uno, hereda el valor del tema claro y saca un elemento claro en
    // mitad de una pagina negra. No falla, que es lo peor que puede hacer.
    const exigidos = [
      "--ui-status-dot-off",
      "--ui-status-dot-unknown",
      "--ui-severity-badge-critical-bg",
      "--ui-severity-badge-high-bg",
      "--ui-tri-state-count-quiet",
      "--ui-relative-time-color",
      "--ui-tag-muted-bg",
      "--ui-tag-muted-text",
    ];
    const faltan = exigidos.filter((t) => !assigned(console_).has(t));
    expect(faltan).toEqual([]);
  });
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/styles/console.test.ts`
Expected: FAIL, listing all eight tokens.

- [ ] **Step 4: Remap them in the preset**

Append to the `.ui-theme-console` block of `src/styles/console.css`, in a new commented group following the file's existing style:

```css
  /* --- atomos de estado --------------------------------------------------- */
  /* La consola apaga por contraste, no por opacidad: un token de "apagado"
     resuelto contra el tema claro sale mas claro que el fondo negro, que es
     exactamente lo contrario de apagado. */
  --ui-status-dot-off: var(--ui-slate-600);
  --ui-status-dot-unknown: var(--ui-slate-700);

  /* `critical` es el unico relleno solido y aqui tiene que seguir siendolo:
     sobre negro, una superficie tenue de peligro y una de aviso se parecen
     demasiado para ordenar por gravedad de un vistazo. */
  --ui-severity-badge-critical-bg: var(--ui-red-600);
  --ui-severity-badge-critical-text: var(--ui-white);
  --ui-severity-badge-high-bg: transparent;
  --ui-severity-badge-high-text: var(--ui-red-400);
  --ui-severity-badge-moderate-bg: transparent;
  --ui-severity-badge-moderate-text: var(--ui-amber-400);
  --ui-severity-badge-low-bg: transparent;
  --ui-severity-badge-low-text: var(--ui-blue-400);
  --ui-severity-badge-unknown-bg: transparent;
  --ui-severity-badge-unknown-text: var(--ui-slate-400);

  --ui-tri-state-count-quiet: var(--ui-slate-600);
  --ui-relative-time-color: var(--ui-slate-400);

  --ui-tag-muted-bg: transparent;
  --ui-tag-muted-text: var(--ui-slate-500);
```

- [ ] **Step 5: Run the style tests and watch them pass**

Run: `npx vitest run src/styles/console.test.ts`
Expected: PASS, including the pre-existing assertion that console covers every semantic token dark remaps.

- [ ] **Step 6: Run the whole suite and typecheck**

```bash
npx vitest run
npm run typecheck
```

Expected: 29 files, 476 tests passed; typecheck clean.

- [ ] **Step 7: Verify the gallery renders all five new pages**

The docs site is a systemd user unit serving the Vite dev server; it reads this
working tree, so no build is needed.

**Restart the unit first — this is not optional.** `docs/src/registry.ts` finds
component pages with `import.meta.glob("../../src/components/*/*.docs.ts")`, and
that path is **outside the Vite root** (`docs/`). Vite's watcher does not notice
directories added there while the server runs, so a running gallery keeps serving
the component list it booted with. Measured during this batch: with four new
components on disk, all tests green and the site answering `200`, the transformed
registry module still listed **22** docs — the new pages were simply absent, with
nothing anywhere reporting a problem. After `systemctl --user restart onyx-docs`
it listed 26. A green unit and a `200` are not evidence the gallery is current.

```bash
systemctl --user restart onyx-docs && sleep 4
```

```bash
systemctl --user status onyx-docs --no-pager
curl -sS -o /dev/null -w '%{http_code}\n' https://onyx.local.com/
```

Expected: `active (running)` and `200`. A `502` means the unit is dead, not that Caddy is misconfigured; a `000` means the URL was never reached and is not a pass.

Then open <https://onyx.local.com> and confirm the sidebar lists **Relative Time**, **Severity Badge**, **Status Dot**, **Tri-State Count** and **Truncate**, that each page renders its demos, and that switching the preset selector to `console` restyles them. Each page exists only because its `*.docs.ts` was written; a missing page means a missing metadata file, not a routing bug.

- [ ] **Step 8: Commit**

```bash
git add src/styles/console.css src/styles/console.test.ts
git commit -m "feat(styles): el preset console cubre los atomos de estado"
```

- [ ] **Step 9: Open the batch pull request**

```bash
git push -u origin feat/console-atoms
gh pr create --base master --head feat/console-atoms \
  --title "feat: atomos de estado del preset console" \
  --body "$(cat <<'EOF'
Tanda 1 de seis. Cinco componentes nuevos y una variante, extraidos de
`/prs/` y de la version a mano de `control-panel/web`.

- `UiStatusDot` — punto de estado que nunca depende solo del color.
- `UiSeverityBadge` — la escala de severidad, con `severityRank()` para que
  todos ordenen por la misma y nadie copie el mapa.
- `UiTriStateCount` — un numero, o la razon de que no lo haya: `0` es un
  hecho, `·` es que el dato viaja, `—` es que nadie lo ha pedido.
- `UiRelativeTime` — edad compacta con la fecha absoluta en el `title`. El
  original comparaba la cadena renderizada, asi que `3d` era viejo y `1mes`
  no; este compara la edad.
- `UiTruncate` — elipsis con el texto completo en el `title` y el
  `min-width: 0` sin el cual nunca aparece la elipsis dentro de una rejilla.
- `UiTag` gana `muted`, para lo que una fila ES y no para lo que avisa.

De 22 componentes a 27. El preset `console` los cubre y el test de estilos
lo exige. Esta tanda no retira nada del consumidor: es vocabulario que la
app no tenia.
EOF
)"
```

Report the URL and stop. Merging is the human's call.
