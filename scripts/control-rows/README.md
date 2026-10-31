Run `node scripts/control-rows/verify.mjs` after `npm ci` and `npx playwright install chromium`.
The script starts and closes its own Vite server and Chromium browser. No build or
separate background server is required.

The fixture mounts real Vue components with base tokens, Arial 16px/1.5, and
border-box sizing, at a 390px viewport and column width. Long labels grow naturally
until they occupy three lines. Measurements check token width/height and compare
the control centre with the first line box centre (tolerance 1px). It covers all
Checkbox sizes, Radio, Switch, and every CheckRow state in normal and dense modes.
jsdom cannot perform these layout assertions.

`one-line-baseline.json` was captured **before the fix**, from master commit
`e6fa229c57d62b9a266a4fcdf99fa6cc2e5aa6d1`, with Chromium 156.0.8078.4.
It records one-line and unlabelled control dimensions and vertical offsets, plus
label offsets. The verification allows 0.1px rounding tolerance against that
baseline. `--baseline` deliberately replaces it; only use that option when
establishing a new, independently reviewed baseline.

Before the fix, radio width was 13px instead of 20px; Radio, Switch, and all
CheckRow variants had 24px first-line centre error. After the fix all 13 wrapped
cases have exact token dimensions and 0px error; all 26 one-line/bare cases match.
