import { test, expect } from 'playwright/test';

// jsdom cannot measure the intrinsic panel or prove that focusing it avoids a
// page scroll. Exercise the shared two-pass positioning in the real browser.
test('Menu clamps and flips at the viewport edge and restores focus', async ({ page }) => {
  await page.goto('/components/menu');
  const trigger = page.getByRole('region', { name: 'Basic', exact: true }).getByRole('button', { name: 'Actions', exact: true });
  await trigger.evaluate(el => {
    Object.assign(el.style, { position: 'fixed', right: '8px', bottom: '8px' });
  });
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem').first()).toBeFocused();
  const before = await page.evaluate(() => window.scrollY);
  await expect.poll(async () => {
    const r = await menu.boundingBox();
    const t = await trigger.boundingBox();
    return r.x >= 8 && r.x + r.width <= 1272 && r.y + r.height <= t.y;
  }).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});
