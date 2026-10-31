import { test, expect } from 'playwright/test';

// jsdom cannot measure clipping or verify that keyboard navigation scrolls.
for (const theme of ['light', 'dark']) {
  test(`Select scroll fades and keyboard visibility in ${theme} mode`, async ({ page }, testInfo) => {
    await page.goto('/components/select');
    await page.evaluate(dark => document.documentElement.classList.toggle('app-dark', dark), theme === 'dark');
    const trigger = page.getByRole('combobox', { name: 'Long state list', exact: true });
    await trigger.click();
    const list = page.getByRole('listbox');
    await expect(list).toHaveClass(/--more-below/);
    await expect(list).not.toHaveClass(/--more-above/);
    await list.screenshot({ path: `browser/screenshots/select-${theme}-top.png` });
    await testInfo.attach(`select-${theme}-top`, { path: `browser/screenshots/select-${theme}-top.png`, contentType: 'image/png' });
    const visibleActive = () => list.evaluate(el => {
      const option = document.getElementById(el.getAttribute('aria-activedescendant'));
      const r = option.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      return r.top >= box.top && r.bottom <= box.bottom;
    });
    await expect(list).toBeFocused();
    await page.keyboard.press('End');
    await expect(list.locator('.ui-select__option--active')).toHaveText('Waiting');
    await expect.poll(visibleActive).toBe(true);
    await expect(list).toHaveClass(/--more-above/);
    await expect(list).not.toHaveClass(/--more-below/);
    await list.screenshot({ path: `browser/screenshots/select-${theme}-bottom.png` });
    await page.keyboard.press('Home');
    await page.keyboard.type('un');
    await expect(list.locator('.ui-select__option--active')).toHaveText('Única');
    await expect.poll(visibleActive).toBe(true);
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Tool', exact: true }).click();
    await expect(list).not.toHaveClass(/--more-/);
  });
}
