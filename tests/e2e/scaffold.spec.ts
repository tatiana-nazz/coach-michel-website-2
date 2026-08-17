import { expect, test } from '@playwright/test';

const qaSurface = 'main[data-qa-handoff-surface="SCR-ACC-001"]';
const accessScreen = 'section[data-screen-id="SCR-ACC-001"]';

test('root temporary QA handoff surface exposes SCR-ACC-001 credentials', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator(qaSurface)).toBeVisible();
  await expect(page.locator(qaSurface)).toHaveAttribute('data-qa-handoff-purpose', 'temporary');
  await expect(page.locator(accessScreen)).toBeVisible();
  await expect(page.getByText('Temporary QA handoff · SCR-ACC-001')).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('governed authentication failure maps to the existing UI without provider detail', async ({
  page,
}) => {
  await page.route('**/access/session', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      email: 'qa@example.com',
      password: 'not-a-live-credential',
    });

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'private, no-store' },
      body: JSON.stringify({
        error: { code: 'AUTHENTICATION_REQUIRED_OR_INVALID' },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Email address').fill('qa@example.com');
  await page.getByLabel('Password').fill('not-a-live-credential');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'Private access could not be established with those credentials.',
  );
  await expect(page.locator('body')).not.toContainText('invalid_credentials');
  await expect(page.locator('body')).not.toContainText('Supabase');
});

test('Arabic QA state is RTL while credential input remains LTR', async ({ page }) => {
  await page.goto('/');
  await page.locator('select[name="locale"]').selectOption('ar');

  await expect(page.locator(accessScreen)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(accessScreen)).toHaveAttribute('lang', 'ar');
  await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible();
  await expect(page.getByLabel('البريد الإلكتروني')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByLabel('كلمة المرور')).toBeVisible();
});
