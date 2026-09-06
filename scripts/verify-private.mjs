/** Real Next/Chromium presentation checks with an isolated synthetic provider. Never a live auth/RLS test. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import next from 'next';
import { chromium as playwright } from '@playwright/test';
import {
  createFixtureProvider,
  fixtureSession,
} from '../tests/fixtures/private-browser/provider.mjs';

const output = process.env.CMH_PRIVATE_EVIDENCE_DIR ?? 'test-results/private-presentation';
await fs.mkdir(output, { recursive: true });
const envText = await fs.readFile('.env.local', 'utf8');
const providerUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  envText.match(/^NEXT_PUBLIC_SUPABASE_URL=["']?([^\s"']+)/m)?.[1];
if (!providerUrl)
  throw Error(
    'A configured provider URL is required to intercept the exact compiled provider host.',
  );
const providerHost = new URL(providerUrl).hostname;
const adapter = createFixtureProvider({ providerHost });
const originalFetch = globalThis.fetch;
globalThis.fetch = adapter.fetch;
const chromium = process.env.CMH_CHROMIUM_MODULE
  ? (await import(process.env.CMH_CHROMIUM_MODULE)).default
  : undefined;
const report = {
  scope:
    'LOCAL SYNTHETIC PRESENTATION FIXTURES. This is not live authentication, RLS, persistence, or a real user workflow test.',
  checks: [],
  errors: [],
  consoleErrors: [],
  blockedOutbound: [],
  contrastFailures: [],
  unexpectedProviderRequests: [],
  syntheticPermissionCalls: [],
  providerRequests: 0,
};
const allRoutes = {
  trainee: [
    '/trainee/today',
    '/trainee/sessions',
    '/trainee/sessions/fixture-schedule/sequence',
    '/trainee/sessions/fixture-schedule/exercises/fixture-exercise-1',
    '/trainee/sessions/fixture-schedule/completion',
    '/trainee/completions/fixture-schedule',
    '/trainee/completions/fixture-completion',
    '/trainee/completions/fixture-pending-schedule',
    '/trainee/sessions/fixture-confirmed-schedule/sequence',
    '/trainee/account',
    '/trainee/support',
  ],
  coach: [
    '/coach',
    '/coach/trainees',
    '/coach/trainees/fixture-trainee',
    '/coach/programs-sessions',
    '/coach/sessions/fixture-session/prepare',
    '/coach/exercises',
    '/coach/schedule-release',
    '/coach/completions',
    '/coach/reconciliation/fixture-case',
    '/coach/admin',
  ],
  ops: [
    '/ops/incidents',
    '/ops/recovery/fixture-incident',
    '/ops/recovery/fixture-recovery/validation',
    '/ops/reconciliation/fixture-validation',
  ],
};
const port = Number(process.env.CMH_PRIVATE_TEST_PORT ?? 3101);
const app = next({ dev: false, hostname: '127.0.0.1', port });
let server;
let browser;
try {
  await app.prepare();
  server = http.createServer(app.getRequestHandler());
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  browser = await playwright.launch(
    chromium
      ? {
          args: chromium.args.filter(
            (arg) => !['--disable-web-security', '--allow-running-insecure-content'].includes(arg),
          ),
          executablePath: await chromium.executablePath(),
          headless: true,
        }
      : { headless: true },
  );
  const context = await browser.newContext();
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push({ url: page.url(), message: error.message }));
  page.on('console', (message) => {
    if (message.type() === 'error')
      report.consoleErrors.push({ url: page.url(), message: message.text() });
  });
  for (const [area, areaRoutes] of Object.entries(allRoutes)) {
    const selectedRoutes = process.env.CMH_PRIVATE_ROUTES?.split(',');
    const routes = selectedRoutes
      ? areaRoutes.filter((route) => selectedRoutes.includes(route))
      : areaRoutes;
    if (!routes.length) continue;
    adapter.setArea(area);
    await context.clearCookies();
    const session = fixtureSession(area);
    const cookie = `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`;
    await context.addCookies([
      {
        name: `sb-${providerHost.split('.')[0]}-auth-token`,
        value: cookie,
        domain: '127.0.0.1',
        path: '/',
      },
    ]);
    for (const locale of ['en', 'ar']) {
      await context.addCookies([
        { name: 'cmh-locale', value: locale, domain: '127.0.0.1', path: '/' },
      ]);
      for (const viewport of [
        { width: 390, height: 844 },
        { width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        for (const route of routes) {
          const response = await page.goto(`http://127.0.0.1:${port}${route}`, {
            waitUntil: 'networkidle',
          });
          if (adapter.unexpected.length)
            throw Error(`Unhandled fixture request: ${adapter.unexpected.join('; ')}`);
          const check = {
            area,
            locale,
            width: viewport.width,
            route,
            landed: new URL(page.url()).pathname,
            status: response.status(),
            h1: await page.locator('h1').count(),
            dir: await page.locator('html').getAttribute('dir'),
            overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          };
          if (route === '/trainee/completions/fixture-completion') {
            await page
              .getByRole('heading', {
                name: locale === 'ar' ? 'جلستك أصبحت في السجل.' : 'Your session is on the record.',
                exact: true,
              })
              .waitFor();
          }
          if (route === '/trainee/completions/fixture-pending-schedule') {
            await page
              .getByRole('heading', {
                name:
                  locale === 'ar'
                    ? 'تم الاستلام. بانتظار التأكيد.'
                    : 'Received. Awaiting confirmation.',
                exact: true,
              })
              .waitFor();
          }
          if (route === '/trainee/sessions/fixture-confirmed-schedule/sequence') {
            if (
              (await page
                .getByRole('link', { name: locale === 'ar' ? 'عرض التعليمات' : 'View guidance' })
                .count()) !== 3
            )
              throw Error('Confirmed-session guidance disappeared.');
          }
          const formAssertions = [];
          const panel = (en, ar) =>
            page.locator('section').filter({
              has: page.getByRole('heading', { name: locale === 'ar' ? ar : en, exact: true }),
            });
          const visible = async (locator, label) => {
            if (!(await locator.first().isVisible()))
              throw Error(`Missing authoring control: ${route}: ${label}`);
            formAssertions.push(label);
          };
          if (route === '/coach/programs-sessions') {
            const program = panel('Create a program', 'إنشاء برنامج');
            const session = panel('Create a session', 'إنشاء جلسة');
            await visible(program.locator('form input[name=title]'), 'Create program title');
            await visible(program.locator('form textarea[name=reason]'), 'Create program reason');
            await visible(session.locator('form input[name=title]'), 'Create session title');
            await visible(
              session.locator('form input[name=durationMinutes]'),
              'Create session duration',
            );
          }
          if (route === '/coach/exercises') {
            const exercise = panel('Create exercise guidance', 'إنشاء تعليمات تمرين');
            await visible(exercise.locator('form input[name=title]'), 'Create exercise title');
            await visible(
              exercise.locator('form textarea[name=instructions]'),
              'Exercise instructions',
            );
            await visible(exercise.locator('form select[name=locale]'), 'Exercise language');
            await page
              .locator('summary')
              .filter({ hasText: locale === 'ar' ? 'قرار النشر' : 'Publication decision' })
              .first()
              .click();
            await visible(
              page.locator('form select[name=decision]').filter({ visible: true }),
              'Exercise publication decision',
            );
          }
          if (route === '/coach/schedule-release') {
            await visible(
              page.locator('form select[name=traineeRef]'),
              'Release trainee selection',
            );
            await visible(
              page.locator('form select[name=sessionVersionRef]'),
              'Release session selection',
            );
            await visible(page.locator('form input[name=scheduledFor]'), 'Release schedule date');
            await visible(
              page.getByRole('button', {
                name: locale === 'ar' ? 'فحص معاينة الإصدار' : 'Check release preview',
                exact: true,
              }),
              'Release preview button',
            );
            if (
              !(await page.locator('select[name=traineeRef] option[value=fixture-trainee]').count())
            )
              throw Error('Synthetic trainee selection missing.');
            if (
              !(await page
                .locator('select[name=sessionVersionRef] option[value=fixture-session-v1]')
                .count())
            )
              throw Error('Synthetic session version selection missing.');
          }
          if (route === '/coach/admin') {
            const notice = panel('Create an account notice', 'إنشاء إشعار للحسابات');
            const policy = panel('Create a scheduling policy', 'إنشاء سياسة جدولة');
            await visible(notice.locator('form textarea[name=body]'), 'Create notice text');
            await visible(notice.locator('form select[name=locale]'), 'Notice language');
            if ((await notice.locator('textarea[name=body]').getAttribute('maxlength')) !== '16000')
              throw Error('Notice limit is not 16000 characters.');
            await visible(
              policy.locator('form input[name=maxAdvanceDays]'),
              'Policy scheduling horizon',
            );
            await visible(
              policy.locator('form select[name=allowPastDays]'),
              'Policy past scheduling allowance',
            );
            for (const [en, ar] of [
              ['Revise policy', 'تعديل السياسة'],
              ['Record policy decision', 'تسجيل قرار السياسة'],
              ['Revise notice', 'تعديل الإشعار'],
              ['Review publication decision', 'مراجعة قرار النشر'],
            ]) {
              const summary = page
                .locator('summary')
                .filter({ hasText: locale === 'ar' ? ar : en })
                .first();
              await visible(summary, en);
              await summary.click();
            }
            if (
              (await page.locator('form textarea[name=body]').filter({ visible: true }).count()) < 2
            )
              throw Error('Existing notice revision form is missing.');
            if (
              (await page.locator('form select[name=decision]').filter({ visible: true }).count()) <
              2
            )
              throw Error('Policy/notice independent decision forms are missing.');
            await visible(
              page.getByLabel(locale === 'ar' ? 'إجراء الصلاحية' : 'Authority action'),
              'Scoped authority action',
            );
          }
          check.formAssertions = formAssertions;
          check.overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          );
          const contrastFailures = await page.evaluate(() => {
            const rgb = (value) => {
              const values = value.match(/[\d.]+/g)?.map(Number);
              return values && values.length >= 3 && (values.length < 4 || values[3] === 1)
                ? values.slice(0, 3)
                : null;
            };
            const luminance = (channels) =>
              channels
                .map((channel) => {
                  const value = channel / 255;
                  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                })
                .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
            return [...document.querySelectorAll('a,button')].flatMap((element) => {
              const bounds = element.getBoundingClientRect();
              if (
                !bounds.width ||
                !bounds.height ||
                !element.textContent.trim() ||
                element.disabled
              )
                return [];
              const style = getComputedStyle(element);
              const foreground = rgb(style.color);
              const background = rgb(style.backgroundColor);
              if (!foreground || !background || style.backgroundImage !== 'none') return [];
              const a = luminance(foreground);
              const b = luminance(background);
              const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
              return ratio < 4.5
                ? [
                    {
                      text: element.textContent.trim(),
                      foreground: style.color,
                      background: style.backgroundColor,
                      ratio,
                    },
                  ]
                : [];
            });
          });
          report.contrastFailures.push(
            ...contrastFailures.map((failure) => ({
              route,
              locale,
              width: viewport.width,
              ...failure,
            })),
          );
          check.solidControlContrastFailures = contrastFailures.length;
          report.checks.push(check);
          if (
            contrastFailures.length > 0 ||
            check.status !== 200 ||
            check.h1 !== 1 ||
            check.overflow ||
            check.landed !== route ||
            check.dir !== (locale === 'ar' ? 'rtl' : 'ltr')
          )
            throw Error(JSON.stringify(check));
          await page.evaluate(
            (label) => {
              const banner = document.createElement('div');
              banner.textContent = label;
              banner.setAttribute('data-fixture-banner', 'true');
              Object.assign(banner.style, {
                position: 'relative',
                padding: '7px 10px',
                zIndex: '2147483647',
                background: '#fff8e8',
                color: '#553400',
                font: 'bold 11px system-ui',
                textAlign: 'center',
                borderTop: '1px solid #8a4b00',
              });
              document.body.prepend(banner);
            },
            locale === 'ar'
              ? 'معاينة محلية فقط · بيانات تجريبية · لا تمثل حسابات حقيقية'
              : 'LOCAL PRESENTATION FIXTURE · SYNTHETIC DATA · NOT REAL ACCOUNTS',
          );
          await page.evaluate(() => window.scrollTo(0, 0));
          if (
            [
              '/trainee/today',
              '/trainee/sessions/fixture-schedule/sequence',
              '/trainee/sessions/fixture-schedule/completion',
              '/trainee/support',
              '/trainee/completions/fixture-completion',
              '/trainee/completions/fixture-pending-schedule',
              '/trainee/sessions/fixture-confirmed-schedule/sequence',
              '/coach',
              '/coach/programs-sessions',
              '/coach/exercises',
              '/coach/admin',
              '/coach/sessions/fixture-session/prepare',
              '/coach/schedule-release',
              '/ops/incidents',
            ].includes(route)
          )
            await page.screenshot({
              path: path.join(
                output,
                `${route.slice(1).replaceAll('/', '-')}-${locale}-${viewport.width}.png`,
              ),
              fullPage: true,
            });
        }
      }
    }
    console.log(`Verified ${area}: ${routes.length * 4} synthetic presentation checks`);
  }
} catch (error) {
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  report.blockedOutbound = adapter.blocked;
  report.unexpectedProviderRequests = adapter.unexpected;
  report.syntheticPermissionCalls = adapter.permissionCalls;
  if (adapter.unexpected.length || report.errors.length || report.consoleErrors.length) {
    report.failure ??= 'Unexpected provider request or browser error detected.';
    process.exitCode = 1;
  }
  report.providerRequests = adapter.requests.length;
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      errors: report.errors,
      consoleErrors: report.consoleErrors,
      blockedOutbound: report.blockedOutbound,
      failure: report.failure,
    }),
  );
  if (browser) await browser.close();
  if (server) server.close();
  await app.close();
  globalThis.fetch = originalFetch;
}
