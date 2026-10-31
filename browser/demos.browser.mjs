import { test, expect } from 'playwright/test';

// jsdom cannot compute stacking, hit targets or layout. Run against the real
// docs demos in Chromium so these assertions cover the rendered CSS as well.
test('Select options stay above the dialog and can each be selected', async ({ page }) => {
  await openDialog(page);
  for (const [name, labels] of [
    ['State', ['Open', 'Done', 'Dropped', 'Parked']],
    ['Result', ['Pending', 'Won', 'Lost']],
  ]) {
    const trigger = page.getByRole('combobox', { name, exact: true });
    for (const label of labels) {
      await trigger.click();
      const options = page.getByRole('listbox').getByRole('option');
      await expect(options).toHaveCount(labels.length);
      for (const option of await options.all()) {
        await expect.poll(() => option.evaluate(el => {
          const r = el.getBoundingClientRect();
          return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el;
        }), { message: `${name}: every option must receive hits at its centre` }).toBe(true);
      }
      const option = page.getByRole('listbox').getByRole('option', { name: label, exact: true });
      const box = await option.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page.getByRole('listbox')).toHaveCount(0);
      await expect(trigger).toHaveText(new RegExp(label));
      await expect(page.getByRole('dialog')).toBeVisible();
      await trigger.click();
      await expect(page.getByRole('listbox').getByRole('option', { name: label, exact: true })).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('Escape');
    }
  }
});

async function openDialog(page) {
  await page.goto('/components/select');
  await page.getByRole('region', { name: 'Inside a dialog', exact: true })
    .getByRole('button', { name: 'Edit row', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('Select outside click and Escape dismiss only the intended layer', async ({ page }) => {
  await openDialog(page);
  const trigger = page.getByRole('combobox', { name: 'State', exact: true });
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  // Outside both overlays: a real pointer click exercises their stacking.
  await page.mouse.click(5, 5);
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Checkbox boxes keep their token size and align with the first label line at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/components/checkbox');
  const demo = page.getByRole('region', { name: 'Long labels in a narrow column', exact: true });
  await demo.scrollIntoViewIfNeeded();
  const boxes = demo.getByRole('checkbox');
  await expect(boxes).toHaveCount(4);
  const measurements = await boxes.evaluateAll(elements => elements.map(el => {
    const label = el.closest('.ui-checkbox__wrap').querySelector('.ui-checkbox__label');
    const root = el.closest('.ui-checkbox');
    const variant = root.classList.contains('ui-checkbox--lg') ? '-lg'
      : root.classList.contains('ui-checkbox--sm') ? '-sm' : '';
    // Resolve the public size token through CSS (tokens can use rem or calc).
    const probe = document.createElement('span');
    probe.style.cssText = `position: absolute; width: var(--ui-checkbox-size${variant}); height: 0`;
    el.parentElement.append(probe);
    const expectedSize = probe.getBoundingClientRect().width;
    probe.remove();
    const box = el.getBoundingClientRect();
    const text = label.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
    return { label: label.textContent, width: box.width, height: box.height,
      expectedSize, offset: Math.abs(box.y + box.height / 2 - (text.y + lineHeight / 2)),
      wraps: text.height > lineHeight * 1.5 };
  }));
  expect(measurements.filter(m => m.wraps).length).toBeGreaterThanOrEqual(2);
  for (const m of measurements) {
    expect(m.expectedSize).toBeGreaterThan(0);
    expect(Math.abs(m.width - m.expectedSize), `${m.label}: width`).toBeLessThanOrEqual(0.1);
    expect(Math.abs(m.height - m.expectedSize), `${m.label}: height`).toBeLessThanOrEqual(0.1);
    expect(m.offset, `${m.label}: first-line centre`).toBeLessThanOrEqual(1);
  }
});
