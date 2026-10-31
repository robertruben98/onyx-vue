import { test, expect } from 'playwright/test';

// The tooltip host is `display: contents` (it must not change the layout of
// what it wraps), so it has no box of its own: measuring it gives 0 × 0 at the
// page origin, and the tooltip was painted in the top-left corner of the page
// instead of next to its trigger. Only a real browser computes that geometry.
const GAP = 1.5;

for (const placement of ['top', 'bottom', 'left', 'right']) {
  test(`Tooltip ${placement} sits next to its trigger and describes it`, async ({ page }) => {
    await page.goto('/components/tooltip');
    const demo = page.getByRole('region', { name: 'Placements', exact: true });
    const button = demo.getByRole('button', { name: placement, exact: true });
    await button.scrollIntoViewIfNeeded();
    await button.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible();
    // The focusable control is what a screen reader announces, not the wrapper.
    await expect(button).toHaveAttribute('aria-describedby', await tip.getAttribute('id'));
    const t = await button.boundingBox();
    const r = await tip.boundingBox();
    const midX = (b) => b.x + b.width / 2;
    const midY = (b) => b.y + b.height / 2;
    if (placement === 'top' || placement === 'bottom') {
      expect(Math.abs(midX(r) - midX(t)), 'centred horizontally').toBeLessThanOrEqual(GAP);
      if (placement === 'top') expect(t.y - (r.y + r.height)).toBeGreaterThanOrEqual(-GAP);
      else expect(r.y - (t.y + t.height)).toBeGreaterThanOrEqual(-GAP);
      expect(Math.min(Math.abs(t.y - (r.y + r.height)), Math.abs(r.y - (t.y + t.height))), 'touching the trigger').toBeLessThanOrEqual(12);
    } else {
      expect(Math.abs(midY(r) - midY(t)), 'centred vertically').toBeLessThanOrEqual(GAP);
      const gap = placement === 'left' ? t.x - (r.x + r.width) : r.x - (t.x + t.width);
      expect(gap, 'beside the trigger').toBeGreaterThanOrEqual(-GAP);
      expect(gap, 'touching the trigger').toBeLessThanOrEqual(12);
    }
    await page.mouse.move(1, 1);
    await expect(tip).toHaveCount(0);
    await expect(button).not.toHaveAttribute('aria-describedby', /.+/);
  });
}
