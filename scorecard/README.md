# Scorecard

`npm run score` measures the library on eight aspects and writes
[`SCORECARD.md`](../SCORECARD.md). Each aspect is a number from 0 to 100 that
is computed, not judged: the same source gives the same score. The bar is
**above 90 on every aspect**; the script exits with 1 while any aspect is at or
below it.

`npm run score -- --quick` reuses the last coverage and browser runs, for fast
iteration on the static aspects.

| Aspect | How it is measured | Score |
|---|---|---|
| Accessibility | axe-core in Chromium, every rule including colour contrast, over the demos of every component page (`.demo__preview`, not the docs chrome), once per theme: default, dark, acme, console, matrix. | Mean over component × theme runs of `100 − 20 × serious/critical rules − 5 × moderate/minor rules`, floored at 0. |
| Test coverage | The full test suite under V8 coverage, over `src/**` minus tests and `*.docs.ts`. | Mean of statement, branch and function coverage. |
| Documentation | The compiled components' real props, events and slots against the API table of the docs page that imports them. | 85 % share of documented items + 15 % share of exports that appear on a docs page. |
| Theming & tokens | Component stylesheets use no raw colours and no undefined `--ui-*` token; presets only override tokens that exist (or their own `--ui-<preset>-*` primitives). | Share of checks that pass. |
| Responsive | Every component page at 360, 768 and 1280 px and every pattern at 640, 1000 and 1440 px, looking for sideways page scroll or content spilling out of its box (scroll containers and positioned layers excluded). | Share of page × width runs with nothing spilling. |
| API consistency | Controls forward attributes to their native element; events are past tense or `update:*` (a renamed event may stay as a deprecated alias in `src/deprecations.ts` while its new name is also emitted); `size` is `sm \| md \| lg`; `tone` uses `neutral \| info \| success \| warning \| danger \| muted`. | Share of checks that pass. |
| Component catalogue | A fixed list of 50 components an application UI kit is expected to ship (`CATALOG` in `score.mjs`). An entry counts when the component exists, has tests and is on a docs page. | Share of entries that count. |
| Packaging & DX | Type declarations built and exported, preset stylesheets exported, library and docs builds pass, `vue-tsc` passes, no `any`, README and CHANGELOG coverage, package metadata, `sideEffects`, and this script. | Share of checks that pass. |

The measuring code lives here: `introspect.score.ts` and `forwarding.score.ts`
run under vitest (they need the compiled components), `browser.mjs` drives
Chromium over the built docs, `score.mjs` turns the measurements into scores
and `run.mjs` runs everything.

## Browser regression tests

The separate `browser` CI job runs the docs interaction tests on every pull
request in headless Chromium. To run the same gate locally (Node 22):

```sh
npm ci
npm ci --prefix docs
npx playwright install --with-deps chromium
npm run test:browser
```

The command builds the docs from current library source, starts a private Vite
preview server on `127.0.0.1:4173`, and stops it when the tests finish. Keep that
port free. No prebuilt docs or manually started server is needed.

`browser/demos.browser.mjs` exercises the Select “Inside a dialog” demo
(option centre hit-testing and selection, outside click, two-stage Escape) and
the Checkbox “Long labels in a narrow column” demo at 390 px (token dimensions
and first-line alignment within 1 px). These checks need a real browser:
jsdom cannot calculate stacking, hit targets or layout. Add further demo
regressions in `browser/*.browser.mjs`; they run separately from Vitest.

The suite has a four-minute global timeout, no retries, and a five-minute CI
job limit. To focus on a component, run `npm run test:browser -- --grep Select`.
Failures save screenshots and Playwright traces to `test-results/`; CI uploads
that directory as `browser-failures` for seven days. Inspect a trace with
`npx playwright show-trace test-results/<test-directory>/trace.zip`.
