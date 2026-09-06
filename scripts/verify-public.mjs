import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import next from 'next';
import { chromium as playwright } from '@playwright/test';
const chromium = process.env.CMH_CHROMIUM_MODULE
  ? (await import(process.env.CMH_CHROMIUM_MODULE)).default
  : undefined;
const output = process.env.CMH_BROWSER_EVIDENCE_DIR ?? 'test-results/public-browser';
await fs.mkdir(output, { recursive: true });
(async () => {
  const app = next({ dev: false, hostname: '127.0.0.1', port: 3100 });
  await app.prepare();
  const server = http.createServer(app.getRequestHandler());
  await new Promise((resolve) => server.listen(3100, '127.0.0.1', resolve));
  let browser;
  try {
    console.log('HTTP:', (await fetch('http://127.0.0.1:3100')).status);
    browser = await playwright.launch(
      chromium
        ? {
            args: chromium.args.filter(
              (arg) =>
                !['--disable-web-security', '--allow-running-insecure-content'].includes(arg),
            ),
            executablePath: await chromium.executablePath(),
            headless: true,
          }
        : { headless: true },
    );
    const report = process.env.CMH_INTERACTIONS_ONLY
      ? JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8'))
      : { checks: [], errors: [], interactions: [] };
    report.interactions = [];
    const viewports = [
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
    ];
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    for (const locale of process.env.CMH_INTERACTIONS_ONLY ? [] : ['en', 'ar']) {
      if (locale === 'ar')
        await context.addCookies([
          { name: 'cmh-locale', value: 'ar', domain: '127.0.0.1', path: '/' },
        ]);
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        for (const route of [
          '/',
          '/about',
          '/guidance',
          '/disclosures',
          '/next-steps',
          '/access',
          '/access/recovery',
          '/access/provisioning',
        ]) {
          const response = await page.goto('http://127.0.0.1:3100' + route, {
            waitUntil: 'networkidle',
          });
          const check = {
            locale,
            viewport: viewport.width,
            route,
            status: response.status(),
            heading: await page.locator('h1').count(),
            overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          };
          report.checks.push(check);
          if (check.status !== 200 || check.heading !== 1 || check.overflow)
            throw new Error(JSON.stringify(check));
          if ((route === '/' || route === '/access') && [390, 1440].includes(viewport.width))
            await page.screenshot({
              path: path.join(
                output,
                `${locale}-${route === '/' ? 'home' : 'access'}-${viewport.width}.png`,
              ),
              fullPage: true,
            });
        }
      }
      await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    }
    await context.addCookies([{ name: 'cmh-locale', value: 'en', domain: '127.0.0.1', path: '/' }]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:3100');
    await page.locator('details summary').click();
    await page
      .locator('details nav')
      .getByRole('link', { name: 'Training guide', exact: true })
      .click();
    await page.waitForURL('**/guidance');
    if (!page.url().endsWith('/guidance')) throw Error('Mobile navigation failed');
    report.interactions.push('mobile navigation');
    await page.goto('http://127.0.0.1:3100/access');
    await page.route('**/access/session', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED_OR_INVALID' } }),
      }),
    );
    await page.getByLabel('Email address').fill('qa@example.com');
    await page.getByLabel('Password', { exact: true }).fill('not-a-live-credential');
    await page.getByRole('button', { name: 'Enter your workspace' }).click();
    const signInError = page.locator('form').getByRole('alert');
    await signInError.waitFor();
    if (!(await signInError.innerText()).includes('Check your email and password'))
      throw Error(`Error message failed: ${await signInError.innerText()}`);
    report.interactions.push('sign-in error with mocked response');
    await page.getByRole('link', { name: 'العربية', exact: true }).click();
    await page.locator('html[dir="rtl"]').waitFor();
    if ((await page.locator('html').getAttribute('dir')) !== 'rtl') throw Error('RTL failed');
    report.interactions.push('locale switching');
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify({
        checks: report.checks.length,
        errors: report.errors,
        interactions: report.interactions,
      }),
    );
  } finally {
    if (browser) await browser.close();
    server.close();
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
