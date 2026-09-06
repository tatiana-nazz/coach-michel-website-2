import { expect, test } from '@playwright/test';

test('public home links to real public and access pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Progress,');
  await page.getByRole('link', { name: 'Find your next step' }).first().click();
  await expect(page).toHaveURL(/\/next-steps$/);
  await page.getByRole('link', { name: 'Go to member access' }).click();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});

test('authentication failure is visible without provider-specific details', async ({ page }) => {
  await page.route('**/access/session', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: 'qa@example.com',
      password: 'not-a-live-credential',
    });
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED_OR_INVALID' } }),
    });
  });
  await page.goto('/access');
  await page.getByLabel('Email address').fill('qa@example.com');
  await page.getByLabel('Password', { exact: true }).fill('not-a-live-credential');
  await page.getByRole('button', { name: 'Enter your workspace' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText(
    'Check your email and password',
  );
  await expect(page.locator('body')).not.toContainText('invalid_credentials');
  await expect(page.locator('body')).not.toContainText('Supabase');
});

test('Arabic language persists through navigation with LTR email input', async ({ page }) => {
  await page.goto('/access');
  await page.getByRole('link', { name: 'العربية', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByLabel('البريد الإلكتروني')).toHaveAttribute('dir', 'ltr');
  await page.getByRole('link', { name: 'تحتاج مساعدة في الدخول؟' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
});

test('mobile navigation opens and the page stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Menu', { exact: true }).filter({ visible: true }).first().click();
  await page.locator('details nav').getByRole('link', { name: 'Training guide' }).click();
  await expect(page).toHaveURL(/\/guidance$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
