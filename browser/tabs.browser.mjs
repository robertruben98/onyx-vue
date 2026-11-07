import { test, expect } from 'playwright/test';

// jsdom has no layout: it cannot tell that a visually hidden description left the scrolling row.
test('Warn tabs in a 360 px scrolling list do not widen the document', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/components/tabs');
  const demo = page.locator('[data-demo="tabs-warn-scroll"]');
  await expect(demo.getByRole('tab')).toHaveCount(4);
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  // The hidden descriptions must be positioned against something INSIDE the
  // scrolling list: against anything outside it nothing clips them, and they are
  // what widened the page.
  const escaped = await demo.evaluate(root => {
    const list = root.querySelector('.ui-tabs__list');
    return [...root.querySelectorAll('.ui-tabs__sr-only')]
      .filter(el => !list.contains(el.offsetParent)).length;
  });
  expect(escaped).toBe(0);
  // The warning is still the trigger's description: aria-describedby points at the
  // hidden span inside the trigger, and the text is in the DOM.
  const wired = await demo.getByRole('tab').first().evaluate(el => {
    const span = el.querySelector('.ui-tabs__sr-only');
    return { same: el.getAttribute('aria-describedby') === span.id, text: span.textContent };
  });
  expect(wired).toEqual({ same: true, text: '2 packages are stuck in this tray' });
});
