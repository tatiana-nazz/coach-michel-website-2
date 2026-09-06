import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { Brand } from '@/features/website/site-shell';
import type { WorkspaceArea } from './access';
import styles from './workspace.module.css';

const navigation = {
  trainee: [
    ['/trainee/today', 'Today', 'اليوم', '01'],
    ['/trainee/sessions', 'My training', 'تدريبي', '02'],
    ['/trainee/account', 'My account', 'حسابي', '03'],
    ['/trainee/support', 'Get support', 'المساعدة', '04'],
  ],
  coach: [
    ['/coach', 'Overview', 'نظرة عامة', '01'],
    ['/coach/trainees', 'Trainees', 'المتدرّبون', '02'],
    ['/coach/programs-sessions', 'Programs & sessions', 'البرامج والجلسات', '03'],
    ['/coach/exercises', 'Exercise library', 'مكتبة التمارين', '04'],
    ['/coach/schedule-release', 'Schedule & release', 'الجدولة والإتاحة', '05'],
    ['/coach/completions', 'Completed work', 'الإنجازات', '06'],
    ['/coach/admin', 'Administration', 'الإدارة', '07'],
  ],
  ops: [
    ['/ops/incidents', 'Incidents & recovery', 'الحوادث والاستعادة', '01'],
    ['/ops/incidents#support', 'Support requests', 'طلبات الدعم', '02'],
  ],
} as const;

export interface WorkspaceShellProps {
  readonly locale: SupportedLocale;
  readonly area: WorkspaceArea;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly path?: string;
}

export function WorkspaceShell({
  locale,
  area,
  title,
  description,
  children,
  path = '/workspace',
}: WorkspaceShellProps) {
  const ar = locale === 'ar';
  const areaName =
    area === 'trainee'
      ? ar
        ? 'مساحتك التدريبية'
        : 'YOUR TRAINING SPACE'
      : area === 'coach'
        ? ar
          ? 'مساحة المدرّب'
          : 'COACH WORKSPACE'
        : ar
          ? 'العمليات والدعم'
          : 'OPERATIONS';
  return (
    <div className={styles.workspace} dir={ar ? 'rtl' : 'ltr'} lang={locale}>
      <a className={styles.skip} href="#workspace-content">
        {ar ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <aside className={styles.sidebar}>
        <Link
          className={styles.brand}
          href="/"
          aria-label={ar ? 'كوتش ميشيل — الرئيسية' : 'Coach Michel — home'}
        >
          <Brand />
        </Link>
        <p className={styles.eyebrow}>{areaName}</p>
        <nav aria-label={ar ? 'قائمة مساحة العمل' : 'Workspace navigation'}>
          {navigation[area].map(([href, en, arabic, index]) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              <span className={styles.navNumber} aria-hidden="true">
                {index}
              </span>
              <span>{ar ? arabic : en}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarEnd}>
          <span className={styles.orbit} aria-hidden="true" />
          <p>{ar ? 'الهدف. الحركة. التقدّم.' : 'INTENT. MOVEMENT.\nPROGRESSION.'}</p>
          <Link href="/guidance">
            {ar ? 'دليل التدريب' : 'Training guide'} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </aside>
      <div className={styles.body}>
        <header className={styles.topbar}>
          <details className={styles.mobileMenu}>
            <summary>
              {ar ? 'القائمة' : 'Menu'} <span aria-hidden="true">+</span>
            </summary>
            <nav aria-label={ar ? 'قائمة الهاتف' : 'Mobile workspace navigation'}>
              {navigation[area].map(([href, en, arabic]) => (
                <Link key={href} href={href}>
                  {ar ? arabic : en}
                </Link>
              ))}
            </nav>
          </details>
          <span className={styles.topLabel}>
            COACH MICHEL <span aria-hidden="true">/</span> {areaName}
          </span>
          <div className={styles.actions}>
            <a
              href={`/language?locale=${ar ? 'en' : 'ar'}&next=${encodeURIComponent(path)}`}
              lang={ar ? 'en' : 'ar'}
            >
              {ar ? 'English' : 'العربية'}
            </a>
            <form action="/access/logout" method="post">
              <button type="submit">
                {ar ? 'خروج' : 'Sign out'} <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>
        </header>
        <main id="workspace-content" className={styles.main}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{areaName}</p>
            <h1>{title}</h1>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {children}
        </main>
        <footer className={styles.footer}>
          <Link href="/disclosures">{ar ? 'الإفصاحات والخصوصية' : 'Disclosures & privacy'}</Link>
          <span>COACH MICHEL © {new Date().getUTCFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}
