import { expect, test } from '@playwright/test';

test('minimal non-product shell renders without governed product routes', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main[data-stage="P4-S04"]')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-product-features', 'none');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Implementation scaffold');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('scaffold has a visible keyboard focus treatment', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.textContent = 'Focus probe';
    document.querySelector('main')?.append(button);
  });
  await page.getByRole('button', { name: 'Focus probe' }).focus();

  const outlineWidth = await page.getByRole('button', { name: 'Focus probe' }).evaluate((node) => {
    return window.getComputedStyle(node).outlineWidth;
  });

  expect(outlineWidth).toBe('2px');
});
