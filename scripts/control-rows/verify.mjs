// jsdom cannot measure layout. Run real Vue components in Chromium at 390px.
import { chromium } from 'playwright';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const baselinePath = new URL('./one-line-baseline.json', import.meta.url);
const server = await createServer({ configFile: false, plugins: [vue()], server: { port: 0 } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${server.resolvedUrls.local[0]}scripts/control-rows/index.html`);
  await page.waitForSelector('.ui-switch');
  const measurements = await page.evaluate(() => [...document.querySelectorAll('.sample')].map(sample => {
    const control = sample.querySelector('.ui-checkbox__el, .ui-radio__el, .ui-switch__control, .ui-check-row__state > *');
    const label = sample.querySelector('.ui-checkbox__label, .ui-radio__label, .ui-switch__label, .ui-check-row__name');
    // Extend naturally wrapping text until exactly three line boxes are present.
    if (sample.id.endsWith('-long')) {
      label.textContent = 'Review';
      for (let words = 0; words < 100 && label.getBoundingClientRect().height < parseFloat(getComputedStyle(label).lineHeight) * 2.9; words++) label.textContent += ' settings';
    }
    const box = control.getBoundingClientRect();
    const row = sample.getBoundingClientRect();
    const text = label?.getBoundingClientRect();
    const line = label ? parseFloat(getComputedStyle(label).lineHeight) : 0;
    const token = name => {
      const probe = document.createElement('span');
      probe.style.cssText = `position:absolute;width:var(${name});`;
      control.parentElement.append(probe);
      const size = probe.getBoundingClientRect().width;
      probe.remove();
      return size;
    };
    const id = sample.id;
    const widthToken = id.startsWith('checkbox') ? `--ui-checkbox-size${id.includes('-md-') ? '' : id.includes('-sm-') ? '-sm' : '-lg'}` : id.startsWith('radio') ? '--ui-radio-size' : id.startsWith('switch') ? '--ui-switch-track-width' : id.includes('running') ? '--ui-spinner-size-sm' : '--ui-status-dot-size';
    return { id, width: box.width, height: box.height, top: box.top - row.top, labelTop: text ? text.top - row.top : null, line, lines: text ? text.height / line : 0, delta: text ? box.top + box.height / 2 - (text.top + line / 2) : 0, expectedWidth: token(widthToken), expectedHeight: token(id.startsWith('switch') ? '--ui-switch-track-height' : widthToken) };
  }));
  const stable = measurements.filter(m => !m.id.endsWith('-long')).map(({ id, width, height, top, labelTop }) => ({ id, width, height, top, labelTop }));
  if (process.argv.includes('--baseline')) {
    writeFileSync(baselinePath, JSON.stringify(stable, null, 2) + '\n');
    console.log('Captured master one-line and unlabelled offsets.');
  } else {
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    const failures = [];
    for (const m of measurements.filter(m => m.id.endsWith('-long'))) {
      console.log(JSON.stringify(m));
      if (Math.abs(m.width - m.expectedWidth) > 0.1 || Math.abs(m.height - m.expectedHeight) > 0.1 || Math.abs(m.delta) > 1 || Math.abs(m.lines - 3) > 0.01) failures.push(m.id);
    }
    for (const [i, m] of stable.entries()) {
      for (const key of ['width', 'height', 'top', 'labelTop']) if (Math.abs(m[key] - baseline[i][key]) > 0.1) failures.push(`${m.id}: ${key} changed from ${baseline[i][key]} to ${m[key]}`);
    }
    assert.deepEqual(failures, [], 'Wrapped dimensions/alignment and unchanged one-line/bare offsets');
    console.log(`PASS: ${measurements.length} cases; three-line token sizes, centre error <=1px, unchanged one-line/bare offsets.`);
  }
} finally { await browser?.close(); await server.close(); }
